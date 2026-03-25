@echo off
title CAPE - Complete Package Builder
color 0B

echo ========================================
echo   CAPE - Complete Package Builder
echo ========================================
echo.
echo This will create a complete package that includes:
echo   - Built application (production)
echo   - Launcher scripts
echo   - Installation guide
echo.
echo Users will only need a web browser!
echo.
pause

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules\" (
    echo [1/4] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo [1/4] Dependencies OK
)

REM Build application
echo [2/4] Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

REM Create package folder
echo [3/4] Creating package...
if exist "CAPE-Package\" rmdir /S /Q CAPE-Package
mkdir CAPE-Package
mkdir CAPE-Package\app

REM Copy files
xcopy /E /I /Y dist CAPE-Package\app >nul
copy start-production.bat CAPE-Package\ >nul
copy INSTALLATION.md CAPE-Package\README.txt >nul

REM Create simple launcher
echo @echo off > CAPE-Package\START-CAPE.bat
echo title CAPE - Child Protection App >> CAPE-Package\START-CAPE.bat
echo cd /d "%%~dp0" >> CAPE-Package\START-CAPE.bat
echo. >> CAPE-Package\START-CAPE.bat
echo echo ======================================== >> CAPE-Package\START-CAPE.bat
echo echo   CAPE - Starting... >> CAPE-Package\START-CAPE.bat
echo echo ======================================== >> CAPE-Package\START-CAPE.bat
echo echo. >> CAPE-Package\START-CAPE.bat
echo. >> CAPE-Package\START-CAPE.bat
echo REM Try Python first >> CAPE-Package\START-CAPE.bat
echo where python ^>nul 2^>nul >> CAPE-Package\START-CAPE.bat
echo if %%ERRORLEVEL%% EQU 0 ( >> CAPE-Package\START-CAPE.bat
echo     echo Starting CAPE with Python... >> CAPE-Package\START-CAPE.bat
echo     start "" http://localhost:8080 >> CAPE-Package\START-CAPE.bat
echo     timeout /t 2 /nobreak ^>nul >> CAPE-Package\START-CAPE.bat
echo     cd app >> CAPE-Package\START-CAPE.bat
echo     python -m http.server 8080 >> CAPE-Package\START-CAPE.bat
echo     goto :end >> CAPE-Package\START-CAPE.bat
echo ) >> CAPE-Package\START-CAPE.bat
echo. >> CAPE-Package\START-CAPE.bat
echo echo [ERROR] Python not found! >> CAPE-Package\START-CAPE.bat
echo echo. >> CAPE-Package\START-CAPE.bat
echo echo Please install Python from: https://www.python.org/downloads/ >> CAPE-Package\START-CAPE.bat
echo echo. >> CAPE-Package\START-CAPE.bat
echo pause >> CAPE-Package\START-CAPE.bat
echo exit /b 1 >> CAPE-Package\START-CAPE.bat
echo. >> CAPE-Package\START-CAPE.bat
echo :end >> CAPE-Package\START-CAPE.bat

REM Create README
echo ======================================== > CAPE-Package\START-HERE.txt
echo   CAPE - Child Protection App >> CAPE-Package\START-HERE.txt
echo ======================================== >> CAPE-Package\START-HERE.txt
echo. >> CAPE-Package\START-HERE.txt
echo HOW TO START: >> CAPE-Package\START-HERE.txt
echo. >> CAPE-Package\START-HERE.txt
echo 1. Double-click: START-CAPE.bat >> CAPE-Package\START-HERE.txt
echo 2. Browser will open automatically >> CAPE-Package\START-HERE.txt
echo 3. Start using CAPE! >> CAPE-Package\START-HERE.txt
echo. >> CAPE-Package\START-HERE.txt
echo REQUIREMENTS: >> CAPE-Package\START-HERE.txt
echo - Windows 10/11 >> CAPE-Package\START-HERE.txt
echo - Python 3.x (usually pre-installed) >> CAPE-Package\START-HERE.txt
echo - Any web browser >> CAPE-Package\START-HERE.txt
echo. >> CAPE-Package\START-HERE.txt
echo If Python is not installed: >> CAPE-Package\START-HERE.txt
echo Download from: https://www.python.org/downloads/ >> CAPE-Package\START-HERE.txt
echo. >> CAPE-Package\START-HERE.txt
echo For more details, see README.txt >> CAPE-Package\START-HERE.txt
echo. >> CAPE-Package\START-HERE.txt

echo [4/4] Package created successfully!
echo.
echo ========================================
echo   Package Ready!
echo ========================================
echo.
echo Location: CAPE-Package\
echo.
echo To distribute:
echo 1. Zip the 'CAPE-Package' folder
echo 2. Share with users
echo 3. Users extract and double-click START-CAPE.bat
echo.
echo Package size: ~2-5 MB
echo Requirements: Windows + Python (or any web browser)
echo.
pause
