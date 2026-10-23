import os
from typing import Dict, Any, List, Optional
import pandas as pd
from ml.src.train_recommender import TravelRecommender
from ml.src.train_safety_model import SafetyRiskModel
from ml.src.train_cost_model import TripBudgetEstimator

class MLInferenceSuite:
    _instance = None

    def __init__(self, models_dir: str, datasets_dir: str):
        self.models_dir = models_dir
        self.datasets_dir = datasets_dir
        self.recommender: Optional[TravelRecommender] = None
        self.safety_model: Optional[SafetyRiskModel] = None
        self.budget_estimator: Optional[TripBudgetEstimator] = None
        
        self.dest_df = pd.read_csv(os.path.join(datasets_dir, "destinations.csv"))
        self.safety_df = pd.read_csv(os.path.join(datasets_dir, "safety_observations.csv"))
        self._load_models()

    def _load_models(self):
        rec_path = os.path.join(self.models_dir, "recommender.joblib")
        if os.path.exists(rec_path):
            self.recommender = TravelRecommender.load(rec_path)
            print("Loaded TravelRecommender.")
        else:
            print("TravelRecommender artifact not found, running without recommender artifact.")

        safety_path = os.path.join(self.models_dir, "safety_model.joblib")
        if os.path.exists(safety_path):
            self.safety_model = SafetyRiskModel.load(safety_path)
            print("Loaded SafetyRiskModel.")

        budget_path = os.path.join(self.models_dir, "budget_model.joblib")
        if os.path.exists(budget_path):
            self.budget_estimator = TripBudgetEstimator.load(budget_path)
            print("Loaded TripBudgetEstimator.")

    def recommend(
        self,
        destination_id: int,
        travel_style: str = "cultural",
        interests: List[str] = None,
        budget: float = 20000.0,
        accessibility_req: str = "none",
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        if not self.recommender:
            return []
        return self.recommender.recommend_attractions(
            destination_id=destination_id,
            travel_style=travel_style,
            interests=interests or [],
            budget=budget,
            accessibility_req=accessibility_req,
            top_k=top_k
        )

    def assess_safety(self, destination_id: int) -> Dict[str, Any]:
        dest_match = self.dest_df[self.dest_df["destination_id"] == destination_id]
        if dest_match.empty:
            dest_row = None
        else:
            dest_row = dest_match.iloc[0]

        obs_match = self.safety_df[self.safety_df["location_id"] == destination_id]
        if obs_match.empty:
            obs_row = None
        else:
            obs_row = obs_match.iloc[0]

        if self.safety_model:
            return self.safety_model.assess_location(destination_id, obs_row, dest_row)
        
        # Safe fallback
        return {
            "overall_risk_category": "Insufficient data",
            "explanation": ["Safety model artifact is currently offline."]
        }

    def estimate_budget(
        self,
        origin: str,
        destination_name: str,
        num_days: int,
        num_travelers: int,
        transport_mode: str = "train",
        accommodation_tier: str = "hotel",
        meal_tier: str = "moderate"
    ) -> Dict[str, Any]:
        if self.budget_estimator:
            return self.budget_estimator.estimate_budget(
                origin=origin,
                destination_name=destination_name,
                num_days=num_days,
                num_travelers=num_travelers,
                transport_mode=transport_mode,
                accommodation_tier=accommodation_tier,
                meal_tier=meal_tier
            )
        return {
            "total_estimated_budget": 15000.0,
            "cost_per_person": 15000.0,
            "currency": "INR",
            "breakdown": []
        }

# Factory instance getter
def get_ml_suite() -> MLInferenceSuite:
    global _ml_suite
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    models_dir = os.path.join(base, "ml", "models")
    datasets_dir = os.path.join(base, "datasets", "sample")
    return MLInferenceSuite(models_dir, datasets_dir)
