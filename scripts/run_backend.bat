@echo off
echo ========================================================
echo Starting SmartVoyage AI - Backend Server (FastAPI)
echo ========================================================

cd /d "%~dp0\.."

REM Activate virtualenv if present
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

echo Starting Uvicorn on http://127.0.0.1:8000 ...
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
pause
