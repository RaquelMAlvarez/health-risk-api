from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Clave secreta para firmar el token (en producción usa una más segura)
SECRET_KEY = "secretosaludable"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Usuario simulado (puedes cambiarlo más adelante)
fake_user = {
    "username": "admin",
    "password": "admin123"
}

def authenticate_user(username: str, password: str):
    return username == fake_user["username"] and password == fake_user["password"]

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username != fake_user["username"]:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"username": username}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
