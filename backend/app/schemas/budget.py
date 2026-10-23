from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class BudgetEstimateRequest(BaseModel):
    origin: str
    destination_id: int
    destination_name: Optional[str] = None
    num_days: int = 3
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
    parameters: Optional[Dict[str, Any]] = None
    disclaimer: str
