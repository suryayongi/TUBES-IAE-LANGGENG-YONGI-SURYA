from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql+pymysql://root:admin@db/iae_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(100))
    role = Column(String(20))

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

SECRET_KEY = "iae_secret_key"
ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    username: str
    password: str

@app.on_event("startup")
def init_db():
    db = SessionLocal()
    if not db.query(UserDB).filter(UserDB.username == "admin").first():
        db.add(UserDB(username="admin", password="123", role="admin"))
        db.add(UserDB(username="staff", password="123", role="worker"))
        db.commit()
    db.close()

@app.post("/token")
async def login(data: LoginRequest):
    db = SessionLocal()
    user = db.query(UserDB).filter(UserDB.username == data.username).first()
    db.close()
    if not user or data.password != user.password:
        raise HTTPException(status_code=400, detail="Username atau password salah")
    token = jwt.encode({"sub": user.username, "role": user.role, "exp": datetime.utcnow() + timedelta(hours=1)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "role": user.role}

@app.post("/register")
async def register(user: dict):
    db = SessionLocal()
    if db.query(UserDB).filter(UserDB.username == user["username"]).first():
        db.close()
        raise HTTPException(status_code=400, detail="Username sudah ada")
    db.add(UserDB(username=user["username"], password=user["password"], role=user.get("role", "worker")))
    db.commit()
    db.close()
    return {"message": "User berhasil didaftarkan"}