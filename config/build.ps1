function CheckDockerRunning {
    $dockerRunning = $false
    try {
        docker ps 2>$null
        if ($LASTEXITCODE -eq 0) {
            $dockerRunning = $true
        }
    } catch {
        
    }
    return $dockerRunning
}

$executionPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($executionPolicy -ne "RemoteSigned" -and $executionPolicy -ne "Bypass") {
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force
}

set-executionpolicy -scope CurrentUser -executionPolicy Bypass -Force
If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Start-Process powershell.exe "-File",('"{0}"' -f $MyInvocation.MyCommand.Path) -Verb RunAs
  exit
}

$continue = $true
while ($continue) {
    Clear-Host

    if (-not (CheckDockerRunning)) {
        Write-Host "Docker is still not running. Check it manually"
        Write-Host -NoNewLine 'Press any key to close program...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    }

    docker-compose -f .\docker-compose.yaml down
    docker-compose -f .\docker-compose.yaml up --build -d
    docker image prune -f
    docker ps

    Write-Output "`n"
    $response = Read-Host "Do you want to rebuild? (y/n)"
    if (!($response.ToLower().StartsWith('y'))) {
        $continue = $false
        Write-Host "Exited."
    }
}