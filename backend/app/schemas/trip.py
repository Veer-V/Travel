from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime

class PlanTripRequest(BaseModel):
    title: Optional[str] = None
    origin: str
    destination_id: int
    start_date: str # YYYY-MM-DD
    end_date: str # YYYY-MM-DD
    num_travelers: int = 1
    total_budget: float = 20000.0
    currency: str = "INR"
    travel_style: str = "cultural" # adventure, family, romantic, cultural, historical, nature, relaxation, budget
    transport_preference: str = "train"
    accommodation_preference: str = "hotel"
    food_preference: str = "standard"
    accessibility_requirements: str = "none"

class ItineraryItemResponse(BaseModel):
    id: str
    time_slot: str
    start_time: str
    end_time: str
    activity_name: str
    activity_type: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    travel_mode: str
    travel_duration_minutes: int
    visit_duration_minutes: int
    estimated_cost: float
    booking_required: bool
    data_source: str
    order_index: int

    class Config:
        from_attributes = True

class ItineraryResponse(BaseModel):
    id: str
    day_number: int
    date: str
    daily_expense_estimate: float
    notes: Optional[str] = None
    items: List[ItineraryItemResponse] = []

    class Config:
        from_attributes = True

class ExpenseResponse(BaseModel):
    id: str
    category: str
    amount: float
    currency: str = "INR"
    description: Optional[str] = None
    date: str
    is_actual: bool

    class Config:
        from_attributes = True

class TripResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    destination_id: int
    destination_name: Optional[str] = None
    title: str
    origin: str
    start_date: str
    end_date: str
    total_days: int
    num_travelers: int
    total_budget: float
    currency: str = "INR"
    travel_style: str
    transport_preference: str
    accommodation_preference: str
    food_preference: str
    accessibility_requirements: str
    safety_notes: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    itineraries: List[ItineraryResponse] = []
    expenses: List[ExpenseResponse] = []
    budget_breakdown: Optional[Dict[str, Any]] = None
    safety_assessment: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
