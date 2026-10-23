@echo off
echo ========================================================
echo Launching SmartVoyage AI (Backend + Mobile Frontend)
echo ========================================================

cd /d "%~dp0\.."

echo Launching Backend server in background window...
start "SmartVoyage Backend" cmd /c "%~dp0\run_backend.bat"

timeout /t 3 /nobreak >nul

echo Launching Mobile Frontend in browser...
start "SmartVoyage Frontend" cmd /c "%~dp0\run_mobile.bat"

echo Both services launched!
echo Backend Docs: http://127.0.0.1:8000/docs
echo Web Frontend: http://localhost:8081
pause
