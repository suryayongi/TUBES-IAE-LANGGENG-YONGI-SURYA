from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pika, json, threading, time
from datetime import datetime

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Data penyimpanan (In-Memory)
inventory_db = {
    "Laptop": 100,
    "Mouse": 50,
    "Monitor": 5
}

history_logs = []

# Model data untuk tambah barang baru
class NewItem(BaseModel):
    item_id: str
    quantity: int

def process_order(ch, method, properties, body):
    try:
        data = json.loads(body)
        item_id, qty = data.get("item_id"), data.get("quantity")
        if item_id in inventory_db and inventory_db[item_id] >= qty:
            inventory_db[item_id] -= qty
            history_logs.insert(0, {
                "type": "ORDER",
                "item": item_id,
                "qty": qty,
                "time": datetime.now().strftime("%H:%M:%S")
            })
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Error: {e}", flush=True)

def consume():
    while True:
        try:
            conn = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', heartbeat=600))
            chan = conn.channel()
            chan.queue_declare(queue='stock_check_queue')
            chan.basic_consume(queue='stock_check_queue', on_message_callback=process_order)
            chan.start_consuming()
        except: time.sleep(5)

threading.Thread(target=consume, daemon=True).start()

@app.get("/stocks")
def get_stocks():
    return [{"item_id": k, "quantity": v} for k, v in inventory_db.items()]

@app.post("/restock")
def restock(data: dict):
    item_id, qty = data.get("item_id"), data.get("quantity")
    if item_id in inventory_db:
        inventory_db[item_id] += qty
        history_logs.insert(0, {"type": "RESTOCK", "item": item_id, "qty": qty, "time": datetime.now().strftime("%H:%M:%S")})
        return {"message": "Success"}
    raise HTTPException(status_code=404, detail="Barang tidak ada")

@app.post("/items")
def add_item(item: NewItem):
    if item.item_id in inventory_db:
        raise HTTPException(status_code=400, detail="Barang sudah ada")
    inventory_db[item.item_id] = item.quantity
    history_logs.insert(0, {"type": "NEW ITEM", "item": item.item_id, "qty": item.quantity, "time": datetime.now().strftime("%H:%M:%S")})
    return {"message": "Barang berhasil ditambahkan"}

@app.delete("/items/{item_id}")
def delete_item(item_id: str):
    if item_id in inventory_db:
        del inventory_db[item_id]
        history_logs.insert(0, {"type": "DELETED", "item": item_id, "qty": 0, "time": datetime.now().strftime("%H:%M:%S")})
        return {"message": "Barang dihapus"}
    raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

@app.get("/history")
def get_history():
    return history_logs # Kirim semua history tanpa batas