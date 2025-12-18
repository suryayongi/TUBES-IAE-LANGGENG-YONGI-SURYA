from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pika
import json
import threading
import time
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

inventory_db = {
    "Laptop": 100,
    "Mouse": 50,
    "Keyboard": 75,
    "Monitor": 5
}

history_logs = []

def process_order(ch, method, properties, body):
    try:
        data = json.loads(body)
        item_id = data.get("item_id")
        qty = data.get("quantity")
        
        if item_id in inventory_db:
            if inventory_db[item_id] >= qty:
                inventory_db[item_id] -= qty
                history_logs.insert(0, {
                    "type": "ORDER",
                    "item": item_id,
                    "qty": qty,
                    "time": datetime.now().strftime("%H:%M:%S")
                })
                print(f"[SUCCESS] {item_id} dikurangi {qty}", flush=True)
            else:
                print(f"[FAILED] Stok {item_id} tidak cukup", flush=True)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"[ERROR] Consumer Error: {e}", flush=True)

def consume_orders():
    while True:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', heartbeat=600))
            channel = connection.channel()
            channel.queue_declare(queue='stock_check_queue')
            channel.basic_consume(queue='stock_check_queue', on_message_callback=process_order)
            print(" [*] Menunggu order...", flush=True)
            channel.start_consuming()
        except Exception:
            time.sleep(5)

threading.Thread(target=consume_orders, daemon=True).start()

@app.get("/stocks")
def get_stocks():
    return [{"item_id": k, "quantity": v} for k, v in inventory_db.items()]

@app.post("/restock")
def restock(data: dict):
    item_id = data.get("item_id")
    qty = data.get("quantity")
    if item_id in inventory_db:
        inventory_db[item_id] += qty
        history_logs.insert(0, {
            "type": "RESTOCK",
            "item": item_id,
            "qty": qty,
            "time": datetime.now().strftime("%H:%M:%S")
        })
        return {"message": "Restock berhasil"}
    raise HTTPException(status_code=404, detail="Barang tidak ada")

@app.get("/history")
def get_history():
    return history_logs[:10]