from typing import Optional, List, Dict
from pydantic import BaseModel

class SafetyAssessmentResponse(BaseModel):
    overall_risk_category: str
    crime_risk_indicator: str
    environmental_hazard_indicator: str
    transport_risk_indicator: str
    official_advisory_status: str
    data_quality: str
    confidence_level: str
    explanation: List[str]
    precautions: List[str]
    emergency_contacts: Dict[str, str]
    source_provenance: Optional[str] = "NCRB Public Statistics / IMD Bulletins / Official Tourism Registry"
    disclaimer: str = "Informational assessment only. SmartVoyage AI cannot guarantee personal safety."

class OfficialAdvisoryResponse(BaseModel):
    id: int
    destination_id: int
    advisory_level: str
    advisory_text: str
    issued_date: str
    source_organization: str
    source_url: Optional[str] = None
    emergency_contacts: Optional[str] = None

class BudgetEstimateRequest(BaseModel):
    origin: str
    destination_id: int
    destination_name: Optional[str] = None
    start_date: str
    end_date: str
    num_days: int
    num_travelers: int = 1
    transport_mode: str = "train"
    accommodation_tier: str = "hotel"
    meal_tier: str = "moderate"
    local_transit_mode: str = "mixed"

class BudgetCategoryItem(BaseModel):
    category: str
    amount: float
    percentage: float
    notes: Optional[str] = None

class BudgetEstimateResponse(BaseModel):
    total_estimated_budget: float
    cost_per_person: float
    currency: str = "INR"
    low_range: float
    high_range: float
    breakdown: List[BudgetCategoryItem]
    parameters: Dict[str, Any] if False else dict
    disclaimer: str
