@echo off
echo ========================================================
echo Starting SmartVoyage AI - Mobile Frontend (Expo Web)
echo ========================================================

cd /d "%~dp0\..\mobile"

echo Starting Expo Metro Bundler on http://localhost:8081 ...
npx expo start --web --port 8081
pause
