from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.budget import BudgetEstimateRequest, BudgetEstimateResponse
from app.services.budget_service import budget_service

router = APIRouter()

@router.post("/estimate", response_model=BudgetEstimateResponse)
def estimate_budget(req: BudgetEstimateRequest, db: Session = Depends(get_db)):
    result = budget_service.estimate_trip_budget(
        db=db,
        origin=req.origin,
        destination_id=req.destination_id,
        num_days=req.num_days,
        num_travelers=req.num_travelers,
        transport_mode=req.transport_mode,
        accommodation_tier=req.accommodation_tier,
        meal_tier=req.meal_tier,
        local_transit_mode=req.local_transit_mode
    )
    return result
