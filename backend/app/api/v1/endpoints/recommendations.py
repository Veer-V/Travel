from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.schemas.destination import DestinationBase
from app.models.destination import Destination
from app.services.recommendation_service import recommendation_service

router = APIRouter()

@router.post("", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    recs = recommendation_service.get_recommendations(
        db=db,
        destination_id=req.destination_id,
        travel_style=req.travel_style,
        interests=req.interests,
        budget=req.budget,
        accessibility_req=req.accessibility_requirements,
        limit=req.limit
    )
    return {
        "destination_id": req.destination_id,
        "count": len(recs),
        "recommendations": recs
    }

@router.get("/destinations", response_model=List[DestinationBase])
def get_recommended_destinations(
    travel_style: str = Query("cultural"),
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db)
):
    # Match style to destination type
    style_type_map = {
        "cultural": ["heritage", "spiritual", "cultural"],
        "historical": ["heritage"],
        "adventure": ["adventure", "hill_station"],
        "nature": ["nature", "hill_station", "wildlife"],
        "relaxation": ["beach", "hill_station"],
        "family": ["heritage", "urban", "nature"],
        "romantic": ["heritage", "hill_station", "beach"],
        "budget": ["spiritual", "heritage", "urban"]
    }
    target_types = style_type_map.get(travel_style.lower(), ["heritage", "nature"])
    destinations = db.query(Destination).filter(Destination.destination_type.in_(target_types)).limit(limit).all()
    if not destinations:
        destinations = db.query(Destination).limit(limit).all()
    return destinations
