from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pika
import json
import time
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Order(BaseModel):
    item_id: str
    quantity: int

@app.post("/orders")
def create_order(order: Order):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', heartbeat=600))
        channel = connection.channel()
        channel.queue_declare(queue='stock_check_queue')
        
        message = json.dumps(order.dict())
        channel.basic_publish(exchange='', routing_key='stock_check_queue', body=message)
        
        time.sleep(0.5)
        connection.close()
        
        print(f"[x] Order sukses dikirim: {message}", flush=True)
        return {"status": "success", "message": "Order sedang diproses"}
    except Exception as e:
        print(f"[ERROR] RabbitMQ Connection Error: {e}", flush=True)
        return {"status": "error", "message": "Gagal menghubungi RabbitMQ"}