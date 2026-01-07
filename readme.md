# Supply Chain Management (SCM) Microservices System

Dokumentasi ini disusun sebagai laporan Tugas Besar mata kuliah **Integrasi Aplikasi Enterprise (IAE)**. Proyek ini mendemonstrasikan implementasi sistem manajemen rantai pasok modern menggunakan arsitektur Microservices yang terdistribusi, Containerization, dan Orchestration.

---

## 👨‍💻 Identitas Developer

**Nama** : Langgeng Yongi Surya  
**NIM** : 102022300019  
**Kelas** : SI - 47 - 04  

---

## 📖 Deskripsi Sistem

Aplikasi ini dirancang untuk menangani kompleksitas integrasi data antar layanan dalam sebuah perusahaan logistik. Sistem memisahkan logika bisnis menjadi beberapa layanan independen (*microservices*) yang berkomunikasi secara asinkron menggunakan *Message Broker*. Hal ini memungkinkan pemrosesan pesanan dan pembaruan stok terjadi secara *real-time* namun tetap menjaga independensi antar layanan.

### Arsitektur Layanan
Sistem terdiri dari komponen-komponen berikut:
* **Frontend Service**: Antarmuka pengguna berbasis **Next.js** untuk monitoring dan transaksi.
* **Auth Service**: Layanan keamanan (**Python FastAPI**) untuk validasi akses Admin dan Staff.
* **Inventory Service**: Backend utama pengelola stok yang terhubung ke Database dan mendengarkan pesan dari RabbitMQ.
* **Order Service**: Layanan penerima pesanan yang bertindak sebagai *Publisher* pesan ke antrian.
* **RabbitMQ**: Middleware untuk komunikasi data asinkron antar layanan.
* **Database**: Penyimpanan data persisten menggunakan **MySQL** (Terintegrasi via XAMPP/Host).

---

## 🌟 Fitur Fungsional (CRUD)

Sistem ini mengimplementasikan operasi data lengkap yang terdistribusi:

### 1. Create (Pembuatan Data)
* **Registrasi Barang**: Admin dapat mendaftarkan SKU/Item baru ke dalam katalog sistem.
* **Order Transaction**: Pencatatan transaksi pesanan baru yang memicu event pemotongan stok otomatis.

### 2. Read (Pembacaan & Monitoring)
* **Real-time Stock Monitoring**: Menampilkan jumlah ketersediaan barang terkini dari database.
* **Audit Log & History**: Menyajikan riwayat aktivitas lengkap (Siapa yang order, kapan restock dilakukan, dll).

### 3. Update (Pembaruan Data)
* **Restock Inventory**: Fitur untuk menambah kuantitas stok barang yang sudah ada.
* **Auto-Sync Stock**: Mekanisme otomatis pengurangan stok di database saat pesanan diproses oleh RabbitMQ *Consumer*.

### 4. Delete (Penghapusan Data)
* **Delete Item**: Menghapus data barang yang sudah tidak aktif atau salah input dari database.

---

## 🛠️ Teknologi yang Digunakan

* **Bahasa Pemrograman**: Python 3.9, TypeScript/JavaScript
* **Framework**: FastAPI, Next.js 14
* **Database**: MySQL
* **Message Broker**: RabbitMQ
* **DevOps & Infra**: Docker, Docker Compose, Kubernetes (K8s)

---

## 🚀 Panduan Instalasi dan Menjalankan Aplikasi

Aplikasi ini dilengkapi dengan script otomatis (`.bat`) untuk mempermudah deployment di lingkungan Windows.

### ⚠️ PENTING: Persiapan Database (WAJIB DILAKUKAN)
Sebelum menjalankan aplikasi, Anda **harus menyiapkan database kosong** agar sistem tidak error.

1.  Nyalakan **XAMPP** (Start Apache & MySQL).
2.  Buka **phpMyAdmin** di browser (`http://localhost/phpmyadmin`).
3.  Buat database baru dengan nama: **`iae_db`** (Bisa dirubah sesuai keinginan namun harus merubah main.py di inventory-service)
    > **Catatan:** Pastikan nama database **SAMA PERSIS** (`iae_db`). Jika nama berbeda, aplikasi Inventory Service akan gagal koneksi.

### Opsi A: Mode Docker Compose (Lokal)
Gunakan mode ini untuk demo cepat dan pengembangan.

1.  Pastikan Docker Desktop sudah **Running**.
2.  Jalankan file `manager.bat`.
3.  Pilih menu **1** (Build Ulang) saat pertama kali dijalankan.
4.  Pilih menu **2** (Start App).
5.  Buka browser: [http://localhost:3000](http://localhost:3000).

### Opsi B: Mode Kubernetes (Cluster)
Gunakan mode ini untuk simulasi orkestrasi container.

1.  Aktifkan fitur **Kubernetes** di Docker Desktop Settings.
2.  Jalankan file `kubernetes-manager.bat`.
3.  Pilih menu **1** (Build Image) agar image terdaftar di registry lokal.
4.  Pilih menu **2** (Deploy Apps) untuk menyalakan semua Pods.
5.  Pilih menu **4** (Cek Status) untuk memastikan status **Running**.
6.  Buka browser: [http://localhost:3000](http://localhost:3000).

---
Langgeng Yongi Surya
102022300019
SI-47-04