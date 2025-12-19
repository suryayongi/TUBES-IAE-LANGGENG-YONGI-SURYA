from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pika, json, threading, time
from datetime import datetime

DATABASE_URL = "mysql+pymysql://root:admin@db/iae_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "inventory"
    item_id = Column(String(50), primary_key=True)
    quantity = Column(Integer)

class Log(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True)
    type = Column(String(20))
    item = Column(String(50))
    qty = Column(Integer)
    time = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def process_order(ch, method, properties, body):
    db = SessionLocal()
    data = json.loads(body)
    item_id, qty = data.get("item_id"), data.get("quantity")
    prod = db.query(Product).filter(Product.item_id == item_id).first()
    if prod and prod.quantity >= qty:
        prod.quantity -= qty
        db.add(Log(type="ORDER", item=item_id, qty=qty))
        db.commit()
    db.close()
    ch.basic_ack(delivery_tag=method.delivery_tag)

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

@app.on_event("startup")
def init_inventory():
    db = SessionLocal()
    if not db.query(Product).first():
        db.add_all([Product(item_id="Laptop", quantity=100), Product(item_id="Mouse", quantity=50), Product(item_id="Monitor", quantity=10)])
        db.commit()
    db.close()

@app.get("/stocks")
def get_stocks():
    db = SessionLocal()
    res = db.query(Product).all()
    db.close()
    return res

@app.post("/restock")
def restock(data: dict):
    db = SessionLocal()
    prod = db.query(Product).filter(Product.item_id == data["item_id"]).first()
    if prod:
        prod.quantity += data["quantity"]
        db.add(Log(type="RESTOCK", item=data["item_id"], qty=data["quantity"]))
        db.commit()
        db.close()
        return {"message": "Success"}
    db.close()
    raise HTTPException(status_code=404)

@app.get("/history")
def get_history():
    db = SessionLocal()
    res = db.query(Log).order_by(Log.id.desc()).limit(10).all()
    db.close()
    return [{"type": l.type, "item": l.item, "qty": l.qty, "time": l.time.strftime("%H:%M:%S")} for l in res]