from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.destination import Destination
from app.core.config import settings

try:
    from ml.src.predict import get_ml_suite
except Exception:
    get_ml_suite = None

class BudgetService:
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

    def estimate_trip_budget(
        self,
        db: Session,
        origin: str,
        destination_id: int,
        num_days: int,
        num_travelers: int = 1,
        transport_mode: str = "train",
        accommodation_tier: str = "hotel",
        meal_tier: str = "moderate",
        local_transit_mode: str = "mixed"
    ) -> Dict[str, Any]:
        dest = db.query(Destination).filter(Destination.id == destination_id).first()
        dest_name = dest.name if dest else "Destination"

        # 1. Check if remote ML service binding is configured (Vercel Services)
        if settings.ML_SERVICE_URL:
            try:
                import httpx
                resp = httpx.post(
                    f"{settings.ML_SERVICE_URL.rstrip('/')}/budget/estimate",
                    json={
                        "origin": origin,
                        "destination_name": dest_name,
                        "num_days": num_days,
                        "num_travelers": num_travelers,
                        "transport_mode": transport_mode,
                        "accommodation_tier": accommodation_tier,
                        "meal_tier": meal_tier
                    },
                    timeout=5.0
                )
                if resp.status_code == 200:
                    return resp.json()
            except Exception as e:
                print(f"[BudgetService] Remote ML service call failed: {e}. Falling back to local.")

        # 2. Local ML estimator
        if self.ml and getattr(self.ml, "budget_estimator", None):
            return self.ml.estimate_budget(
                origin=origin,
                destination_name=dest_name,
                num_days=num_days,
                num_travelers=num_travelers,
                transport_mode=transport_mode,
                accommodation_tier=accommodation_tier,
                meal_tier=meal_tier
            )

        # 3. Resilient heuristic baseline if ML suite is offline
        transit_cost = 1500.0 * num_travelers * 2
        acc_cost = 2400.0 * max(1, num_days - 1) * max(1, (num_travelers + 1) // 2)
        food_cost = 800.0 * num_days * num_travelers
        local_transit = 400.0 * num_days
        activities = 350.0 * num_days * num_travelers
        subtotal = transit_cost + acc_cost + food_cost + local_transit + activities
        reserve = round(subtotal * 0.12, 2)
        total = round(subtotal + reserve, 2)

        return {
            "total_estimated_budget": total,
            "cost_per_person": round(total / num_travelers, 2),
            "currency": "INR",
            "low_range": round(total * 0.88, 2),
            "high_range": round(total * 1.15, 2),
            "breakdown": [
                {"category": "Intercity Transport", "amount": transit_cost, "percentage": round((transit_cost/total)*100, 1), "notes": f"Round-trip {transport_mode}"},
                {"category": "Accommodation", "amount": acc_cost, "percentage": round((acc_cost/total)*100, 1), "notes": f"{num_days - 1} nights"},
                {"category": "Food & Dining", "amount": food_cost, "percentage": round((food_cost/total)*100, 1), "notes": f"{num_days} days ({meal_tier})"},
                {"category": "Local Sightseeing & Transit", "amount": local_transit, "percentage": round((local_transit/total)*100, 1), "notes": "Local cabs / autos"},
                {"category": "Activities & Admissions", "amount": activities, "percentage": round((activities/total)*100, 1), "notes": "Monument & fort entry fees"},
                {"category": "Contingency Reserve", "amount": reserve, "percentage": round((reserve/total)*100, 1), "notes": "12% safety buffer"}
            ]
        }

budget_service = BudgetService()
