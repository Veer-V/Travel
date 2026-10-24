@echo off
echo ========================================================
echo SmartVoyage AI - Instant Public Showcase Link Generator
echo ========================================================
echo.
echo Starting secure public HTTPS tunnel to your live application (Port 8000)...
echo Anyone with this link will be able to access your full Web App and APIs!
echo.
echo Press Ctrl+C anytime to stop sharing.
echo ========================================================
echo.

npx -y localtunnel --port 8000

pause
