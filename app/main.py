# app/main.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Literal
from datetime import timedelta

from app.logic import predict_risk
from app.database import SessionLocal, Patient, init_db
from app.auth import authenticate_user, create_access_token, get_current_user

app = FastAPI(title="Health Risk Predictor API")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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

# Endpoint: GET /patients (protegido con JWT)
@app.get("/patients")
def get_patients(user: dict = Depends(get_current_user)):
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

# Endpoint: /token
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not authenticate_user(form_data.username, form_data.password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=timedelta(minutes=60)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint: DELETE /patients/{patient_id}
@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        db.close()
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    db.close()
    return {"message": f"Patient with id {patient_id} deleted successfully"}


# Endpoint: PUT /patients/{patient_id}
@app.put("/patients/{patient_id}")
def update_patient(patient_id: int, data: RiskInput, user: dict = Depends(get_current_user)):
    db = SessionLocal()
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        db.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    risk_level, recommendation = predict_risk(
        age=data.age,
        smoking_history=data.smoking_history,
        pollution_level=data.pollution_level,
        genetic_risk=data.genetic_risk
    )

    patient.age = data.age
    patient.smoking_history = data.smoking_history
    patient.pollution_level = data.pollution_level
    patient.genetic_risk = data.genetic_risk
    patient.risk_level = risk_level
    patient.recommendation = recommendation

    db.commit()
    db.refresh(patient)
    db.close()
    return {"message": f"Patient with id {patient_id} updated successfully"}

# Crear base de datos si no existe
init_db()

#Para evitar el 404 Not Found cuando se accede a la raíz (/) de API
@app.get("/")
def root():
    return {"message": "API is running. Visit /docs for documentation."}
