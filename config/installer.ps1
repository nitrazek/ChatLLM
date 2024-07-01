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
    Write-Host "[x] Hyper-V is not enabled. Enabling Hyper-V feature..." -ForegroundColor Yellow

    try {
        Enable-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V-All -Online -ErrorAction SilentlyContinue
    } catch {
        Write-Host "Failed to enable Hyper-V." -ForegroundColor Red
        Write-Host "It's likely that this computer does not support Hyper-V. Try enabling it manually." -ForegroundColor Red
        Write-Host -NoNewLine 'Press any key to close program...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    }
    Write-Output "Downloading necessary features... (estimated 30s)"
    Start-Sleep 30

    Write-Host "Hyper-V is enabled now. Reboot the system to continue the installation.`n" -ForegroundColor Green
    Write-Host -NoNewLine 'Press any key to close program...'
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit
}

$wsl = Get-WindowsOptionalFeature -FeatureName Microsoft-Windows-Subsystem-Linux -Online -ErrorAction SilentlyContinue
if($wsl.State -eq "Enabled") {
    Write-Host "[+] WSL2 is already enabled." -ForegroundColor Green
} else {
    Write-Host "[x] WSL2 is not enabled. Enabling WSL2 feature..." -ForegroundColor Yellow -ErrorAction SilentlyContinue

    try {
        Enable-WindowsOptionalFeature -FeatureName VirtualMachinePlatform -Online -All -NoRestart
    } catch {
        Write-Host "Failed to enable WSL2." -ForegroundColor Red
        Write-Host "It's likely that this computer does not support WSL2. Try enabling it manually." -ForegroundColor Red
        Write-Host -NoNewLine 'Press any key to close program...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    }
    Write-Output "Downloading necessary features... (estimated 30s)"
    Start-Sleep 30

    Write-Host "WSL2 is enabled now. Reboot the system to continue the installation.`n" -ForegroundColor Green
    Write-Host -NoNewLine 'Press any key to close program...'
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit
}

$dockerInstalled = Get-Command -Name docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "[x] Docker Desktop is not installed. Starting installation..." -ForegroundColor Yellow

    $installerUrl = "https://desktop.docker.com/win/stable/Docker%20Desktop%20Installer.exe"
    $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"
    $installerOutputPath = "$env:TEMP\installer_errors.log"
    $ProgressPreference = 'SilentlyContinue'

    Write-Output "Downloading Docker Desktop installer..."
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

    Write-Output "Installing Docker Desktop..."
    $process = Start-Process -FilePath $installerPath -Wait -PassThru -RedirectStandardError $installerOutputPath
    Remove-Item -Path $installerPath -Force -ErrorAction SilentlyContinue

    if ($process.ExitCode -eq 0) {
        Write-Host "Docker Desktop installation completed.`n" -ForegroundColor Green
    } else {
        $currentPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $outputFileName = "installer_output_$timestamp.log"

        Move-Item -Path $installerOutputPath -Destination (Join-Path -Path $currentPath -ChildPath $outputFileName) -Force

        Write-Host "Docker Desktop installation failed.`n" -ForegroundColor Red
        Write-Host "Installation logs have been saved in the current folder:" -ForegroundColor Yellow
        Write-Host "  Errors log: .\$outputFileName"
        Write-Host -NoNewLine 'Press any key to close program...'
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    }

    Remove-Item -Path $installerOutputPath -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $installerErrorsPath -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "[+] Docker Desktop is already installed." -ForegroundColor Green
}

$dockerOutput = docker ps 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] Docker is running." -ForegroundColor Green
} else {
    Write-Host "[x] Docker is not running " -ForegroundColor Yellow
    Write-Output "Starting docker desktop..."
    if (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe") {
        Start-Process -FilePath "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ArgumentList "--run-background"
        Start-Sleep 10
        Write-Host "Started docker desktop.`n" -ForegroundColor Green
    } else {
        Write-Host "Couldn't find docker desktop in default location. Start it manually." -ForegroundColor Red
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

Write-Host -NoNewLine 'Press any key to close program...'
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
