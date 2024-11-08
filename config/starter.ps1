function Set-OpenUiOnStartup {
    param ([bool] $disable)

    $settingsJson = "$env:APPDATA\Docker\settings.json"
    if (!(Test-Path $settingsJson -PathType Leaf)) {
        if ($disable) {
            Write-Host "    No Docker settings found. Switching to window mode..." -ForegroundColor Yellow
        }
        return
    }

    $settings = Get-Content $settingsJson | ConvertFrom-Json 
    if ($settings.openUIOnStartupDisabled -ne $disable) {
        if (!(Test-Path "$settingsJson.bak" -PathType Leaf)) {
            Write-Output "    Creating backup file for docker desktop settings..."
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

$maxWaitTime = 120 
$waitInterval = 5
$elapsedTime = 0

if (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe") {
    Set-OpenUiOnStartup -disable $true
    Write-Output "Starting docker desktop..."
    Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Sleep 5
    Set-OpenUiOnStartup -disable $false

    while ($elapsedTime -lt $maxWaitTime) {
        try {
            docker info >$null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Docker Desktop is fully started and ready." -ForegroundColor Green
                break
            }
        } catch {}

        Start-Sleep -Seconds $waitInterval
        $elapsedTime += $waitInterval

        if ($elapsedTime -ge $maxWaitTime) {
            Write-Host "Docker Desktop failed to start within the expected time limit." -ForegroundColor Red
            Write-Host -NoNewLine 'Press any key to continue...'
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
            exit
        }

        Write-Host "Waiting for Docker Desktop... [$elapsedTime/$maxWaitTime sec]" -ForegroundColor Yellow
    }
} else {
    Write-Host "Couldn't find docker desktop in default location. Start it manually." -ForegroundColor Red
    Write-Host -NoNewLine 'Press any key to continue...'
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

Write-Host -NoNewLine "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')