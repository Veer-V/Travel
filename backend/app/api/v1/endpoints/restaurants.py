from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantBase

router = APIRouter()

@router.get("", response_model=List[RestaurantBase])
def list_restaurants(
    destination_id: Optional[int] = Query(None),
    price_level: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)
    if destination_id:
        query = query.filter(Restaurant.destination_id == destination_id)
    if price_level:
        query = query.filter(Restaurant.price_level == price_level)
    return query.offset(offset).limit(limit).all()
