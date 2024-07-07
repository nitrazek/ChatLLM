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

$hyperv = Get-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V-All -Online -ErrorAction SilentlyContinue
if($hyperv.State -eq "Enabled") {
    Write-Host "[+] Hyper-V is already enabled." -ForegroundColor Green
} else {
    Write-Host "[x] Hyper-V is not enabled." -ForegroundColor Yellow
    $response = Read-Host -Prompt "    Do you want to install Hyper-V? (y/n)"
    if ($response -eq 'y') {
        Write-Output "    Enabling, please wait..."
        try {
            $ProgressPreference = 'SilentlyContinue'
            Enable-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V-All -Online -ErrorAction SilentlyContinue

            Write-Output "    Downloading necessary features... (estimated 30s)"
            Start-Sleep 30

            Write-Host "    Hyper-V is enabled now. Reboot the system to continue the installation.`n" -ForegroundColor Green
            Write-Host -NoNewLine '    Press any key to close program...'
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
            exit
        } catch {
            Write-Host "    Failed to enable Hyper-V." -ForegroundColor Red
            Write-Host "    It's likely that this computer does not support Hyper-V." -ForegroundColor Red
            $response = Read-Host -Prompt "    Do you want to continue anyway? It may cause problems. (y/n)"
            if ($response -ne 'y') {
                Write-Host "    Script aborted. Try enabling Hyper-V manually." -ForegroundColor Yellow
                Write-Host -NoNewLine '    Press any key to close program...'
                $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
                exit
            } else {
                Write-Output "    Continuing...`n"
            }
        }
    } else {
        Write-Output "    Skipping installation...`n"
    }
}

$wsl = Get-WindowsOptionalFeature -FeatureName Microsoft-Windows-Subsystem-Linux -Online -ErrorAction SilentlyContinue
if($wsl.State -eq "Enabled") {
    Write-Host "[+] WSL2 is already enabled." -ForegroundColor Green
} else {
    Write-Host "[x] WSL2 is not enabled." -ForegroundColor Yellow -ErrorAction SilentlyContinue
    $response = Read-Host -Prompt "    Do you want to install WSL2? (y/n)"
    if ($response -eq 'y') {
        Write-Output "    Enabling, please wait..."
        try {
            $ProgressPreference = 'SilentlyContinue'
            Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All -NoRestart
            Enable-WindowsOptionalFeature -FeatureName VirtualMachinePlatform -Online -All -NoRestart

            Write-Output "    Downloading necessary features... (estimated 30s)"
            Start-Sleep 30

            Write-Host "    WSL2 is enabled now. Reboot the system to continue the installation.`n" -ForegroundColor Green
            Write-Host -NoNewLine 'Press any key to close program...'
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
            exit
        } catch {
            Write-Host "    Failed to enable WSL2." -ForegroundColor Red
            Write-Host "    It's likely that this computer does not support WSL2." -ForegroundColor Red
            $response = Read-Host -Prompt "    Do you want to continue anyway? It may cause problems. (y/n)"
            if ($response -ne 'y') {
                Write-Host "    Script aborted. Try enabling WSL2 manually." -ForegroundColor Yellow
                Write-Host -NoNewLine '    Press any key to close program...'
                $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
                exit
            } else {
                Write-Output "    Continuing...`n"
            }
        }
    } else {
        Write-Output "    Skipping installation...`n"
    }
}

$dockerInstalled = Get-Command -Name docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "[x] Docker Desktop is not installed. Starting installation..." -ForegroundColor Yellow

    $installerUrl = "https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe"
    $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"
    $installerOutputPath = "$env:TEMP\installer_errors.log"
    $ProgressPreference = 'SilentlyContinue'

    Write-Output "    Downloading Docker Desktop installer..."
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

    Write-Output "    Installing Docker Desktop..."
    $process = Start-Process -FilePath $installerPath -Wait -PassThru -RedirectStandardError $installerOutputPath
    Remove-Item -Path $installerPath -Force -ErrorAction SilentlyContinue

    if ($process.ExitCode -eq 0) {
        Remove-Item -Path $installerOutputPath -Force -ErrorAction SilentlyContinue
        Write-Host "    Docker Desktop installation completed. Reboot the system to continue the installation.`n" -ForegroundColor Green
        Write-Host -NoNewLine '    Press any key to close program...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    } else {
        $currentPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $outputFileName = "installer_output_$timestamp.log"

        Move-Item -Path $installerOutputPath -Destination (Join-Path -Path $currentPath -ChildPath $outputFileName) -Force

        Write-Host "    Docker Desktop installation failed.`n" -ForegroundColor Red
        Write-Host "    Installation logs have been saved in the current folder:" -ForegroundColor Yellow
        Write-Host "      Errors log: .\$outputFileName`n"
        Write-Host -NoNewLine '    Press any key to close program...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    }
} else {
    Write-Host "[+] Docker Desktop is already installed." -ForegroundColor Green
}

$dockerOutput = docker ps 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] Docker is running." -ForegroundColor Green
} else {
    Write-Host "[x] Docker is not running " -ForegroundColor Yellow
    if (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe") {
        Set-OpenUiOnStartup -disable $true
        Write-Output "    Starting docker desktop..."
        Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Start-Sleep 10
        Set-OpenUiOnStartup -disable $false
        Write-Host "    Started docker desktop.`n" -ForegroundColor Green
    } else {
        Write-Host "    Couldn't find docker desktop in default location. Start it manually." -ForegroundColor Red
        Write-Host -NoNewLine '    Press any key to continue...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    }
}

$gpuInfo = Get-WmiObject -Class Win32_VideoController | Where-Object {$_.Description -like '*NVIDIA*'}
if ($gpuInfo) {
    Write-Host "[+] NVIDIA GPU detected." -ForegroundColor Green
    Write-Host "`nComputer is ready to run this software!" -ForegroundColor Green
} else {
    Write-Host "[x] No NVIDIA GPU detected." -ForegroundColor Yellow
    Write-Host "`nComputer is ready to run this software, but it may experience performance issues." -ForegroundColor Yellow
}

Write-Host -NoNewLine "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
