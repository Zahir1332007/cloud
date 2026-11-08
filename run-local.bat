@echo off
echo ========================================================
echo  Iniciando CloudStore E-Commerce (Modo Local Nativo)
echo ========================================================
echo.

cd /d "%~dp0backend"
if not exist "venv" (
    echo Creando entorno virtual de Python...
    python -m venv venv
    call venv\Scripts\activate
    echo Instalando dependencias del backend...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echo Iniciando Backend FastAPI en segundo plano...
start "CloudStore Backend (FastAPI)" cmd /k "call venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    call npm install
)

echo Iniciando Frontend React (Vite)...
start "CloudStore Frontend (React)" cmd /k "npm run dev"

echo.
echo ========================================================
echo  Aplicacion iniciada en terminales separadas!
echo  - Frontend:   http://localhost:5173
echo  - Backend:    http://localhost:8000/docs
echo ========================================================
echo Presiona cualquier tecla para salir de este lanzador.
pause > nul
