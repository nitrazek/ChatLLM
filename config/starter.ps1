function Set-OpenUiOnStartup {
    param ([bool] $disable)

    $oldSettingsJson = "$env:APPDATA\Docker\settings.json"
    $newSettingsJson = "$env:APPDATA\Docker\settings-store.json"

    $settingsJson = $null
    if (Test-Path $newSettingsJson -PathType Leaf) {
        $settingsJson = $newSettingsJson
    } elseif (Test-Path $oldSettingsJson -PathType Leaf) {
        $settingsJson = $oldSettingsJson
    }

    if (-not $settingsJson) {
        if ($disable) {
            Write-Host "No Docker settings found. Switching to window mode..." -ForegroundColor Yellow
        }
        return
    }

    $settings = Get-Content $settingsJson | ConvertFrom-Json 
    if ($settings.openUIOnStartupDisabled -ne $disable) {
        if (!(Test-Path "$settingsJson.bak" -PathType Leaf)) {
            Write-Output "Creating backup file for docker desktop settings..."
            Copy-Item $settingsJson "$settingsJson.bak" -ErrorAction SilentlyContinue
        }
        $settings.openUIOnStartupDisabled = $disable
        $settings | ConvertTo-Json | Set-Content $settingsJson
    }
}

$executionPolicy = Get-ExecutionPolicy -Scope CurrentUser
If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Start-Process powershell.exe "-File",('"{0}"' -f $MyInvocation.MyCommand.Path) -Verb RunAs
  exit
}

Set-Location -Path $PSScriptRoot
Clear-Host
Write-Host "Scanning for Docker Desktop..."

$timeout = 90
$elapsedTime = 0
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Set-OpenUiOnStartup -disable $true
    Write-Output "Starting docker desktop..."
    Start-Process -FilePath $dockerPath

    $dockerReady = $false
    while (-not $dockerReady -and $elapsedTime -lt $timeout) {
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 1

        docker ps >$null 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
        }

        $elapsedTime++
    }
    Set-OpenUiOnStartup -disable $false

    Write-Host "."
    if ($dockerReady) {
        Write-Host "Docker Desktop is fully started and ready." -ForegroundColor Green
    } else {
        Write-Host "Docker Desktop failed to start within $timeout seconds. Please start it manually." -ForegroundColor Red
    }
} else {
    Write-Host "Couldn't find docker desktop in default location. Start it manually." -ForegroundColor Red
}

Write-Host -NoNewLine "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')