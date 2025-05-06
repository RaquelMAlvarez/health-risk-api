# app/main.py

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
