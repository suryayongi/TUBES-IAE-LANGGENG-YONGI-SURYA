@echo off
echo ========================================
echo   Lang Logistics - Starting...
echo ========================================
echo.

echo [1/3] Stopping existing containers...
docker compose down

echo.
echo [2/3] Building and starting all services...
docker compose up --build -d

echo.
echo [3/3] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   Services Status:
echo ========================================
docker compose ps

echo.
echo ========================================
echo   Access URLs:
echo ========================================
echo   Frontend:        http://localhost:3000
echo   Order Service:   http://localhost:8000
echo   Inventory:       http://localhost:8001
echo   Auth Service:    http://localhost:8002
echo   RabbitMQ:       http://localhost:15672
echo.
echo   RabbitMQ Login: guest / guest
echo.
echo ========================================
echo   To view logs: docker compose logs -f
echo   To stop:      stop.bat
echo ========================================
echo.
pause
