from typing import List, Optional
from pydantic import BaseModel
from app.schemas.attraction import AttractionRecommendation

class RecommendationRequest(BaseModel):
    destination_id: int
    travel_style: str = "cultural"
    interests: Optional[List[str]] = None
    budget: float = 20000.0
    accessibility_requirements: str = "none"
    limit: int = 10

class RecommendationResponse(BaseModel):
    destination_id: int
    count: int
    recommendations: List[AttractionRecommendation]
