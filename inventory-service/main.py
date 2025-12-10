from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pika
import json
import os
import threading
import time
import sys

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Stok
inventory_db = {
    "Laptop": 100,
    "Mouse": 50,
    "Keyboard": 75
}

# --- FUNGSI KONEKSI ANTI-GAGAL & DETEKTIF ERROR ---
def get_rabbitmq_connection():
    # Ambil host dari env (default ke localhost kalau di luar docker)
    host = os.getenv('RABBITMQ_HOST', 'localhost')
    
    print(f" [Inventory] 🚀 Memulai service... Target RabbitMQ: {host}", flush=True)

    while True:
        try:
            print(f" [Inventory] 🔌 Sedang mencoba konek ke: {host}...", flush=True)
            
            # Buat parameter koneksi
            params = pika.ConnectionParameters(host)
            connection = pika.BlockingConnection(params)
            
            print(" [Inventory] ✅ BERHASIL TERHUBUNG KE RABBITMQ!", flush=True)
            return connection
            
        except Exception as e:
            # INI DIA: Tampilkan error aslinya biar ketahuan
            print(f" [Inventory] ❌ GAGAL KONEK (Penyebab: {e})", flush=True)
            print(" [Inventory] ⏳ Retry dalam 5 detik...", flush=True)
            time.sleep(5)

def consume_orders():
    # Tunggu koneksi sampai dapat
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    
    # Pastikan antrean ada
    channel.queue_declare(queue='stock_check_queue')

    def callback(ch, method, properties, body):
        try:
            print(f" [Inventory] 📩 Pesan Diterima: {body}", flush=True)
            order = json.loads(body)
            item_id = order.get('item_id')
            qty = order.get('quantity')
            
            if item_id in inventory_db:
                if inventory_db[item_id] >= qty:
                    inventory_db[item_id] -= qty
                    print(f" [SUCCESS] 📦 Stok {item_id} dikurangi {qty}. Sisa: {inventory_db[item_id]}", flush=True)
                else:
                    print(f" [FAILED] ⛔ Stok {item_id} tidak cukup! Sisa: {inventory_db[item_id]}, Minta: {qty}", flush=True)
            else:
                print(f" [ERROR] ❓ Barang {item_id} tidak ditemukan!", flush=True)
                
        except Exception as e:
            print(f" [ERROR] Gagal proses pesan: {e}", flush=True)

    print(" [Inventory] 👀 Menunggu pesan masuk...", flush=True)
    channel.basic_consume(queue='stock_check_queue', on_message_callback=callback, auto_ack=True)
    channel.start_consuming()

@app.on_event("startup")
def startup_event():
    # Jalankan consumer di background biar API gak macet
    t = threading.Thread(target=consume_orders, daemon=True)
    t.start()

@app.get("/")
def root():
    return {"status": "Inventory Service Ready"}

@app.get("/stocks")
def get_stocks():
    return inventory_db

if __name__ == "__main__":
    import threading
    t = threading.Thread(target=consume_orders, daemon=True)
    t.start()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)