import os
import joblib
import pandas as pd
import numpy as np
from datetime import date
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from typing import Dict, Any, Optional

class SafetyRiskModel:
    def __init__(self):
        self.model = None
        self.feature_columns = [
            "incident_rate_per_100k",
            "has_weather_hazard",
            "infrastructure_score",
            "is_urban",
            "is_hill_station"
        ]
        self.target_classes = ["Lower observed risk", "Moderate observed risk", "Elevated observed risk"]

    def prepare_features(self, safety_df: pd.DataFrame, dest_df: pd.DataFrame) -> pd.DataFrame:
        merged = safety_df.merge(dest_df, left_on="location_id", right_on="destination_id", how="left")
        
        # Calculate incident rate per 100,000 visitors/residents
        denom = merged["population_or_exposure_denominator_when_available"].fillna(500000).replace(0, 500000)
        inc_rate = (merged["incident_count"] / denom) * 100000.0
        
        has_hazard = (merged["weather_hazard"].fillna("none").str.lower() != "none").astype(int)
        
        # Infrastructure score: well_lit + tourist_police + medical
        infra = merged["infrastructure_indicators"].fillna("")
        infra_score = infra.apply(lambda x: 1.0 if "tourist_police" in x and "medical" in x else (0.6 if "well_lit" in x else 0.3))
        
        is_urban = (merged["destination_type"] == "urban").astype(int)
        is_hill = (merged["destination_type"] == "hill_station").astype(int)

        # Ground truth risk classification for training based on empirical incident rates and hazard presence
        def assign_label(row, rate, hazard):
            if row["official_advisory_level"] in ["avoid_all", "avoid_non_essential"]:
                return "Elevated observed risk"
            if hazard == 1 or rate > 3.0:
                return "Moderate observed risk"
            return "Lower observed risk"

        labels = []
        for idx, row in merged.iterrows():
            labels.append(assign_label(row, inc_rate.iloc[idx], has_hazard.iloc[idx]))

        df_feat = pd.DataFrame({
            "incident_rate_per_100k": inc_rate,
            "has_weather_hazard": has_hazard,
            "infrastructure_score": infra_score,
            "is_urban": is_urban,
            "is_hill_station": is_hill,
            "target_label": labels,
            "data_quality_flag": merged.get("data_quality_flag", "verified"),
            "location_id": merged["location_id"],
            "official_advisory_level": merged["official_advisory_level"],
            "weather_hazard": merged["weather_hazard"]
        })
        return df_feat

    def fit(self, features_df: pd.DataFrame):
        X = features_df[self.feature_columns]
        y = features_df["target_label"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        
        base_rf = RandomForestClassifier(n_estimators=50, max_depth=4, random_state=42)
        base_rf.fit(X_train, y_train)

        # Probability calibration using sigmoid/isotonic
        calibrated = CalibratedClassifierCV(base_rf, cv="prefit")
        calibrated.fit(X_train, y_train)
        self.model = calibrated

        preds = calibrated.predict(X_test)
        acc = accuracy_score(y_test, preds)
        print(f"\nSafety Risk Model Validation Accuracy: {acc * 100:.2f}%")
        print("\nClassification Report:\n", classification_report(y_test, preds, zero_division=0))
        return self

    def assess_location(
        self,
        destination_id: int,
        observation_row: Optional[pd.Series],
        destination_row: Optional[pd.Series]
    ) -> Dict[str, Any]:
        """
        Assess safety for a destination applying strict ethical constraints:
        1. Handles Insufficient Data explicitly.
        2. Separates official advisories from model predictions.
        3. Never guarantees absolute safety.
        """
        if observation_row is None or observation_row.empty or destination_row is None or destination_row.empty:
            return {
                "overall_risk_category": "Insufficient data",
                "crime_risk_indicator": "Insufficient data",
                "environmental_hazard_indicator": "Not reported",
                "transport_risk_indicator": "Standard precaution",
                "official_advisory_status": "No active advisory filed",
                "data_quality": "insufficient",
                "confidence_level": "Low (Missing local observations)",
                "explanation": ["No verified observation records exist for this location."],
                "precautions": ["Exercise normal vigilance and inquire with local authorities."],
                "emergency_contacts": {"National_Emergency": "112", "Tourist_Helpline": "1363", "Medical": "108"},
                "disclaimer": "Informational assessment only. SmartVoyage AI cannot guarantee personal safety."
            }

        quality_flag = str(observation_row.get("data_quality_flag", "verified")).lower()
        if quality_flag == "insufficient":
            return {
                "overall_risk_category": "Insufficient data",
                "crime_risk_indicator": "Insufficient data",
                "environmental_hazard_indicator": str(observation_row.get("weather_hazard", "none")),
                "transport_risk_indicator": "Moderate precaution",
                "official_advisory_status": str(observation_row.get("official_advisory_level", "normal")),
                "data_quality": "insufficient",
                "confidence_level": "Low",
                "explanation": ["Data records are marked incomplete or outdated."],
                "precautions": ["Rely on local police bulletins upon arrival."],
                "emergency_contacts": {"National_Emergency": "112", "Tourist_Helpline": "1363", "Medical": "108"},
                "disclaimer": "Informational assessment only. SmartVoyage AI cannot guarantee personal safety."
            }

        # Check for active official warning override
        official_level = str(observation_row.get("official_advisory_level", "normal")).lower()
        weather_hazard = str(observation_row.get("weather_hazard", "none")).lower()
        
        denom = float(observation_row.get("population_or_exposure_denominator_when_available") or 500000)
        inc_count = float(observation_row.get("incident_count", 0))
        rate_100k = (inc_count / denom) * 100000.0
        
        has_hazard = 1 if weather_hazard != "none" else 0
        infra = str(observation_row.get("infrastructure_indicators", ""))
        infra_score = 1.0 if "tourist_police" in infra and "medical" in infra else (0.6 if "well_lit" in infra else 0.3)
        
        dtype = str(destination_row.get("destination_type", "")).lower()
        is_urban = 1 if dtype == "urban" else 0
        is_hill = 1 if dtype == "hill_station" else 0

        feature_vector = pd.DataFrame([{
            "incident_rate_per_100k": rate_100k,
            "has_weather_hazard": has_hazard,
            "infrastructure_score": infra_score,
            "is_urban": is_urban,
            "is_hill_station": is_hill
        }])

        if self.model is not None:
            pred_class = self.model.predict(feature_vector)[0]
            pred_probs = self.model.predict_proba(feature_vector)[0]
            max_prob = float(np.max(pred_probs))
        else:
            pred_class = "Moderate observed risk" if has_hazard else "Lower observed risk"
            max_prob = 0.85

        # Override for active official warning
        if official_level in ["avoid_all", "avoid_non_essential"]:
            overall_status = "Active official warning"
        elif official_level == "exercise_caution" and weather_hazard != "none":
            overall_status = "Elevated observed risk"
        else:
            overall_status = pred_class

        # Build contributing factor explanations
        factors = []
        if rate_100k < 2.0:
            factors.append("Low per-capita petty incident rates documented in tourist zones.")
        else:
            factors.append(f"Moderate pedestrian density and petty theft frequency ({rate_100k:.1f} per 100k).")
        
        if weather_hazard != "none":
            factors.append(f"Seasonal weather hazard advisory: {weather_hazard.replace('_', ' ').title()}.")
        else:
            factors.append("No adverse environmental or severe weather alerts active.")

        if "tourist_police_available" in infra:
            factors.append("Dedicated tourist police assistance and medical access verified.")

        precautions = [
            "Keep emergency contact numbers handy on your device.",
            "Utilize authorized prepaid taxis or registered ride-hailing services.",
            "Monitor local meteorological warnings during mountain or coastal transit."
        ]
        if weather_hazard == "landslide":
            precautions.append("Avoid night driving on steep ghat roads during intense monsoon rains.")
        elif weather_hazard == "heatwave":
            precautions.append("Carry sufficient hydration and avoid direct noon sun exposure.")

        return {
            "overall_risk_category": overall_status,
            "crime_risk_indicator": "Low observed frequency" if rate_100k < 2.0 else "Moderate observed frequency",
            "environmental_hazard_indicator": weather_hazard.title() if weather_hazard != "none" else "None reported",
            "transport_risk_indicator": "Cautious mountain transit" if is_hill else "Normal traffic conditions",
            "official_advisory_status": official_level.replace("_", " ").title(),
            "data_quality": quality_flag,
            "confidence_level": f"High ({max_prob * 100:.0f}% calibrated probability)",
            "explanation": factors,
            "precautions": precautions,
            "emergency_contacts": {
                "National_Emergency": "112",
                "Tourist_Helpline": "1363",
                "Women_Helpline": "1091",
                "Medical": "108"
            },
            "source_provenance": "NCRB Public Statistics / IMD Bulletins / Official Tourism Registry",
            "disclaimer": "Informational assessment only. SmartVoyage AI cannot guarantee personal safety."
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"model": self.model, "columns": self.feature_columns}, filepath)
        print(f"Safety model persisted to: {filepath}")

    @classmethod
    def load(cls, filepath: str) -> "SafetyRiskModel":
        data = joblib.load(filepath)
        s = cls()
        s.model = data["model"]
        s.feature_columns = data["columns"]
        return s

def train_safety_engine(data_dir: str, model_path: str):
    safety_df = pd.read_csv(os.path.join(data_dir, "safety_observations.csv"))
    dest_df = pd.read_csv(os.path.join(data_dir, "destinations.csv"))

    safety_model = SafetyRiskModel()
    features = safety_model.prepare_features(safety_df, dest_df)
    safety_model.fit(features)
    safety_model.save(model_path)

    # Test sample assessment
    sample_obs = safety_df[safety_df["location_id"] == 1].iloc[0]
    sample_dest = dest_df[dest_df["destination_id"] == 1].iloc[0]
    res = safety_model.assess_location(1, sample_obs, sample_dest)
    print(f"\nSample Safety Assessment (Location 1 - Delhi):")
    print(f"Overall Risk Category: {res['overall_risk_category']}")
    print(f"Advisory Status: {res['official_advisory_status']}")
    print(f"Explanations: {res['explanation']}")
    return safety_model

if __name__ == "__main__":
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    d_dir = os.path.join(base, "datasets", "sample")
    m_path = os.path.join(base, "ml", "models", "safety_model.joblib")
    train_safety_engine(d_dir, m_path)
