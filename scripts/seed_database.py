import os
import sys
import pandas as pd
from datetime import datetime, date

# Ensure backend is on sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))
sys.path.insert(0, BASE_DIR)

from app.database.session import SessionLocal, engine, Base
from app.models.destination import Destination
from app.models.attraction import Attraction
from app.models.restaurant import Restaurant
from app.models.accommodation import Accommodation
from app.models.transport import TransportOption
from app.models.safety import SafetyObservation, OfficialAdvisory
from app.models.user import User, UserPreference
from app.core.security import get_password_hash

def seed_database(dataset_dir: str = None):
    if dataset_dir is None:
        dataset_dir = os.path.join(BASE_DIR, "datasets", "sample")

    print(f"Creating database tables if not exist on {engine.url}...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        dest_count = db.query(Destination).count()
        if dest_count > 0:
            print(f"Database already contains {dest_count} destinations. Skipping re-seed.")
            return

        print(f"Seeding database from CSVs in: {dataset_dir}")

        # 1. Seed Destinations
        dest_file = os.path.join(dataset_dir, "destinations.csv")
        if os.path.exists(dest_file):
            df = pd.read_csv(dest_file)
            for _, row in df.iterrows():
                dest = Destination(
                    id=int(row["destination_id"]),
                    name=str(row["destination_name"]),
                    state_or_region=str(row["state_or_region"]),
                    country=str(row.get("country", "India")),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    destination_type=str(row["destination_type"]),
                    description=str(row.get("description", "")),
                    best_time_to_visit=str(row.get("best_time_to_visit", "")),
                    climate=str(row.get("climate", "")),
                    source=str(row.get("source", "Verified Directory"))
                )
                db.add(dest)
            db.commit()
            print(f"Seeded {len(df)} destinations.")

        # 2. Seed Attractions
        attr_file = os.path.join(dataset_dir, "attractions.csv")
        if os.path.exists(attr_file):
            df = pd.read_csv(attr_file)
            for _, row in df.iterrows():
                attr = Attraction(
                    id=int(row["attraction_id"]),
                    destination_id=int(row["destination_id"]),
                    name=str(row["name"]),
                    category=str(row["category"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    estimated_visit_duration=int(row.get("estimated_visit_duration", 120)),
                    admission_price=float(row.get("admission_price", 0.0)),
                    opening_hours=str(row.get("opening_hours", "09:00 - 18:00")),
                    rating=float(row.get("rating", 4.0)),
                    accessibility_features=str(row.get("accessibility_features", "Standard access")),
                    description=str(row.get("description", "")),
                    tags=str(row.get("tags", "")),
                    source=str(row.get("source", "OpenStreetMap / Tourism Dept"))
                )
                db.add(attr)
            db.commit()
            print(f"Seeded {len(df)} attractions.")

        # 3. Seed Restaurants
        rest_file = os.path.join(dataset_dir, "restaurants.csv")
        if os.path.exists(rest_file):
            df = pd.read_csv(rest_file)
            for _, row in df.iterrows():
                rest = Restaurant(
                    id=int(row["restaurant_id"]),
                    destination_id=int(row["destination_id"]),
                    name=str(row["name"]),
                    cuisine=str(row["cuisine"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    price_level=str(row.get("price_level", "moderate")),
                    dietary_options=str(row.get("dietary_options", "Vegetarian, Non-Vegetarian")),
                    rating=float(row.get("rating", 4.2)),
                    opening_hours=str(row.get("opening_hours", "11:00 - 23:00")),
                    source=str(row.get("source", "Curated Local Directory"))
                )
                db.add(rest)
            db.commit()
            print(f"Seeded {len(df)} restaurants.")

        # 4. Seed Accommodations
        acc_file = os.path.join(dataset_dir, "accommodations.csv")
        if os.path.exists(acc_file):
            df = pd.read_csv(acc_file)
            for _, row in df.iterrows():
                acc = Accommodation(
                    id=int(row["accommodation_id"]),
                    destination_id=int(row["destination_id"]),
                    name=str(row["name"]),
                    accommodation_type=str(row["accommodation_type"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    price_per_night=float(row["price_per_night"]),
                    amenities=str(row.get("amenities", "WiFi, AC")),
                    rating=float(row.get("rating", 4.0)),
                    booking_url=str(row.get("booking_url", "")),
                    source=str(row.get("source", "Verified Directory"))
                )
                db.add(acc)
            db.commit()
            print(f"Seeded {len(df)} accommodations.")

        # 5. Seed Transport Options
        trans_file = os.path.join(dataset_dir, "transport_options.csv")
        if os.path.exists(trans_file):
            df = pd.read_csv(trans_file)
            for _, row in df.iterrows():
                trans = TransportOption(
                    id=int(row["transport_id"]),
                    origin=str(row["origin"]),
                    destination=str(row["destination"]),
                    transport_mode=str(row["transport_mode"]),
                    estimated_duration=int(row["estimated_duration"]),
                    estimated_cost=float(row["estimated_cost"]),
                    distance=float(row["distance"]),
                    source=str(row.get("source", "Transit Benchmark"))
                )
                db.add(trans)
            db.commit()
            print(f"Seeded {len(df)} transport options.")

        # 6. Seed Safety Observations
        safety_file = os.path.join(dataset_dir, "safety_observations.csv")
        if os.path.exists(safety_file):
            df = pd.read_csv(safety_file)
            for _, row in df.iterrows():
                obs = SafetyObservation(
                    id=int(row["observation_id"]),
                    destination_id=int(row["location_id"]),
                    observation_date=date.today(),
                    geographic_area=str(row["geographic_area"]),
                    incident_category=str(row["incident_category"]),
                    incident_count=int(row.get("incident_count", 0)),
                    exposure_denominator=int(row["population_or_exposure_denominator_when_available"]) if pd.notna(row.get("population_or_exposure_denominator_when_available")) else None,
                    weather_hazard=str(row.get("weather_hazard", "none")),
                    infrastructure_indicators=str(row.get("infrastructure_indicators", "standard")),
                    official_advisory_level=str(row.get("official_advisory_level", "normal")),
                    data_source=str(row.get("data_source", "Official Registry")),
                    data_quality_flag=str(row.get("data_quality_flag", "verified"))
                )
                db.add(obs)
            db.commit()
            print(f"Seeded {len(df)} safety observations.")

        # 7. Seed Official Advisories Sample
        advisories = [
            (3, "normal", "Tourism in Jaipur is fully open. Normal personal safety precautions recommended.", "Ministry of Tourism"),
            (10, "exercise_caution", "Monsoon season: exercise caution while driving on high mountain passes like Rohtang Pass due to occasional mudslides.", "Himachal State Disaster Management Authority"),
            (18, "normal", "Goa beaches are open for swimming during season. Follow lifeguard flags along the shore.", "Goa Tourism Development Corp")
        ]
        for dest_id, level, txt, org in advisories:
            adv = OfficialAdvisory(
                destination_id=dest_id,
                advisory_level=level,
                advisory_text=txt,
                issued_date=date.today(),
                source_organization=org,
                emergency_contacts="Police: 112 | Medical: 108 | Tourist Helpline: 1363"
            )
            db.add(adv)
        db.commit()

        # 8. Create Demo User
        demo_user = User(
            email="demo@smartvoyage.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Explorer User",
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        pref = UserPreference(
            user_id=demo_user.id,
            travel_style="cultural",
            budget_category="moderate",
            preferred_activities="historical, heritage, architecture, food",
            preferred_accommodation="hotel",
            transport_preference="train"
        )
        db.add(pref)
        db.commit()
        print(f"Seeded demo user: demo@smartvoyage.ai (password: password123)")

        print(">>> Database seeding completed successfully! <<<")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
