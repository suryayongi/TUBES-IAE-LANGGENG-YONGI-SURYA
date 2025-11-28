@echo off
title SCM Microservices Launcher - Tubes EAI
cls
echo ========================================================
echo    TUBES SCM MICROSERVICES - AUTO LAUNCHER
echo ========================================================
echo.

REM 1. Cek Docker
echo [*] Mengecek status Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [X] ERROR: Docker Desktop belum nyala!
    echo     Tolong nyalakan Docker Desktop dulu, baru jalankan file ini lagi.
    pause
    exit
)
echo [V] Docker siap.

REM 2. Bersih-bersih
echo.
echo [*] Membersihkan container lama...
docker-compose down

REM 3. Build & Run
echo.
echo [*] Membangun dan menyalakan semua service...
echo     (Tunggu sebentar, sedang meracik kodingan...)
docker-compose up --build -d

if %errorlevel% neq 0 (
    color 0C
    echo [X] Gagal! Pastikan kamu menjalankan file ini di folder yang ada docker-compose.yml
    pause
    exit
)

REM 4. Info Akses
cls
echo ========================================================
echo [V] ALHAMDULILLAH, SISTEM SUDAH JALAN!
echo ========================================================
echo.
echo Silakan akses URL berikut:
echo [1] Frontend Dashboard : http://localhost:3000  (Utama)
echo [2] RabbitMQ Admin     : http://localhost:15672 (User/Pass: guest)
echo [3] Order Service Docs : http://localhost:8000/docs
echo [4] Inventory Docs     : http://localhost:8001/docs
echo.
echo ========================================================
echo Membuka Frontend otomatis dalam 3 detik...
timeout /t 3 >nul
start http://localhost:3000

echo.
echo [*] Menampilkan LOG AKTIVITAS (Order & Inventory)...
echo     (Perhatikan log di bawah ini saat kamu klik Order di web)
echo     Tekan Ctrl+C jika ingin menutup jendela ini.
echo.
echo ========================================================
docker-compose logs -f order-service inventory-service