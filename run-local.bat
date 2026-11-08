@echo off
title CloudStore Launcher
echo ========================================================
echo  Iniciando CloudStore E-Commerce (Modo Local)
echo ========================================================
echo.

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo [1/2] Iniciando Backend FastAPI en puerto 8000...
start "CloudStore Backend (FastAPI)" cmd /k "cd /d "%BACKEND%" && call "%BACKEND%\venv\Scripts\activate.bat" && python -m uvicorn app.main:app --app-dir "%BACKEND%" --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Iniciando Frontend React en puerto 5173...
start "CloudStore Frontend (React)" cmd /k "cd /d "%FRONTEND%" && npm run dev"

echo.
echo ========================================================
echo  Todo listo!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://127.0.0.1:8000/docs
echo ========================================================
timeout /t 5
