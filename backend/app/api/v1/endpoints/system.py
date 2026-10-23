import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.destination import Destination
from app.models.attraction import Attraction
from app.core.config import settings
from ml.src.predict import get_ml_suite

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

@router.get("/models/status")
def models_status():
    ml = get_ml_suite()
    return {
        "recommender_loaded": ml.recommender is not None,
        "safety_model_loaded": ml.safety_model is not None,
        "budget_model_loaded": ml.budget_estimator is not None,
        "model_dir": settings.MODEL_DIR,
        "models": {
            "recommender": "TF-IDF & Multi-Objective Ranker v1.0",
            "safety": "Calibrated Random Forest Risk Classifier v1.0",
            "budget": "Random Forest Trip Cost Regressor v1.0"
        }
    }

@router.get("/data/status")
def data_status(db: Session = Depends(get_db)):
    dest_count = db.query(Destination).count()
    attr_count = db.query(Attraction).count()
    return {
        "destinations_in_database": dest_count,
        "attractions_in_database": attr_count,
        "status": "operational" if dest_count > 0 else "requires_seeding",
        "dataset_dir": settings.DATASET_DIR
    }
