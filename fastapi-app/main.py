from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
import logging
import time
from typing import Optional
import jwt
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

# ---------- Logging config ----------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [backend] %(message)s",
)
log = logging.getLogger("backend")

app = FastAPI()

# OAuth2PasswordBearer is used to get the token from request headers
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-secret-key"  # Secret key for JWT (should be secured)
ALGORITHM = "HS256"  # Algorithm used for JWT encoding


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # no "*"" if you plan to use credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Middleware to log each request ----------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    req_id = request.headers.get("x-request-id", "(none)")
    log.info(f"{request.method} {request.url.path} start reqId={req_id}")
    try:
        response = await call_next(request)
    except Exception as e:
        duration = (time.time() - start) * 1000
        log.exception(f"{request.method} {request.url.path} EXC reqId={req_id} durMs={duration:.1f}")
        raise
    duration = (time.time() - start) * 1000
    log.info(f"{request.method} {request.url.path} end status={response.status_code} reqId={req_id} durMs={duration:.1f}")
    return response

# ---------- JWT helpers ----------
def decode_jwt(token: str):
    log.info(f"decode_jwt called (token len={len(token)})")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        log.info("decode_jwt OK")
        return payload
    except jwt.ExpiredSignatureError:
        log.warning("decode_jwt expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        log.warning("decode_jwt invalid")
        raise HTTPException(status_code=401, detail="Invalid token")

def get_data_from_udal(user_id: str):
    log.info(f"UDAL get data for user_id={user_id}")
    # pretend to call UDAL here
    return {"user_id": user_id, "data": "Sensitive data from UDAL"}

# ---------- Routes ----------
@app.get("/api/data")
async def get_data(token: str = Depends(oauth2_scheme)):
    payload = decode_jwt(token)
    user_id = payload.get("sub", "unknown")
    data = get_data_from_udal(user_id)
    return data

@app.post("/token")
def generate_token():
    exp = datetime.utcnow() + timedelta(hours=1)
    token = jwt.encode({"sub": "user123", "exp": exp}, SECRET_KEY, algorithm="HS256")
    log.info("Issued token for sub=user123 exp=+1h")
    return {"access_token": token, "token_type": "bearer"}


