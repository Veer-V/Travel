from typing import Optional, List
from pydantic import BaseModel, Field, model_validator

class AttractionBase(BaseModel):
    id: Optional[int] = None
    attraction_id: Optional[int] = None
    destination_id: int
    name: str
    category: str
    latitude: float
    longitude: float
    estimated_visit_duration: int
    admission_price: float
    opening_hours: str
    rating: float
    accessibility_features: str
    description: Optional[str] = None
    tags: Optional[str] = None
    source: str = "Verified Directory"

    @model_validator(mode="before")
    def sync_id_and_attraction_id(cls, values):
        if isinstance(values, dict):
            if "id" not in values or values["id"] is None:
                values["id"] = values.get("attraction_id")
            if "attraction_id" not in values or values["attraction_id"] is None:
                values["attraction_id"] = values.get("id")
        return values

    class Config:
        from_attributes = True

class AttractionRecommendation(AttractionBase):
    relevance_score: Optional[float] = None
    explanation: Optional[List[str]] = None
