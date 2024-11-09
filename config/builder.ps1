function CheckDockerRunning {
    $dockerRunning = $false
    docker ps 2>$null
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
    }
    return $dockerRunning
}

If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Start-Process powershell.exe "-File",('"{0}"' -f $MyInvocation.MyCommand.Path) -Verb RunAs
  exit
}

Set-Location -Path $PSScriptRoot
Clear-Host

# Defaults for models
$OLLAMA_MODEL = "llama3.2"
$OLLAMA_EMBEDDING_MODEL = "nomic-embed-text"

Get-Content ../docker-config.env | ForEach-Object {
    if ($_ -match "^OLLAMA_MODEL\s*=\s*(.*)") {
        $OLLAMA_MODEL = $matches[1].Trim()
    }
    elseif ($_ -match "^OLLAMA_EMBEDDING_MODEL\s*=\s*(.*)") {
        $OLLAMA_EMBEDDING_MODEL = $matches[1].Trim()
    }
}

$gpuInfo = Get-WmiObject -Class Win32_VideoController | Where-Object {$_.Description -like '*NVIDIA*'}
$composeFilePath = "..\docker-compose-cpu.yaml"
if ($gpuInfo) {
    $composeFilePath = "..\docker-compose-gpu.yaml"
    Write-Host "NVIDIA GPU detected. Using GPU-enabled Docker Compose file..." -ForegroundColor Green
} else {
    Write-Host "No NVIDIA GPU detected. Using CPU-only Docker Compose file..." -ForegroundColor Yellow
}

Start-Sleep 5
Clear-Host

$continue = $true
while ($continue) {
    Clear-Host

    if (-not (CheckDockerRunning)) {
        Write-Host "Docker is not running. Check it manually"
        Write-Host -NoNewLine 'Press any key to close program...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    }

    docker-compose -f $composeFilePath down

    docker-compose -f $composeFilePath up ollama -d
    docker exec ollama ollama pull $OLLAMA_MODEL
    docker exec ollama ollama pull $OLLAMA_EMBEDDING_MODEL

    docker-compose -f $composeFilePath up --build -d
    docker builder prune -f
    docker image prune -f
    Start-Sleep 1
    docker ps

    Write-Output "`n"
    $response = Read-Host "Do you want to rebuild? (y/n)"
    if (!($response.ToLower().StartsWith('y'))) {
        docker-compose -f $composeFilePath down
        $continue = $false
        Write-Host "Exited."
    }
}