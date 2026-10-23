from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class DestinationBase(BaseModel):
    id: int
    name: str
    state_or_region: str
    country: str = "India"
    latitude: float
    longitude: float
    destination_type: str
    description: Optional[str] = None
    best_time_to_visit: Optional[str] = None
    climate: Optional[str] = None
    source: str = "Verified Directory"

    class Config:
        from_attributes = True

class DestinationSearchQuery(BaseModel):
    query: Optional[str] = None
    state: Optional[str] = None
    destination_type: Optional[str] = None
    limit: int = 50
    offset: int = 0
