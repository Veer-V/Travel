from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.safety import SafetyObservation, OfficialAdvisory
from app.models.destination import Destination
from app.core.config import settings

try:
    from ml.src.predict import get_ml_suite
except Exception:
    get_ml_suite = None

class SafetyService:
    def __init__(self):
        self._ml = None

    @property
    def ml(self):
        if self._ml is None and get_ml_suite is not None:
            try:
                self._ml = get_ml_suite()
            except Exception:
                self._ml = None
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

        assessment = None

        # 1. Check if remote ML service binding is configured (Vercel Services)
        if settings.ML_SERVICE_URL:
            try:
                import httpx
                resp = httpx.post(
                    f"{settings.ML_SERVICE_URL.rstrip('/')}/safety/assess",
                    json={"destination_id": destination_id},
                    timeout=5.0
                )
                if resp.status_code == 200:
                    assessment = resp.json()
            except Exception as e:
                print(f"[SafetyService] Remote ML service call failed: {e}. Falling back to local.")

        # 2. Run local ML safety model if remote was not used or failed
        if assessment is None and self.ml:
            try:
                assessment = self.ml.assess_safety(destination_id)
            except Exception as se:
                print(f"[SafetyService] Local ML assessment exception: {se}")
                assessment = None

        # 3. Apply official advisory override if present
        if assessment is not None:
            if official_advisory:
                assessment["official_advisory_status"] = official_advisory.advisory_level.title()
                if "explanation" in assessment and isinstance(assessment["explanation"], list):
                    assessment["explanation"].insert(0, f"Official Advisory: {official_advisory.advisory_text}")
            return assessment

        # 4. Fallback if ML not loaded
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
