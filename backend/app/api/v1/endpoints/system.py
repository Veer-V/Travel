import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.destination import Destination
from app.models.attraction import Attraction
from app.core.config import settings

try:
    from ml.src.predict import get_ml_suite
except Exception:
    get_ml_suite = None

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
    if settings.ML_SERVICE_URL:
        try:
            import httpx
            resp = httpx.get(f"{settings.ML_SERVICE_URL.rstrip('/')}/status", timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                models = data.get("models", {})
                return {
                    "recommender_loaded": models.get("recommender_loaded", True),
                    "safety_model_loaded": models.get("safety_model_loaded", True),
                    "budget_model_loaded": models.get("budget_estimator_loaded", True),
                    "ml_service_mode": "remote_service",
                    "ml_service_url": settings.ML_SERVICE_URL,
                    "models": {
                        "recommender": "TF-IDF & Multi-Objective Ranker v1.0",
                        "safety": "Calibrated Random Forest Risk Classifier v1.0",
                        "budget": "Random Forest Trip Cost Regressor v1.0"
                    }
                }
        except Exception as e:
            print(f"[SystemAPI] Error fetching remote ML status: {e}")

    ml = get_ml_suite() if get_ml_suite is not None else None
    return {
        "recommender_loaded": getattr(ml, "recommender", None) is not None if ml else False,
        "safety_model_loaded": getattr(ml, "safety_model", None) is not None if ml else False,
        "budget_model_loaded": getattr(ml, "budget_estimator", None) is not None if ml else False,
        "ml_service_mode": "in_process",
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
