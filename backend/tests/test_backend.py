import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend on sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))
sys.path.insert(0, BASE_DIR)

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "SmartVoyage" in data["service"]

def test_models_status():
    response = client.get("/api/v1/models/status")
    assert response.status_code == 200
    data = response.json()
    assert data["recommender_loaded"] is True
    assert data["safety_model_loaded"] is True
    assert data["budget_model_loaded"] is True

def test_data_status():
    response = client.get("/api/v1/data/status")
    assert response.status_code == 200
    data = response.json()
    assert data["destinations_in_database"] >= 50
    assert data["attractions_in_database"] >= 100

def test_auth_workflow():
    # Unique email for test
    import uuid
    test_email = f"test_{uuid.uuid4().hex[:6]}@smartvoyage.ai"
    
    # 1. Register
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "securepassword123",
        "full_name": "Test Traveler"
    })
    assert reg_resp.status_code == 201
    token_data = reg_resp.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 2. Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "securepassword123"
    })
    assert login_resp.status_code == 200

    # 3. Get Profile
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == test_email

def test_destinations_api():
    # List
    resp = client.get("/api/v1/destinations?limit=10")
    assert resp.status_code == 200
    destinations = resp.json()
    assert len(destinations) > 0

    # Search
    s_resp = client.get("/api/v1/destinations/search?q=Jaipur")
    assert s_resp.status_code == 200
    s_data = s_resp.json()
    assert any("Jaipur" in d["name"] for d in s_data)

def test_attractions_api():
    resp = client.get("/api/v1/attractions?destination_id=3")
    assert resp.status_code == 200
    attrs = resp.json()
    assert len(attrs) > 0
    assert all(a["destination_id"] == 3 for a in attrs)

def test_recommendation_api():
    resp = client.post("/api/v1/recommendations", json={
        "destination_id": 3,
        "travel_style": "heritage",
        "interests": ["fort", "palace"],
        "budget": 20000,
        "accessibility_requirements": "none",
        "limit": 5
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] > 0
    assert len(data["recommendations"]) > 0
    top = data["recommendations"][0]
    assert "name" in top
    assert "relevance_score" in top
    assert "explanation" in top

def test_safety_assessment_api():
    resp = client.get("/api/v1/safety/location/3")
    assert resp.status_code == 200
    safety = resp.json()
    assert "overall_risk_category" in safety
    assert "emergency_contacts" in safety
    assert "disclaimer" in safety

def test_budget_estimate_api():
    resp = client.post("/api/v1/budget/estimate", json={
        "origin": "Delhi",
        "destination_id": 3,
        "num_days": 4,
        "num_travelers": 2,
        "transport_mode": "train",
        "accommodation_tier": "hotel",
        "meal_tier": "moderate"
    })
    assert resp.status_code == 200
    budget = resp.json()
    assert budget["total_estimated_budget"] > 0
    assert budget["cost_per_person"] > 0
    assert len(budget["breakdown"]) >= 5

def test_end_to_end_trip_planning_workflow():
    # Plan a complete 3-day trip to Jaipur
    plan_payload = {
        "title": "Autumn Royal Heritage Tour",
        "origin": "Delhi",
        "destination_id": 3,
        "start_date": "2026-11-10",
        "end_date": "2026-11-12",
        "num_travelers": 2,
        "total_budget": 25000.0,
        "currency": "INR",
        "travel_style": "heritage",
        "transport_preference": "train",
        "accommodation_preference": "hotel",
        "food_preference": "moderate",
        "accessibility_requirements": "none"
    }

    plan_resp = client.post("/api/v1/trips/plan", json=plan_payload)
    assert plan_resp.status_code == 201
    trip = plan_resp.json()
    trip_id = trip["id"]
    assert trip["destination_name"] == "Jaipur"
    assert trip["total_days"] == 3
    assert len(trip["itineraries"]) == 3

    # Check itinerary items
    day1 = trip["itineraries"][0]
    assert len(day1["items"]) >= 3
    morning_item = day1["items"][0]
    assert morning_item["time_slot"] == "morning"
    assert morning_item["activity_type"] == "attraction"

    # Check safety & budget inclusion
    assert trip["budget_breakdown"] is not None
    assert trip["safety_assessment"] is not None

    # Retrieve trip by ID
    get_resp = client.get(f"/api/v1/trips/{trip_id}")
    assert get_resp.status_code == 200
    retrieved = get_resp.json()
    assert retrieved["id"] == trip_id
    assert retrieved["title"] == "Autumn Royal Heritage Tour"
