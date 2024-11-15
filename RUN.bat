@echo off

>nul 2>&1 net session || (
    powershell -Command "Start-Process -Verb RunAs '%0'"
    exit /b
)

setlocal enabledelayedexpansion
cls

set "COLOR_RESET=[0m"
set "COLOR_RED=[91m"
set "COLOR_GREEN=[92m"
set "COLOR_YELLOW=[93m"
set "COLOR_WHITE=[97m"

:run_start
if NOT exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
    echo %COLOR_RED%[x] Docker Desktop is not installed in default location.%COLOR_RESET%
    
    :installation_choice
    set /p choice=".    %COLOR_WHITE%Would you like to run the installation script? (Y/N): %COLOR_RESET%"
    IF NOT "!choice!"=="" SET choice=!choice:~0,1!
    if "!choice!"=="" set choice=Y
    if /i "!choice!"=="Y" (
        echo.    %COLOR_YELLOW%Running the installation script...%COLOR_RESET%
        timeout /t 3 /nobreak > nul
        powershell -ExecutionPolicy Bypass -File "%~dp0config\installer.ps1"
        cls
        goto run_start
    ) else if /i "!choice!"=="N" (
        echo.    %COLOR_RED%Unable to proceed without Docker Desktop installed. %COLOR_RESET%
        echo.    %COLOR_WHITE%Press any key to exit...%COLOR_RESET%
        pause > nul
        exit /b
    ) else (
        echo.    %COLOR_YELLOW%Invalid input. Please enter Y or N.%COLOR_RESET%
        goto installation_choice
    )
) else (
    echo %COLOR_GREEN%[+] Docker Desktop is installed.%COLOR_RESET%
)

docker info >null 2>&1
if %errorlevel% neq 0 (
    echo %COLOR_RED%[x] Docker Desktop is not running. Starting...
    :starting_choice
    set /p choice=".    %COLOR_WHITE%Would you like to run the starting script? (Y/N): %COLOR_RESET%"
    IF NOT "!choice!"=="" SET choice=!choice:~0,1!
    if "!choice!"=="" set choice=Y
    if /i "!choice!"=="Y" (
        echo.    %COLOR_YELLOW%Running the starting script...%COLOR_RESET%
        timeout /t 3 /nobreak > nul
        powershell -ExecutionPolicy Bypass -File "%~dp0config\starter.ps1"
        cls
        goto run_start
    ) else if /i "!choice!"=="N" (
        echo.    %COLOR_RED%Unable to proceed without Docker Desktop running. Please start it manually.%COLOR_RESET%
        echo.    %COLOR_WHITE%Press any key to exit...%COLOR_RESET%
        pause > nul
        exit /b
    ) else (
        echo.    %COLOR_YELLOW%Invalid input. Please enter Y or N.%COLOR_RESET%
        goto starting_choice
    )
) else (
    echo %COLOR_GREEN%[+] Docker Desktop is already running.%COLOR_RESET%
)

echo.
echo %COLOR_WHITE%Running the starting script...%COLOR_RESET%
timeout /t 3 /nobreak > nul
powershell -ExecutionPolicy Bypass -File "%~dp0config\builder.ps1"
endlocal