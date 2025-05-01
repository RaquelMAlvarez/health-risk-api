# app/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal

from app.logic import predict_risk

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

