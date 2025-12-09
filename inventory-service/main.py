from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pika
import json
import os
import threading
import time

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

# --- BAGIAN INI YANG WAJIB DIGANTI ---
def get_rabbitmq_connection():
    host = os.getenv('RABBITMQ_HOST', 'localhost')
    
    # Loop SELAMANYA sampai konek (Infinite Retry)
    while True:
        try:
            print(f" [Inventory] Mencoba konek ke RabbitMQ di {host}...", flush=True)
            return pika.BlockingConnection(pika.ConnectionParameters(host))
        except Exception as e:
            print(f" [Inventory] Gagal konek, retry dalam 5 detik...", flush=True)
            time.sleep(5)

def consume_orders():
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    channel.queue_declare(queue='stock_check_queue')

    def callback(ch, method, properties, body):
        print(f" [Inventory] Terima Pesan: {body}", flush=True) # Debug Print
        order = json.loads(body)
        item_id = order['item_id']
        qty = order['quantity']
        
        if item_id in inventory_db and inventory_db[item_id] >= qty:
            inventory_db[item_id] -= qty
            print(f" [SUCCESS] Stok {item_id} berkurang! Sisa: {inventory_db[item_id]}", flush=True)
        else:
            print(f" [FAILED] Stok Gagal/Habis untuk {item_id}", flush=True)

    channel.basic_consume(queue='stock_check_queue', on_message_callback=callback, auto_ack=True)
    channel.start_consuming()
# --------------------------------------

@app.on_event("startup")
def startup_event():
    threading.Thread(target=consume_orders, daemon=True).start()

@app.get("/")
def root():
    return {"status": "Inventory Service Ready"}

@app.get("/stocks")
def get_stocks():
    return inventory_db