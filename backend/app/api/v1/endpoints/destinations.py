from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.destination import Destination
from app.schemas.destination import DestinationBase

router = APIRouter()

@router.get("", response_model=List[DestinationBase])
def list_destinations(
    destination_type: Optional[str] = Query(None, description="heritage, beach, hill_station, wildlife, spiritual, urban"),
    state: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Destination)
    if destination_type:
        query = query.filter(Destination.destination_type.ilike(f"%{destination_type}%"))
    if state:
        query = query.filter(Destination.state_or_region.ilike(f"%{state}%"))
    return query.offset(offset).limit(limit).all()

@router.get("/search", response_model=List[DestinationBase])
def search_destinations(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    search_pattern = f"%{q}%"
    return db.query(Destination).filter(
        (Destination.name.ilike(search_pattern)) |
        (Destination.state_or_region.ilike(search_pattern)) |
        (Destination.destination_type.ilike(search_pattern))
    ).limit(limit).all()

@router.get("/{destination_id}", response_model=DestinationBase)
def get_destination(destination_id: int, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found.")
    return dest
