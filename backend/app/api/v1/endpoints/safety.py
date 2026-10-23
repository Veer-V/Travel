from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.safety import SafetyObservation, OfficialAdvisory
from app.models.destination import Destination
from app.schemas.safety import SafetyAssessmentResponse, OfficialAdvisoryResponse
from app.services.safety_service import safety_service

router = APIRouter()

@router.get("/location/{location_id}", response_model=SafetyAssessmentResponse)
def get_safety_by_location(location_id: int, db: Session = Depends(get_db)):
    return safety_service.assess_destination_safety(db, location_id)

@router.get("/advisories", response_model=List[OfficialAdvisoryResponse])
def list_advisories(db: Session = Depends(get_db)):
    advisories = db.query(OfficialAdvisory).all()
    resp = []
    for a in advisories:
        resp.append({
            "id": a.id,
            "destination_id": a.destination_id,
            "advisory_level": a.advisory_level,
            "advisory_text": a.advisory_text,
            "issued_date": a.issued_date.isoformat(),
            "source_organization": a.source_organization,
            "source_url": a.source_url,
            "emergency_contacts": a.emergency_contacts
        })
    return resp

@router.post("/assess", response_model=SafetyAssessmentResponse)
def assess_safety(
    destination_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return safety_service.assess_destination_safety(db, destination_id)
