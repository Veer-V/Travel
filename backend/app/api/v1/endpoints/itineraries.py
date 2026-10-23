from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.trip import Itinerary, ItineraryItem
from app.schemas.trip import ItineraryResponse

router = APIRouter()

@router.get("/{itinerary_id}", response_model=ItineraryResponse)
def get_itinerary(itinerary_id: str, db: Session = Depends(get_db)):
    itin = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itin:
        raise HTTPException(status_code=404, detail="Itinerary day not found.")
    
    items = []
    for itm in itin.items:
        items.append({
            "id": itm.id,
            "time_slot": itm.time_slot,
            "start_time": itm.start_time,
            "end_time": itm.end_time,
            "activity_name": itm.activity_name,
            "activity_type": itm.activity_type,
            "location_name": itm.location_name,
            "latitude": itm.latitude,
            "longitude": itm.longitude,
            "travel_mode": itm.travel_mode,
            "travel_duration_minutes": itm.travel_duration_minutes,
            "visit_duration_minutes": itm.visit_duration_minutes,
            "estimated_cost": itm.estimated_cost,
            "booking_required": itm.booking_required,
            "data_source": itm.data_source,
            "order_index": itm.order_index
        })
    return {
        "id": itin.id,
        "day_number": itin.day_number,
        "date": itin.date.isoformat(),
        "daily_expense_estimate": itin.daily_expense_estimate,
        "notes": itin.notes,
        "items": items
    }
