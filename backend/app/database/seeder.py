import os
import sys
import pandas as pd
from datetime import datetime, date

from app.database.session import SessionLocal, engine, Base
from app.models.destination import Destination
from app.models.attraction import Attraction
from app.models.restaurant import Restaurant
from app.models.accommodation import Accommodation
from app.models.transport import TransportOption
from app.models.safety import SafetyObservation, OfficialAdvisory
from app.models.user import User, UserPreference
from app.core.security import get_password_hash
from app.core.config import settings

def seed_database(dataset_dir: str = None):
    if dataset_dir is None:
        dataset_dir = settings.DATASET_DIR

    print(f"[Seeder] Creating database tables if not exist on {engine.url}...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        dest_count = db.query(Destination).count()
        if dest_count > 0:
            print(f"[Seeder] Database already contains {dest_count} destinations. Skipping.")
            return

        print(f"[Seeder] Seeding database from CSVs in: {dataset_dir}")

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
                    best_time_to_visit=str(row.get("best_time_to_visit", "October to March")),
                    climate=str(row.get("climate", "Tropical")),
                    source=str(row.get("source", "OpenStreetMap / Ministry of Tourism"))
                )
                db.merge(dest)
            db.commit()
            print(f"[Seeder] Loaded {len(df)} destinations.")

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
                    estimated_visit_duration=int(row["estimated_visit_duration"]),
                    admission_price=float(row["admission_price"]),
                    opening_hours=str(row["opening_hours"]),
                    rating=float(row["rating"]),
                    accessibility_features=str(row.get("accessibility_features", "none")),
                    description=str(row.get("description", "")),
                    tags=str(row.get("tags", ""))
                )
                db.merge(attr)
            db.commit()
            print(f"[Seeder] Loaded {len(df)} attractions.")

        # 3. Seed Restaurants
        rest_file = os.path.join(dataset_dir, "restaurants.csv")
        if os.path.exists(rest_file):
            df = pd.read_csv(rest_file)
            for _, row in df.iterrows():
                rest = Restaurant(
                    id=int(row["restaurant_id"]),
                    destination_id=int(row["destination_id"]),
                    name=str(row["name"]),
                    cuisine_type=str(row["cuisine_type"]),
                    price_tier=str(row["price_tier"]),
                    average_cost_for_two=float(row["average_cost_for_two"]),
                    rating=float(row["rating"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    opening_hours=str(row["opening_hours"]),
                    dietary_options=str(row.get("dietary_options", "vegetarian"))
                )
                db.merge(rest)
            db.commit()
            print(f"[Seeder] Loaded {len(df)} restaurants.")

        # 4. Seed Accommodations
        acc_file = os.path.join(dataset_dir, "accommodations.csv")
        if os.path.exists(acc_file):
            df = pd.read_csv(acc_file)
            for _, row in df.iterrows():
                acc = Accommodation(
                    id=int(row["accommodation_id"]),
                    destination_id=int(row["destination_id"]),
                    name=str(row["name"]),
                    tier=str(row["tier"]),
                    price_per_night=float(row["price_per_night"]),
                    rating=float(row["rating"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    amenities=str(row.get("amenities", ""))
                )
                db.merge(acc)
            db.commit()
            print(f"[Seeder] Loaded {len(df)} accommodations.")

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
                    estimated_cost=float(row["estimated_cost"]),
                    duration_hours=float(row["duration_hours"]),
                    frequency=str(row.get("frequency", "daily"))
                )
                db.merge(trans)
            db.commit()
            print(f"[Seeder] Loaded {len(df)} transport options.")

        # 6. Seed Safety Observations
        safety_file = os.path.join(dataset_dir, "safety_observations.csv")
        if os.path.exists(safety_file):
            df = pd.read_csv(safety_file)
            for _, row in df.iterrows():
                try:
                    obs_date = datetime.strptime(str(row["observation_date"]), "%Y-%m-%d").date()
                except Exception:
                    obs_date = date.today()
                obs = SafetyObservation(
                    id=int(row["observation_id"]),
                    destination_id=int(row["location_id"]),
                    observation_date=obs_date,
                    incident_count=int(row.get("incident_count", 0)),
                    weather_hazard=str(row.get("weather_hazard", "none")),
                    infrastructure_score=float(row.get("infrastructure_score", 0.8)),
                    official_advisory_level=str(row.get("official_advisory_level", "normal")),
                    confidence_level=str(row.get("confidence_level", "verified")),
                    data_quality_flag=str(row.get("data_quality_flag", "verified"))
                )
                db.merge(obs)
            db.commit()
            print(f"[Seeder] Loaded {len(df)} safety observations.")

        # 7. Seed Demo User
        demo_email = "demo@smartvoyage.ai"
        existing_user = db.query(User).filter(User.email == demo_email).first()
        if not existing_user:
            demo_user = User(
                email=demo_email,
                hashed_password=get_password_hash("password123"),
                full_name="SmartVoyage Explorer",
                is_active=True,
                is_superuser=False
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            pref = UserPreference(
                user_id=demo_user.id,
                travel_style="cultural",
                interests=["heritage", "architecture", "food"],
                budget_tier="moderate",
                accessibility_requirements="none"
            )
            db.add(pref)
            db.commit()
            print(f"[Seeder] Demo user created: {demo_email} / password123")

    except Exception as e:
        db.rollback()
        print(f"[Seeder] Error during database seeding: {e}")
    finally:
        db.close()
