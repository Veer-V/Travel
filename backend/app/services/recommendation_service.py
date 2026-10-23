import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.attraction import Attraction
from app.models.destination import Destination
from app.core.config import settings

try:
    from ml.src.predict import get_ml_suite
except Exception:
    get_ml_suite = None

class RecommendationService:
    def __init__(self):
        self._ml = None

    @property
    def ml(self):
        if self._ml is None and get_ml_suite is not None:
            try:
                self._ml = get_ml_suite()
            except Exception:
                self._ml = None
        return self._ml

    def get_recommendations(
        self,
        db: Session,
        destination_id: int,
        travel_style: str = "cultural",
        interests: Optional[List[str]] = None,
        budget: float = 20000.0,
        accessibility_req: str = "none",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        # 1. Check if remote ML service binding is configured (Vercel Services)
        if settings.ML_SERVICE_URL:
            try:
                import httpx
                resp = httpx.post(
                    f"{settings.ML_SERVICE_URL.rstrip('/')}/recommend",
                    json={
                        "destination_id": destination_id,
                        "travel_style": travel_style,
                        "interests": interests or [],
                        "budget": budget,
                        "accessibility_req": accessibility_req,
                        "limit": limit
                    },
                    timeout=5.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    recs = data.get("recommendations", [])
                    if recs:
                        return recs
            except Exception as e:
                print(f"[RecommendationService] Remote ML service call failed: {e}. Falling back to local/database.")

        # 2. If in-process ML recommender is available, score using fitted TF-IDF
        if self.ml and getattr(self.ml, "recommender", None):
            recs = self.ml.recommend(
                destination_id=destination_id,
                travel_style=travel_style,
                interests=interests,
                budget=budget,
                accessibility_req=accessibility_req,
                top_k=limit
            )
            if recs:
                return recs

        # 3. Fallback database ranking if ML artifact is loading or no match
        db_attractions = db.query(Attraction).filter(Attraction.destination_id == destination_id).all()
        results = []
        for a in db_attractions[:limit]:
            results.append({
                "attraction_id": a.id,
                "destination_id": a.destination_id,
                "name": a.name,
                "category": a.category,
                "latitude": a.latitude,
                "longitude": a.longitude,
                "estimated_visit_duration": a.estimated_visit_duration,
                "admission_price": a.admission_price,
                "opening_hours": a.opening_hours,
                "rating": a.rating,
                "accessibility_features": a.accessibility_features,
                "description": a.description,
                "tags": a.tags,
                "relevance_score": 0.85,
                "explanation": ["Popular landmark in destination"]
            })
        return results

recommendation_service = RecommendationService()
