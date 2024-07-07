@echo off

>nul 2>&1 net session || (
    powershell -Command "Start-Process -Verb RunAs '%0'"
    exit /b
)

setlocal enabledelayedexpansion
cls

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    :ask
    echo Docker is not running or not installed.
    set response=
    set /p "response=Do you want to run health check? (y/n): "
    IF NOT '!response!'=='' SET response=!response:~0,1!
    if /i "!response!"=="Y" goto run
    if /i "!response!"=="N" goto abort
    cls
    goto ask

    :run
    powershell -ExecutionPolicy Bypass -File "%~dp0config\installer.ps1"
    docker ps >nul 2>&1
    if %errorlevel% neq 0 exit /b
    goto build

    :abort
    echo Unable to continue without Docker running.
    pause
    exit /b
)


:build
cls
powershell -ExecutionPolicy Bypass -File "%~dp0config\builder.ps1"