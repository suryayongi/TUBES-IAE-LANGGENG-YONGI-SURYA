from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pika
import json
import os
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

# Data model untuk input user
class Order(BaseModel):
    item_id: str
    quantity: int

# Koneksi ke RabbitMQ dengan retry sederhana
def get_rabbitmq_connection():
    host = os.getenv('RABBITMQ_HOST', 'localhost')
    retries = 5
    while retries > 0:
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host))
            return connection
        except pika.exceptions.AMQPConnectionError:
            print("RabbitMQ belum siap, retry dalam 5 detik...")
            retries -= 1
            time.sleep(5)
    raise Exception("Gagal konek ke RabbitMQ")

@app.get("/")
def root():
    return {"service": "Order Service", "status": "Active"}

@app.post("/orders")
def create_order(order: Order):
    connection = get_rabbitmq_connection()
    channel = connection.channel()
    channel.queue_declare(queue='stock_check_queue')
    
    order_data = order.dict()
    message = json.dumps(order_data)
    
    channel.basic_publish(exchange='', routing_key='stock_check_queue', body=message)
    
    
    import time
    time.sleep(0.5) 
    connection.close()
    
    
    print(f"[x] Order dikirim ke Inventory: {message}", flush=True) 
    
    return {"message": "Order diterima, sedang diproses oleh gudang", "data": order_data}
