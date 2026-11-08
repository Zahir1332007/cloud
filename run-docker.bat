@echo off
echo ========================================================
echo  Iniciando CloudStore E-Commerce con Docker Compose
echo  (Entorno identico al despliegue en AWS EC2)
echo ========================================================
echo.
docker compose up -d --build
echo.
echo ========================================================
echo  Servicios levantados con exito!
echo  - Frontend Web:        http://localhost
echo  - Backend API Docs:    http://localhost/docs
echo  - AWS Health Check:    http://localhost/api/v1/health
echo ========================================================
pause
