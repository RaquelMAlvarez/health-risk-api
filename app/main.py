# app/main.py

#incluir /token
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import authenticate_user, create_access_token, get_current_user
from datetime import timedelta
from fastapi import Depends

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal

from app.logic import predict_risk
from app.database import SessionLocal, Patient, init_db  # <-- Mueve esto arriba

app = FastAPI(title="Health Risk Predictor API")

# Input model
class RiskInput(BaseModel):
    age: int
    smoking_history: Literal["never smoked", "former smoker", "current smoker"]
    pollution_level: Literal["low", "medium", "high"]
    genetic_risk: Literal["positive", "negative"]

# Output model
class RiskOutput(BaseModel):
    risk_level: Literal["Low", "Medium", "High"]
    recommendation: str

# Endpoint: /predict-risk
@app.post("/predict-risk", response_model=RiskOutput)
def predict_risk_endpoint(data: RiskInput):
    try:
        risk_level, recommendation = predict_risk(
            age=data.age,
            smoking_history=data.smoking_history,
            pollution_level=data.pollution_level,
            genetic_risk=data.genetic_risk
        )
        return {"risk_level": risk_level, "recommendation": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint: POST /patients
@app.post("/patients")
def save_patient(data: RiskInput):
    try:
        db = SessionLocal()
        risk_level, recommendation = predict_risk(
            age=data.age,
            smoking_history=data.smoking_history,
            pollution_level=data.pollution_level,
            genetic_risk=data.genetic_risk
        )

        new_patient = Patient(
            age=data.age,
            smoking_history=data.smoking_history,
            pollution_level=data.pollution_level,
            genetic_risk=data.genetic_risk,
            risk_level=risk_level,
            recommendation=recommendation
        )

        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        db.close()

        return {"message": "Patient saved successfully", "id": new_patient.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint: GET /patients
@app.get("/patients")
def get_patients():
    try:
        db = SessionLocal()
        patients = db.query(Patient).all()
        db.close()

        return [
            {
                "id": p.id,
                "age": p.age,
                "smoking_history": p.smoking_history,
                "pollution_level": p.pollution_level,
                "genetic_risk": p.genetic_risk,
                "risk_level": p.risk_level,
                "recommendation": p.recommendation
            }
            for p in patients
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Crear base de datos si no existe
init_db()

#nuevo endpoint auth
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not authenticate_user(form_data.username, form_data.password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=timedelta(minutes=60)
    )
    return {"access_token": access_token, "token_type": "bearer"}

#proteger endpoints
@app.get("/patients")
def get_patients(user: dict = Depends(get_current_user)):
    # Solo accesible si el token es válido
    db = SessionLocal()
    patients = db.query(Patient).all()
    db.close()
    return [
        {
            "id": p.id,
            "age": p.age,
            "smoking_history": p.smoking_history,
            "pollution_level": p.pollution_level,
            "genetic_risk": p.genetic_risk,
            "risk_level": p.risk_level,
            "recommendation": p.recommendation
        }
        for p in patients
    ]


