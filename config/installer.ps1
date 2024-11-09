If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Start-Process powershell.exe "-File",('"{0}"' -f $MyInvocation.MyCommand.Path) -Verb RunAs
  exit
}

Set-Location -Path $PSScriptRoot
Clear-Host

$wsl = Get-WindowsOptionalFeature -FeatureName Microsoft-Windows-Subsystem-Linux -Online -ErrorAction SilentlyContinue
if($wsl.State -eq "Enabled") {
    Write-Host "[+] WSL2 is already enabled." -ForegroundColor Green
} else {
    Write-Host "[x] WSL2 is not enabled." -ForegroundColor Yellow -ErrorAction SilentlyContinue
    Write-Output "    Enabling, please wait..."
    try {
        $ProgressPreference = 'SilentlyContinue'
        Write-Output "    Downloading necessary features..."
        wsl --install --no-distribution

        Start-Sleep 10

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
