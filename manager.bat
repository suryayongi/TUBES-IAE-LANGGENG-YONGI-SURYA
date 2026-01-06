@echo off
title DOCKER MANAGER - IAE TUBES
cls

:menu
cls
echo ========================================================
echo    CONTROL PANEL DOCKER (LANGGENG - YONGI - SURYA)
echo ========================================================
echo 1. BUILD ULANG  (Wajib jika ada perubahan kodingan)
echo 2. START APP    (Compose Up --build)
echo 3. MATIKAN APP  (Compose Down)
echo 4. STOP PAUSE   (Stop container tanpa hapus)
echo 5. LIHAT LOGS   (Cek error/status running)
echo 6. RESET TOTAL  (Hapus container + volume data)
echo 7. KELUAR
echo ========================================================
set /p pilihan="Pilih menu [1-7]: "

if "%pilihan%"=="1" goto build
if "%pilihan%"=="2" goto up
if "%pilihan%"=="3" goto down
if "%pilihan%"=="4" goto stop
if "%pilihan%"=="5" goto logs
if "%pilihan%"=="6" goto clean
if "%pilihan%"=="7" exit
echo Pilihan salah, coba lagi.
pause
goto menu

:build
cls
echo [INFO] Membangun ulang image Docker...
docker-compose build
echo [INFO] Selesai build.
pause
goto menu

:up
cls
echo [INFO] Menjalankan aplikasi (Detached Mode)...
docker-compose up -d --build
echo.
echo [SUCCESS] Aplikasi berjalan di background!
echo - Dashboard: http://localhost:3000
echo - Database : http://localhost/phpmyadmin (XAMPP)
echo.
pause
goto menu

:down
cls
echo [INFO] Mematikan dan menghapus container...
docker-compose down
echo [INFO] Aplikasi dimatikan.
pause
goto menu

:stop
cls
echo [INFO] Menghentikan container sementara...
docker-compose stop
echo [INFO] Container berhenti.
pause
goto menu

:logs
cls
echo [INFO] Menampilkan Logs Realtime...
echo (Tekan CTRL + C untuk kembali ke menu)
echo.
docker-compose logs -f
goto menu

:clean
cls
color 4f
echo [WARNING] INI AKAN MENGHAPUS SEMUA DATA DOCKER VOLUME!
echo Pastikan kamu yakin.
pause
color 07
docker-compose down -v
echo [INFO] Bersih total.
pause
goto menu