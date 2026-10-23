import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.attraction import Attraction
from app.models.destination import Destination
from ml.src.predict import get_ml_suite

class RecommendationService:
    def __init__(self):
        self._ml = None

    @property
    def ml(self):
        if self._ml is None:
            self._ml = get_ml_suite()
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
        # Query attractions from database first
        db_attractions = db.query(Attraction).filter(Attraction.destination_id == destination_id).all()
        
        # If ML recommender is available, score using fitted TF-IDF
        if self.ml and self.ml.recommender:
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

        # Fallback database ranking if ML artifact is loading or no match
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
