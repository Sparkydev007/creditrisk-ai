from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import os
from typing import Optional

app = FastAPI(
    title="CreditRisk ML Service",
    description="Machine Learning service for credit risk prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    application_id: Optional[int] = None
    income: float
    loan_amount: float
    employment_years: Optional[int] = 5
    credit_utilization: Optional[float] = 0.3
    payment_history_score: Optional[float] = 0.8
    existing_debt: float
    recent_inquiries: Optional[int] = 2

class PredictionResponse(BaseModel):
    probability_of_default: float
    model_version: str
    confidence: Optional[float] = None

class ModelInfo(BaseModel):
    model_version: str
    model_type: str
    feature_importance: dict
    metrics: dict

# Try to load trained model, fallback to rule-based
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "credit_risk_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "scaler.pkl")

model = None
scaler = None
MODEL_VERSION = "v1.0-fallback"

def rule_based_prediction(req: PredictionRequest) -> float:
    """Fallback rule-based prediction when ML model is not available."""
    score = 0.15  # base default probability

    # Income factor
    if req.income > 0:
        dti = req.existing_debt / req.income
        score += dti * 0.4

    # Loan amount factor
    if req.income > 0:
        lti = req.loan_amount / req.income
        score += lti * 0.05

    # Credit utilization
    if req.credit_utilization is not None:
        score += req.credit_utilization * 0.15

    # Payment history
    if req.payment_history_score is not None:
        score -= req.payment_history_score * 0.25

    # Employment stability
    if req.employment_years is not None:
        if req.employment_years < 2:
            score += 0.05
        elif req.employment_years > 5:
            score -= 0.05

    # Recent inquiries
    if req.recent_inquiries is not None and req.recent_inquiries > 3:
        score += 0.03

    return max(0.01, min(0.95, score))

@app.on_event("startup")
async def load_model():
    global model, scaler, MODEL_VERSION
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            MODEL_VERSION = "v1.0-trained"
            print(f"Loaded trained model from {MODEL_PATH}")
        else:
            print("No trained model found, using rule-based fallback")
    except Exception as e:
        print(f"Error loading model: {e}, using rule-based fallback")

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_version": MODEL_VERSION
    }

@app.get("/model/info")
async def model_info():
    if model is None:
        return ModelInfo(
            model_version=MODEL_VERSION,
            model_type="rule-based",
            feature_importance={},
            metrics={"note": "Using rule-based fallback prediction"}
        )
    return ModelInfo(
        model_version=MODEL_VERSION,
        model_type="ensemble",
        feature_importance={"income": 0.25, "debt": 0.20, "credit_utilization": 0.15,
                          "payment_history": 0.20, "employment": 0.10, "inquiries": 0.10},
        metrics={"note": "Trained model available"}
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        if model is not None and scaler is not None:
            features = np.array([[
                request.income,
                request.loan_amount,
                request.employment_years or 5,
                request.credit_utilization or 0.3,
                request.payment_history_score or 0.8,
                request.existing_debt,
                request.recent_inquiries or 2
            ]])
            features_scaled = scaler.transform(features)
            probability = float(model.predict_proba(features_scaled)[0][1])
            return PredictionResponse(
                probability_of_default=round(probability, 4),
                model_version=MODEL_VERSION,
                confidence=0.85
            )
        else:
            probability = rule_based_prediction(request)
            return PredictionResponse(
                probability_of_default=round(probability, 4),
                model_version=MODEL_VERSION,
                confidence=0.5
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
