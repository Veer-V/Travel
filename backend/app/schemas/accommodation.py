from typing import Optional
from pydantic import BaseModel

class AccommodationBase(BaseModel):
    id: int
    destination_id: int
    name: str
    accommodation_type: str
    latitude: float
    longitude: float
    price_per_night: float
    amenities: str
    rating: float
    booking_url: Optional[str] = None
    source: str = "Verified Directory"

    class Config:
        from_attributes = True
