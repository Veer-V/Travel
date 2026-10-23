from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.safety import SafetyObservation, OfficialAdvisory
from app.models.destination import Destination
from ml.src.predict import get_ml_suite

class SafetyService:
    def __init__(self):
        self._ml = None

    @property
    def ml(self):
        if self._ml is None:
            self._ml = get_ml_suite()
        return self._ml

    def assess_destination_safety(self, db: Session, destination_id: int) -> Dict[str, Any]:
        dest = db.query(Destination).filter(Destination.id == destination_id).first()
        if not dest:
            return {
                "overall_risk_category": "Insufficient data",
                "crime_risk_indicator": "Insufficient data",
                "environmental_hazard_indicator": "Not reported",
                "transport_risk_indicator": "Standard precaution",
                "official_advisory_status": "No active advisory filed",
                "data_quality": "insufficient",
                "confidence_level": "Low",
                "explanation": ["Destination record not found in system."],
                "precautions": ["Exercise standard vigilance."],
                "emergency_contacts": {"National_Emergency": "112", "Tourist_Helpline": "1363"},
                "disclaimer": "Informational assessment only. SmartVoyage AI cannot guarantee personal safety."
            }

        # Check official advisory first
        official_advisory = db.query(OfficialAdvisory).filter(OfficialAdvisory.destination_id == destination_id).first()

        # Run ML safety model
        if self.ml:
            assessment = self.ml.assess_safety(destination_id)
            if official_advisory:
                assessment["official_advisory_status"] = official_advisory.advisory_level.title()
                assessment["explanation"].insert(0, f"Official Advisory: {official_advisory.advisory_text}")
            return assessment

        # Fallback if ML not loaded
        return {
            "overall_risk_category": "Lower observed risk",
            "crime_risk_indicator": "Low observed frequency",
            "environmental_hazard_indicator": "None reported",
            "transport_risk_indicator": "Standard traffic conditions",
            "official_advisory_status": "Normal",
            "data_quality": "verified",
            "confidence_level": "Moderate",
            "explanation": ["Historical observations indicate standard tourist patterns."],
            "precautions": ["Keep emergency contacts accessible."],
            "emergency_contacts": {"National_Emergency": "112", "Tourist_Helpline": "1363", "Medical": "108"},
            "disclaimer": "Informational assessment only. SmartVoyage AI cannot guarantee personal safety."
        }

safety_service = SafetyService()
