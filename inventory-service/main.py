from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pika
import json
import os
import threading
import time

app = FastAPI()

# Setup CORS untuk frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulasi Database Stok di Memory
# Misalnya kita punya stok 'barang-A' sebanyak 100 buah
inventory_db = {
    "Laptop": 100,
    "Mouse": 50,
    "Keyboard": 75
}

def get_rabbitmq_connection():
    host = os.getenv('RABBITMQ_HOST', 'localhost')
    retries = 5
    while retries > 0:
        try:
            return pika.BlockingConnection(pika.ConnectionParameters(host))
        except pika.exceptions.AMQPConnectionError:
            print("RabbitMQ belum siap, retry dalam 5 detik...")
            retries -= 1
            time.sleep(5)
    raise Exception("Gagal konek ke RabbitMQ")

# Fungsi background untuk memproses pesan
def consume_orders():
    print(" [Inventory] Menunggu pesan order...")
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    channel.queue_declare(queue='stock_check_queue')

    def callback(ch, method, properties, body):
        order = json.loads(body)
        item_id = order['item_id']
        qty = order['quantity']
        
        print(f" [>] Menerima request order: {item_id} jumlah {qty}")
        
        # Logika Cek Stok
        current_stock = inventory_db.get(item_id, 0)
        
        if current_stock >= qty:
            inventory_db[item_id] -= qty
            print(f" [SUCCESS] Stok dikurangi. Sisa stok {item_id}: {inventory_db[item_id]}")
        else:
            print(f" [FAILED] Stok tidak cukup! Sisa: {current_stock}, Minta: {qty}")

    channel.basic_consume(queue='stock_check_queue', on_message_callback=callback, auto_ack=True)
    channel.start_consuming()

# Jalankan consumer di thread terpisah saat aplikasi nyala
@app.on_event("startup")
def startup_event():
    thread = threading.Thread(target=consume_orders, daemon=True)
    thread.start()

@app.get("/")
def root():
    return {"service": "Inventory Service", "status": "Active"}

@app.get("/stocks")
def get_stocks():
    return inventory_db
