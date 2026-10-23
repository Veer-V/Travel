from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.attraction import Attraction
from app.schemas.attraction import AttractionBase

router = APIRouter()

@router.get("", response_model=List[AttractionBase])
def list_attractions(
    destination_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Attraction)
    if destination_id:
        query = query.filter(Attraction.destination_id == destination_id)
    if category:
        query = query.filter(Attraction.category.ilike(f"%{category}%"))
    return query.offset(offset).limit(limit).all()

@router.get("/{attraction_id}", response_model=AttractionBase)
def get_attraction(attraction_id: int, db: Session = Depends(get_db)):
    attr = db.query(Attraction).filter(Attraction.id == attraction_id).first()
    if not attr:
        raise HTTPException(status_code=404, detail="Attraction not found.")
    return attr
