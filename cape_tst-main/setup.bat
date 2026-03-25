@echo off
title CAPE - Setup & Installation
color 0A

echo ========================================
echo   CAPE - Child Protection App Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is already installed
    node --version
    goto :install_deps
)

echo [!] Node.js is not installed
echo.
echo Would you like to download Node.js installer?
echo.
choice /C YN /M "Download Node.js installer now"
if %ERRORLEVEL% EQU 2 goto :no_nodejs

echo.
echo Opening Node.js download page...
echo Please download and install Node.js, then run this script again.
start https://nodejs.org/en/download/
pause
exit /b 0

:no_nodejs
echo.
echo [ERROR] Node.js is required to run CAPE in development mode.
echo.
echo Alternative: Build production version on another computer
echo             and copy the 'dist-package' folder here.
echo.
pause
exit /b 1

:install_deps
echo.
echo ========================================
echo   Installing Dependencies
echo ========================================
echo.

if exist "node_modules\" (
    echo [OK] Dependencies already installed
    goto :done
)

echo Installing required packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

:done
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo You can now start CAPE using:
echo   - Double-click: CAPE.vbs (silent start)
echo   - Double-click: start-cape.bat (with console)
echo.
echo To build production version:
echo   - Double-click: build-production.bat
echo.
pause
