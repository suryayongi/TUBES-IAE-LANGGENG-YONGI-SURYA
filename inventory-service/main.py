from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import pika, json, threading, time
from datetime import datetime

# SETTING XAMPP 
# Format: mysql+pymysql://user:password@host:port/nama_database
# User default XAMPP: root
# Password default XAMPP: (kosong)
# Host: host.docker.internal 
DATABASE_URL = "mysql+pymysql://root:@host.docker.internal:3306/iaedemo"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# isian tabel
class Product(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String(100), unique=True, index=True)
    quantity = Column(Integer)

class History(Base):
    __tablename__ = "history_logs"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50))
    item = Column(String(100))
    qty = Column(Integer)
    time = Column(String(50))

# otomatis buat tabel
try:
    Base.metadata.create_all(bind=engine)
    print("Berhasil konek ke XAMPP!", flush=True)
except Exception as e:
    print(f"GAGAL KONEK XAMPP: {e}", flush=True)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

#seeding nih
@app.on_event("startup")
def startup():
    try:
        db = SessionLocal()
        if not db.query(Product).first():
            db.add_all([
                Product(item_id="Laptop", quantity=100),
                Product(item_id="Mouse", quantity=50),
                Product(item_id="Monitor", quantity=5)
            ])
            db.commit()
        db.close()
    except:
        pass

class NewItem(BaseModel):
    item_id: str
    quantity: int

# --- RABBITMQ ---
def process_order(ch, method, properties, body):
    db = SessionLocal()
    try:
        data = json.loads(body)
        item_id, qty = data.get("item_id"), data.get("quantity")
        product = db.query(Product).filter(Product.item_id == item_id).first()
        
        if product and product.quantity >= qty:
            product.quantity -= qty
            log = History(type="ORDER", item=item_id, qty=qty, time=datetime.now().strftime("%H:%M:%S"))
            db.add(log)
            db.commit()
            print(f"Order Sukses: {item_id}")
        else:
            print(f"Stok Kurang: {item_id}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

def consume():
    while True:
        try:
            conn = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', heartbeat=600))
            chan = conn.channel()
            chan.queue_declare(queue='stock_check_queue')
            chan.basic_consume(queue='stock_check_queue', on_message_callback=process_order)
            chan.start_consuming()
        except:
            time.sleep(5)

threading.Thread(target=consume, daemon=True).start()

# --- API ---
@app.get("/stocks")
def get_stocks():
    db = SessionLocal()
    stocks = db.query(Product).all()
    db.close()
    return [{"item_id": s.item_id, "quantity": s.quantity} for s in stocks]

@app.post("/restock")
def restock(data: dict):
    db = SessionLocal()
    item, qty = data.get("item_id"), data.get("quantity")
    product = db.query(Product).filter(Product.item_id == item).first()
    if product:
        product.quantity += qty
        log = History(type="RESTOCK", item=item, qty=qty, time=datetime.now().strftime("%H:%M:%S"))
        db.add(log)
        db.commit()
        db.close()
        return {"message": "Success"}
    db.close()
    raise HTTPException(status_code=404)

@app.post("/items")
def add_item(item: NewItem):
    db = SessionLocal()
    if db.query(Product).filter(Product.item_id == item.item_id).first():
        db.close()
        raise HTTPException(status_code=400, detail="Barang sudah ada")
    new_prod = Product(item_id=item.item_id, quantity=item.quantity)
    log = History(type="NEW ITEM", item=item.item_id, qty=item.quantity, time=datetime.now().strftime("%H:%M:%S"))
    db.add(new_prod)
    db.add(log)
    db.commit()
    db.close()
    return {"message": "Success"}

@app.delete("/items/{item_id}")
def delete_item(item_id: str):
    db = SessionLocal()
    product = db.query(Product).filter(Product.item_id == item_id).first()
    if product:
        db.delete(product)
        log = History(type="DELETED", item=item_id, qty=0, time=datetime.now().strftime("%H:%M:%S"))
        db.add(log)
        db.commit()
        db.close()
        return {"message": "Deleted"}
    db.close()
    raise HTTPException(status_code=404)

@app.get("/history")
def get_history():
    db = SessionLocal()
    logs = db.query(History).order_by(History.id.desc()).all()
    db.close()
    return [{"type": l.type, "item": l.item, "qty": l.qty, "time": l.time} for l in logs]