from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()

# Setup CORS (Wajib biar Frontend bisa akses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfigurasi Keamanan
SECRET_KEY = "rahasia_super_aman_langgeng_yongi_surya" # Ganti sesuka hati
ALGORITHM = "HS256"

# Database User Sementara (Memory)
fake_users_db = {}

# Model Data
class User(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Fungsi Helper
def verify_password(plain_password, hashed_password):
    # hashed_password adalah bytes dari bcrypt
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def get_password_hash(password):
    # Generate salt dan hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # Return as string untuk simpan di dict

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30) # Token expired 30 menit
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/")
def root():
    return {"service": "Auth Service", "status": "Active"}

# 1. REGISTER
@app.post("/register")
def register(user: User):
    if user.username in fake_users_db:
        raise HTTPException(status_code=400, detail="Username sudah dipakai")
    
    hashed_password = get_password_hash(user.password)
    fake_users_db[user.username] = {
        "username": user.username,
        "password": hashed_password
    }
    return {"message": "User berhasil dibuat", "username": user.username}

# 2. LOGIN
@app.post("/token", response_model=Token)
def login(user: User):
    db_user = fake_users_db.get(user.username)
    if not db_user or not verify_password(user.password, db_user['password']):
        raise HTTPException(status_code=401, detail="Username atau Password salah")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

