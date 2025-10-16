from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import jwt
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta

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

# Helper function to decode JWT and validate it
def decode_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # Payload contains the user info (e.g., user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Mock UDAL function (simulating data access)
def get_data_from_udal(user_id: str):
    # Simulate accessing a data layer
    return {"user_id": user_id, "data": "Sensitive data from UDAL"}


# FastAPI endpoint requiring JWT token
@app.get("/api/data")
async def get_data(token: str = Depends(oauth2_scheme)):
    # Validate the JWT token
    decoded_token = decode_jwt(token)
    user_id = decoded_token.get("sub")  # Assuming 'sub' is user_id in JWT payload

    # Get data using UDAL (Unified Data Access Layer)
    data = get_data_from_udal(user_id)

    return data


# This is just to simulate obtaining a token (in real-world, you would integrate with WSSO here)
@app.post("/token")
def generate_token():
    expiration = datetime.utcnow() + timedelta(hours=1)
    token = jwt.encode({"sub": "user123", "exp": expiration}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}
