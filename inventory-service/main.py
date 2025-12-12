from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pika
import json
import os
import threading
import time
import sys

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inventory_db = {
    "Laptop": 100,
    "Mouse": 50,
    "Keyboard": 75
}

def get_rabbitmq_connection():
    host = os.getenv('RABBITMQ_HOST', 'localhost')
    while True:
        try:
            print(f" [Inventory] 🔌 Mencoba konek ke: {host}...", flush=True)
            connection = pika.BlockingConnection(pika.ConnectionParameters(host))
            print(" [Inventory] ✅ KONEKSI RABBITMQ SUKSES!", flush=True)
            return connection
        except Exception as e:
            print(f" [Inventory] ⏳ Gagal konek, retry 5 detik... ({e})", flush=True)
            time.sleep(5)

def consume_orders():
    while True:
        try:
            connection = get_rabbitmq_connection()
            channel = connection.channel()
            channel.queue_declare(queue='stock_check_queue')

            def callback(ch, method, properties, body):
                try:
                    print(f" [Inventory] 📩 DITERIMA: {body}", flush=True)
                    order = json.loads(body)
                    item_id = order.get('item_id')
                    qty = order.get('quantity')
                    
                    if item_id in inventory_db:
                        if inventory_db[item_id] >= qty:
                            inventory_db[item_id] -= qty
                            print(f" [SUCCESS] Stok {item_id} -{qty}. Sisa: {inventory_db[item_id]}", flush=True)
                        else:
                            print(f" [FAILED] Stok Habis untuk {item_id}", flush=True)
                    else:
                        print(f" [ERROR] Barang {item_id} tidak dikenal", flush=True)
                except Exception as e:
                    print(f" [ERROR] Gagal proses pesan: {e}", flush=True)

            print(" [Inventory] MENUNGGU ORDER...", flush=True)
            channel.basic_consume(queue='stock_check_queue', on_message_callback=callback, auto_ack=True)
            channel.start_consuming()
        
        except Exception as e:
            print(f" [CRITICAL] ☠️ Koneksi putus: {e}. Restarting dalam 5 detik...", flush=True)
            time.sleep(5)

@app.on_event("startup")
def startup_event():
    t = threading.Thread(target=consume_orders, daemon=True)
    t.start()

@app.get("/")
def root():
    return {"status": "Active"}

@app.get("/stocks")
def get_stocks():
    return inventory_db