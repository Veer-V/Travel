import os
import sys
import pandas as pd
from typing import List, Dict, Any

class DataValidator:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.summary: Dict[str, Any] = {}

    def validate_all(self) -> bool:
        print(f"=== Starting SmartVoyage Data Validation Pipeline for: {self.data_dir} ===")
        
        # 1. Validate destinations.csv
        dest_path = os.path.join(self.data_dir, "destinations.csv")
        if not os.path.exists(dest_path):
            self.errors.append("destinations.csv is missing")
            return False
        
        dest_df = pd.read_csv(dest_path)
        self.summary["destinations_count"] = len(dest_df)
        
        # Check required columns
        req_dest_cols = ["destination_id", "destination_name", "state_or_region", "country", "latitude", "longitude", "destination_type"]
        for c in req_dest_cols:
            if c not in dest_df.columns:
                self.errors.append(f"destinations.csv missing column: {c}")

        # Validate coordinate bounds for India (lat: 8.0 to 37.0, lon: 68.0 to 97.5)
        invalid_lats = dest_df[(dest_df["latitude"] < 8.0) | (dest_df["latitude"] > 37.5)]
        invalid_lons = dest_df[(dest_df["longitude"] < 68.0) | (dest_df["longitude"] > 97.5)]
        if not invalid_lats.empty:
            self.errors.append(f"destinations.csv has {len(invalid_lats)} records with out-of-bounds latitude")
        if not invalid_lons.empty:
            self.errors.append(f"destinations.csv has {len(invalid_lons)} records with out-of-bounds longitude")

        # Check for duplicate destination names or IDs
        if dest_df["destination_id"].duplicated().any():
            self.errors.append("destinations.csv contains duplicate destination_id")
        if dest_df["destination_name"].duplicated().any():
            self.warnings.append("destinations.csv has duplicate destination_name")

        valid_dest_ids = set(dest_df["destination_id"])

        # 2. Validate attractions.csv
        attr_path = os.path.join(self.data_dir, "attractions.csv")
        if os.path.exists(attr_path):
            attr_df = pd.read_csv(attr_path)
            self.summary["attractions_count"] = len(attr_df)
            
            # Check foreign keys
            orphan_attrs = attr_df[~attr_df["destination_id"].isin(valid_dest_ids)]
            if not orphan_attrs.empty:
                self.errors.append(f"attractions.csv has {len(orphan_attrs)} orphan records referencing non-existent destination_id")

            # Check prices and durations
            neg_prices = attr_df[attr_df["admission_price"] < 0]
            neg_dur = attr_df[attr_df["estimated_visit_duration"] <= 0]
            if not neg_prices.empty:
                self.errors.append(f"attractions.csv has {len(neg_prices)} negative admission prices")
            if not neg_dur.empty:
                self.errors.append(f"attractions.csv has {len(neg_dur)} non-positive visit durations")

            # Check ratings range
            invalid_ratings = attr_df[(attr_df["rating"] < 1.0) | (attr_df["rating"] > 5.0)]
            if not invalid_ratings.empty:
                self.errors.append(f"attractions.csv has {len(invalid_ratings)} ratings outside 1.0 - 5.0")

        # 3. Validate restaurants.csv
        rest_path = os.path.join(self.data_dir, "restaurants.csv")
        if os.path.exists(rest_path):
            rest_df = pd.read_csv(rest_path)
            self.summary["restaurants_count"] = len(rest_df)
            orphan_rest = rest_df[~rest_df["destination_id"].isin(valid_dest_ids)]
            if not orphan_rest.empty:
                self.errors.append(f"restaurants.csv has {len(orphan_rest)} orphan records")

        # 4. Validate accommodations.csv
        acc_path = os.path.join(self.data_dir, "accommodations.csv")
        if os.path.exists(acc_path):
            acc_df = pd.read_csv(acc_path)
            self.summary["accommodations_count"] = len(acc_df)
            neg_tariff = acc_df[acc_df["price_per_night"] <= 0]
            if not neg_tariff.empty:
                self.errors.append(f"accommodations.csv has {len(neg_tariff)} non-positive room prices")

        # 5. Validate safety_observations.csv
        safety_path = os.path.join(self.data_dir, "safety_observations.csv")
        if os.path.exists(safety_path):
            safety_df = pd.read_csv(safety_path)
            self.summary["safety_observations_count"] = len(safety_df)
            neg_inc = safety_df[safety_df["incident_count"] < 0]
            if not neg_inc.empty:
                self.errors.append(f"safety_observations.csv has {len(neg_inc)} negative incident counts")

        # 6. Validate travel_costs.csv
        cost_path = os.path.join(self.data_dir, "travel_costs.csv")
        if os.path.exists(cost_path):
            cost_df = pd.read_csv(cost_path)
            self.summary["cost_benchmarks_count"] = len(cost_df)
            neg_cost = cost_df[cost_df["estimated_amount"] <= 0]
            if not neg_cost.empty:
                self.errors.append(f"travel_costs.csv has {len(neg_cost)} non-positive cost benchmarks")

        # Print validation summary
        print(f"Summary: {self.summary}")
        if self.warnings:
            print(f"Warnings ({len(self.warnings)}):")
            for w in self.warnings:
                print(f"  - [WARN] {w}")
        
        if self.errors:
            print(f"Errors ({len(self.errors)}):")
            for e in self.errors:
                print(f"  - [ERROR] {e}")
            return False

        print(">>> ALL DATASETS PASSED VALIDATION! Ready for ML & Production. <<<")
        return True

if __name__ == "__main__":
    dir_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "sample")
    validator = DataValidator(dir_path)
    success = validator.validate_all()
    sys.exit(0 if success else 1)
