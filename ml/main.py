import os
import sys
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Ensure ml path is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

try:
    from ml.src.predict import get_ml_suite
except ModuleNotFoundError:
    from src.predict import get_ml_suite

app = FastAPI(
    title="SmartVoyage AI — Machine Learning Inference Service",
    description="Internal ML inference microservice for recommendations, safety risk evaluation, and budget estimation",
    version="1.0.0"
)

# Request DTOs
class RecommendRequest(BaseModel):
    destination_id: int
    travel_style: str = "cultural"
    interests: Optional[List[str]] = Field(default_factory=list)
    budget: float = 20000.0
    accessibility_req: str = "none"
    limit: int = 10

class SafetyAssessRequest(BaseModel):
    destination_id: int

class BudgetEstimateRequest(BaseModel):
    origin: str = "Delhi"
    destination_name: str
    num_days: int
    num_travelers: int = 1
    transport_mode: str = "train"
    accommodation_tier: str = "hotel"
    meal_tier: str = "moderate"

@app.get("/")
def root():
    return {
        "service": "SmartVoyage AI ML Service",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/status")
def status():
    ml = get_ml_suite()
    return {
        "status": "operational",
        "models": {
            "recommender_loaded": ml.recommender is not None,
            "safety_model_loaded": ml.safety_model is not None,
            "budget_estimator_loaded": ml.budget_estimator is not None
        }
    }

@app.post("/recommend")
def recommend(req: RecommendRequest):
    ml = get_ml_suite()
    if not ml or not ml.recommender:
        raise HTTPException(status_code=503, detail="Recommender model unavailable")
    recs = ml.recommend(
        destination_id=req.destination_id,
        travel_style=req.travel_style,
        interests=req.interests,
        budget=req.budget,
        accessibility_req=req.accessibility_req,
        top_k=req.limit
    )
    return {
        "destination_id": req.destination_id,
        "count": len(recs),
        "recommendations": recs
    }

@app.post("/safety/assess")
def assess_safety(req: SafetyAssessRequest):
    ml = get_ml_suite()
    if not ml:
        raise HTTPException(status_code=503, detail="Safety model unavailable")
    return ml.assess_safety(req.destination_id)

@app.post("/budget/estimate")
def estimate_budget(req: BudgetEstimateRequest):
    ml = get_ml_suite()
    if not ml or not ml.budget_estimator:
        raise HTTPException(status_code=503, detail="Budget model unavailable")
    return ml.estimate_budget(
        origin=req.origin,
        destination_name=req.destination_name,
        num_days=req.num_days,
        num_travelers=req.num_travelers,
        transport_mode=req.transport_mode,
        accommodation_tier=req.accommodation_tier,
        meal_tier=req.meal_tier
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
