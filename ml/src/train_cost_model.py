import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any, Optional

class TripBudgetEstimator:
    def __init__(self):
        self.model = None
        self.destinations_df: Optional[pd.DataFrame] = None
        self.transport_df: Optional[pd.DataFrame] = None
        self.costs_df: Optional[pd.DataFrame] = None
        
        # Baseline category multipliers
        self.accommodation_multipliers = {
            "hostel": 750.0,
            "guesthouse": 1400.0,
            "hotel": 2400.0,
            "resort": 5500.0,
            "homestay": 1800.0
        }
        self.meal_daily_multipliers = {
            "budget": 450.0,
            "moderate": 850.0,
            "fine_dining": 1800.0
        }
        self.local_transit_daily_multipliers = {
            "public_transit": 150.0,
            "mixed": 350.0,
            "private_cab": 800.0
        }

    def fit(self, data_dir: str):
        self.destinations_df = pd.read_csv(os.path.join(data_dir, "destinations.csv"))
        self.transport_df = pd.read_csv(os.path.join(data_dir, "transport_options.csv"))
        self.costs_df = pd.read_csv(os.path.join(data_dir, "travel_costs.csv"))

        # Generate synthetic historical trip cost combinations for training regression model
        records = []
        travel_modes = ["train", "flight", "bus", "car"]
        acc_tiers = ["hostel", "hotel", "resort"]
        meal_tiers = ["budget", "moderate", "fine_dining"]
        
        origins = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"]
        
        np.random.seed(42)
        for _ in range(1200):
            orig = np.random.choice(origins)
            dest_row = self.destinations_df.sample(1).iloc[0]
            dest_name = dest_row["destination_name"]
            if orig == dest_name:
                continue

            num_days = int(np.random.randint(2, 10))
            num_travelers = int(np.random.randint(1, 6))
            transport_mode = np.random.choice(travel_modes)
            acc_tier = np.random.choice(acc_tiers)
            meal_tier = np.random.choice(meal_tiers)

            # Find intercity transport estimate
            t_match = self.transport_df[
                (self.transport_df["origin"] == orig) &
                (self.transport_df["destination"] == dest_name) &
                (self.transport_df["transport_mode"] == transport_mode)
            ]
            if not t_match.empty:
                intercity_one_way = float(t_match.iloc[0]["estimated_cost"])
            else:
                intercity_one_way = 1200.0 if transport_mode != "flight" else 4500.0
            
            intercity_total = intercity_one_way * 2 * num_travelers
            
            # Rooms needed: ceil(travelers / 2)
            rooms = max(1, (num_travelers + 1) // 2)
            acc_nightly = self.accommodation_multipliers.get(acc_tier, 2400.0)
            accommodation_total = acc_nightly * (num_days - 1) * rooms

            # Food
            meal_daily = self.meal_daily_multipliers.get(meal_tier, 850.0)
            food_total = meal_daily * num_days * num_travelers

            # Local transit
            local_transit_total = 400.0 * num_days * max(1, (num_travelers + 2) // 4)

            # Activities & tickets
            activities_total = 350.0 * num_days * num_travelers

            subtotal = intercity_total + accommodation_total + food_total + local_transit_total + activities_total
            reserve = round(subtotal * 0.12, 2)
            total_cost = subtotal + reserve

            # Add minor realistic noise (±5%)
            noisy_total = total_cost * np.random.uniform(0.95, 1.05)

            records.append({
                "num_days": num_days,
                "num_travelers": num_travelers,
                "transport_mode_code": travel_modes.index(transport_mode),
                "acc_tier_code": acc_tiers.index(acc_tier),
                "meal_tier_code": meal_tiers.index(meal_tier),
                "intercity_cost": intercity_total,
                "accommodation_cost": accommodation_total,
                "food_cost": food_total,
                "local_transit_cost": local_transit_total,
                "activities_cost": activities_total,
                "total_cost": round(noisy_total, 2)
            })

        sim_df = pd.DataFrame(records)
        X = sim_df[["num_days", "num_travelers", "transport_mode_code", "acc_tier_code", "meal_tier_code", "intercity_cost"]]
        y = sim_df["total_cost"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        reg = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
        reg.fit(X_train, y_train)
        self.model = reg

        preds = reg.predict(X_test)
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)

        print(f"\nTrip Budget Regression Evaluation:")
        print(f"R2 Score: {r2:.4f}")
        print(f"Mean Absolute Error (MAE): INR {mae:.2f}")
        print(f"Root Mean Squared Error (RMSE): INR {rmse:.2f}")
        return self

    def estimate_budget(
        self,
        origin: str,
        destination_name: str,
        num_days: int,
        num_travelers: int,
        transport_mode: str = "train",
        accommodation_tier: str = "hotel",
        meal_tier: str = "moderate",
        local_transit_mode: str = "mixed"
    ) -> Dict[str, Any]:
        # Intercity transport lookup
        intercity_one_way = 1200.0
        if self.transport_df is not None:
            match = self.transport_df[
                (self.transport_df["origin"].str.lower() == origin.lower()) &
                (self.transport_df["destination"].str.lower() == destination_name.lower()) &
                (self.transport_df["transport_mode"].str.lower() == transport_mode.lower())
            ]
            if not match.empty:
                intercity_one_way = float(match.iloc[0]["estimated_cost"])
            else:
                intercity_one_way = 3500.0 if transport_mode.lower() == "flight" else 1000.0

        intercity_total = round(intercity_one_way * 2 * num_travelers, 2)
        
        # Nights = max(1, days - 1)
        nights = max(1, num_days - 1)
        rooms = max(1, (num_travelers + 1) // 2)
        nightly_rate = self.accommodation_multipliers.get(accommodation_tier.lower(), 2400.0)
        acc_total = round(nightly_rate * nights * rooms, 2)

        # Meals
        meal_rate = self.meal_daily_multipliers.get(meal_tier.lower(), 850.0)
        food_total = round(meal_rate * num_days * num_travelers, 2)

        # Local transit
        transit_rate = self.local_transit_daily_multipliers.get(local_transit_mode.lower(), 350.0)
        cabs_needed = max(1, (num_travelers + 2) // 4)
        local_transit_total = round(transit_rate * num_days * cabs_needed, 2)

        # Activities & sightseeing tickets
        activities_total = round(400.0 * num_days * num_travelers, 2)

        subtotal = intercity_total + acc_total + food_total + local_transit_total + activities_total
        emergency_reserve = round(subtotal * 0.12, 2) # 12% contingency
        total_estimate = round(subtotal + emergency_reserve, 2)

        low_range = round(total_estimate * 0.88, 2)
        high_range = round(total_estimate * 1.15, 2)

        cost_per_person = round(total_estimate / max(1, num_travelers), 2)

        breakdown = [
            {"category": "Intercity Transport", "amount": intercity_total, "percentage": round((intercity_total/total_estimate)*100, 1), "notes": f"Round-trip {transport_mode} for {num_travelers} travelers"},
            {"category": "Accommodation", "amount": acc_total, "percentage": round((acc_total/total_estimate)*100, 1), "notes": f"{nights} nights, {rooms} room(s) ({accommodation_tier})"},
            {"category": "Food & Dining", "amount": food_total, "percentage": round((food_total/total_estimate)*100, 1), "notes": f"{num_days} days of meals ({meal_tier})"},
            {"category": "Local Transportation", "amount": local_transit_total, "percentage": round((local_transit_total/total_estimate)*100, 1), "notes": f"Local cabs/metro for {num_days} days"},
            {"category": "Activities & Admissions", "amount": activities_total, "percentage": round((activities_total/total_estimate)*100, 1), "notes": "Sightseeing, monuments & experiences"},
            {"category": "Emergency & Reserve", "amount": emergency_reserve, "percentage": round((emergency_reserve/total_estimate)*100, 1), "notes": "12% contingency reserve"}
        ]

        return {
            "total_estimated_budget": total_estimate,
            "cost_per_person": cost_per_person,
            "currency": "INR",
            "low_range": low_range,
            "high_range": high_range,
            "breakdown": breakdown,
            "parameters": {
                "origin": origin,
                "destination": destination_name,
                "days": num_days,
                "nights": nights,
                "travelers": num_travelers,
                "rooms": rooms,
                "transport_mode": transport_mode,
                "accommodation_tier": accommodation_tier,
                "meal_tier": meal_tier
            },
            "disclaimer": "Live hotel and ticket fares fluctuate with seasonal demand. This estimate incorporates historical regional averages."
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            "model": self.model,
            "destinations_df": self.destinations_df,
            "transport_df": self.transport_df,
            "costs_df": self.costs_df,
            "accommodation_multipliers": self.accommodation_multipliers,
            "meal_daily_multipliers": self.meal_daily_multipliers,
            "local_transit_daily_multipliers": self.local_transit_daily_multipliers
        }, filepath)
        print(f"Budget estimation model persisted to: {filepath}")

    @classmethod
    def load(cls, filepath: str) -> "TripBudgetEstimator":
        data = joblib.load(filepath)
        b = cls()
        b.model = data["model"]
        b.destinations_df = data["destinations_df"]
        b.transport_df = data["transport_df"]
        b.costs_df = data["costs_df"]
        b.accommodation_multipliers = data["accommodation_multipliers"]
        b.meal_daily_multipliers = data["meal_daily_multipliers"]
        b.local_transit_daily_multipliers = data["local_transit_daily_multipliers"]
        return b

def train_budget_engine(data_dir: str, model_path: str):
    estimator = TripBudgetEstimator()
    estimator.fit(data_dir)
    estimator.save(model_path)

    sample_est = estimator.estimate_budget(
        origin="Delhi",
        destination_name="Jaipur",
        num_days=4,
        num_travelers=2,
        transport_mode="train",
        accommodation_tier="hotel",
        meal_tier="moderate"
    )
    print(f"\nSample Budget Estimation (Delhi -> Jaipur, 4 Days, 2 Travelers):")
    print(f"Total: INR {sample_est['total_estimated_budget']} (Range: INR {sample_est['low_range']} - INR {sample_est['high_range']})")
    print(f"Per Person: INR {sample_est['cost_per_person']}")
    for item in sample_est["breakdown"]:
        print(f"  - {item['category']}: INR {item['amount']} ({item['percentage']}%)")
    return estimator

if __name__ == "__main__":
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    d_dir = os.path.join(base, "datasets", "sample")
    m_path = os.path.join(base, "ml", "models", "budget_model.joblib")
    train_budget_engine(d_dir, m_path)
