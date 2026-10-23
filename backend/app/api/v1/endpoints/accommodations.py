from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.accommodation import Accommodation
from app.schemas.accommodation import AccommodationBase

router = APIRouter()

@router.get("", response_model=List[AccommodationBase])
def list_accommodations(
    destination_id: Optional[int] = Query(None),
    accommodation_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Accommodation)
    if destination_id:
        query = query.filter(Accommodation.destination_id == destination_id)
    if accommodation_type:
        query = query.filter(Accommodation.accommodation_type == accommodation_type)
    return query.offset(offset).limit(limit).all()
