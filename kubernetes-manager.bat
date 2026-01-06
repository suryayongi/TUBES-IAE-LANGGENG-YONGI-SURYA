@echo off
title KUBERNETES MANAGER - IAE TUBES
cls

:menu
cls
echo ========================================================
echo    CONTROL PANEL KUBERNETES (K8S)
echo ========================================================
echo 1. BUILD IMAGE  (Wajib jika kodingan berubah)
echo 2. DEPLOY APPS  (Nyalakan semua service)
echo 3. MATIKAN APPS (Hapus deployment)
echo 4. CEK STATUS   (Lihat apakah error/running)
echo 5. LIHAT LOGS   (Cek log per service)
echo 6. HAPUS PODS   (Restart paksa container)
echo 7. KELUAR
echo ========================================================
set /p pilihan="Pilih menu [1-7]: "

if "%pilihan%"=="1" goto build
if "%pilihan%"=="2" goto deploy
if "%pilihan%"=="3" goto delete
if "%pilihan%"=="4" goto status
if "%pilihan%"=="5" goto logs
if "%pilihan%"=="6" goto restart
if "%pilihan%"=="7" exit
echo Pilihan salah.
pause
goto menu

:build
cls
echo [INFO] Membangun ulang Image Docker untuk Kubernetes...
echo -------------------------------------------------------
echo 1/4 Building Frontend...
docker build -t frontend:latest ./frontend
echo 2/4 Building Auth Service...
docker build -t auth-service:latest ./auth-service
echo 3/4 Building Inventory Service...
docker build -t inventory-service:latest ./inventory-service
echo 4/4 Building Order Service...
docker build -t order-service:latest ./order-service
echo.
echo [SUCCESS] Semua Image berhasil di-update!
pause
goto menu

:deploy
cls
echo [INFO] Mengirim perintah ke Kubernetes...
kubectl apply -f k8s/
echo.
echo [SUCCESS] Perintah terkirim! Tunggu sebentar sampai status Running.
echo Cek di menu 4 (Cek Status).
pause
goto menu

:delete
cls
echo [WARNING] Mematikan semua service di Kubernetes...
kubectl delete -f k8s/
echo.
echo [INFO] Semua service telah dimatikan.
pause
goto menu

:status
cls
echo [INFO] Status Pods saat ini:
echo -------------------------------------------------------
kubectl get pods
echo.
echo [INFO] Status Services (IP & Port):
echo -------------------------------------------------------
kubectl get services
echo.
pause
goto menu

:logs
cls
echo Pilih service yang mau dilihat log-nya:
echo 1. Inventory Service
echo 2. Order Service
echo 3. Frontend
echo 4. Kembali
set /p log_pilihan="Pilih [1-4]: "

if "%log_pilihan%"=="1" (
    echo Menampilkan log Inventory...
    kubectl logs -l app=inventory-service -f
    goto logs
)
if "%log_pilihan%"=="2" (
    echo Menampilkan log Order...
    kubectl logs -l app=order-service -f
    goto logs
)
if "%log_pilihan%"=="3" (
    echo Menampilkan log Frontend...
    kubectl logs -l app=frontend -f
    goto logs
)
goto menu

:restart
cls
echo [INFO] Menghapus Pods (Kubernetes akan otomatis bikin baru)...
kubectl delete pods --all
echo.
echo [SUCCESS] Pods dihapus. Kubernetes sedang me-restart container baru...
pause
goto menu