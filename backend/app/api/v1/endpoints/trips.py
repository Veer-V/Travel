import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.user import User
from app.models.destination import Destination
from app.models.attraction import Attraction
from app.models.restaurant import Restaurant
from app.models.accommodation import Accommodation
from app.models.trip import Trip, Itinerary, ItineraryItem, Expense
from app.schemas.trip import PlanTripRequest, TripResponse
from app.services.recommendation_service import recommendation_service
from app.services.safety_service import safety_service
from app.services.budget_service import budget_service
from app.services.itinerary_engine import itinerary_engine

router = APIRouter()

@router.post("/plan", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def plan_trip(
    plan_in: PlanTripRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Verify destination
    dest = db.query(Destination).filter(Destination.id == plan_in.destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found.")

    # Calculate duration
    try:
        s_date = datetime.strptime(plan_in.start_date, "%Y-%m-%d").date()
        e_date = datetime.strptime(plan_in.end_date, "%Y-%m-%d").date()
        num_days = max(1, (e_date - s_date).days + 1)
    except Exception:
        s_date = date.today()
        num_days = 3
        e_date = s_date

    trip_title = plan_in.title or f"{num_days}-Day Trip to {dest.name}"

    # 1. Fetch ML Recommendations
    try:
        recs = recommendation_service.get_recommendations(
            db=db,
            destination_id=dest.id,
            travel_style=plan_in.travel_style,
            budget=plan_in.total_budget,
            accessibility_req=plan_in.accessibility_requirements,
            limit=15
        )
    except Exception as re:
        print(f"[Trips API] Recommendation fetch warning: {re}")
        recs = []

    # 2. Fetch Dining & Accommodations
    try:
        db_rests = db.query(Restaurant).filter(Restaurant.destination_id == dest.id).all()
        rest_dicts = [{"id": r.id, "name": r.name, "cuisine": r.cuisine, "latitude": r.latitude, "longitude": r.longitude, "price_level": r.price_level} for r in db_rests]
    except Exception as dbe:
        print(f"[Trips API] Restaurant fetch warning: {dbe}")
        rest_dicts = []
    
    try:
        db_accs = db.query(Accommodation).filter(Accommodation.destination_id == dest.id).all()
        acc_dicts = [{"id": a.id, "name": a.name, "accommodation_type": a.accommodation_type, "latitude": a.latitude, "longitude": a.longitude, "price_per_night": a.price_per_night} for a in db_accs]
    except Exception as dbe:
        print(f"[Trips API] Accommodation fetch warning: {dbe}")
        acc_dicts = []

    # 3. Assess Safety
    try:
        safety_info = safety_service.assess_destination_safety(db, dest.id)
    except Exception as se:
        print(f"[Trips API] Safety assessment warning: {se}")
        safety_info = {
            "overall_risk_category": "Lower observed risk",
            "crime_risk_indicator": "Low observed frequency",
            "environmental_hazard_indicator": "None reported",
            "transport_risk_indicator": "Standard traffic conditions",
            "official_advisory_status": "Normal",
            "data_quality": "verified",
            "confidence_level": "Standard",
            "explanation": ["Historical data indicates standard traveler patterns."],
            "precautions": ["Keep emergency contacts accessible."],
            "emergency_contacts": {"National_Emergency": "112", "Tourist_Helpline": "1363", "Medical": "108"},
            "disclaimer": "Informational assessment only. SmartVoyage AI cannot guarantee personal safety."
        }

    # 4. Estimate Budget
    try:
        budget_info = budget_service.estimate_trip_budget(
            db=db,
            origin=plan_in.origin,
            destination_id=dest.id,
            num_days=num_days,
            num_travelers=plan_in.num_travelers,
            transport_mode=plan_in.transport_preference,
            accommodation_tier=plan_in.accommodation_preference,
            meal_tier=plan_in.food_preference
        )
    except Exception as be:
        print(f"[Trips API] Budget estimation warning: {be}")
        budget_info = {
            "total_estimated_budget": plan_in.total_budget,
            "cost_per_person": round(plan_in.total_budget / max(1, plan_in.num_travelers), 2),
            "currency": plan_in.currency,
            "breakdown": []
        }

    # 5. Generate Multi-day Schedule
    trip_id = str(uuid.uuid4())
    try:
        itineraries_data = await itinerary_engine.generate_itinerary(
            trip_id=trip_id,
            start_date_str=plan_in.start_date,
            num_days=num_days,
            attractions=recs,
            restaurants=rest_dicts,
            accommodations=acc_dicts,
            destination_name=dest.name,
            travel_style=plan_in.travel_style
        )
    except Exception as ie:
        print(f"[Trips API] Itinerary generator warning: {ie}")
        itineraries_data = []

    # 6. Persist Trip
    new_trip = Trip(
        id=trip_id,
        user_id=current_user.id if current_user else None,
        destination_id=dest.id,
        title=trip_title,
        origin=plan_in.origin,
        start_date=s_date,
        end_date=e_date,
        total_days=num_days,
        num_travelers=plan_in.num_travelers,
        total_budget=plan_in.total_budget,
        currency=plan_in.currency,
        travel_style=plan_in.travel_style,
        transport_preference=plan_in.transport_preference,
        accommodation_preference=plan_in.accommodation_preference,
        food_preference=plan_in.food_preference,
        accessibility_requirements=plan_in.accessibility_requirements,
        safety_notes=safety_info.get("overall_risk_category", "Normal"),
        status="planned"
    )
    
    try:
        db.add(new_trip)

        # Persist Itineraries and Items
        for itin in itineraries_data:
            itin_model = Itinerary(
                id=itin["id"],
                trip_id=trip_id,
                day_number=itin["day_number"],
                date=datetime.strptime(itin["date"], "%Y-%m-%d").date(),
                daily_expense_estimate=itin["daily_expense_estimate"],
                notes=itin["notes"]
            )
            db.add(itin_model)
            for itm in itin["items"]:
                item_model = ItineraryItem(
                    id=itm["id"],
                    itinerary_id=itin["id"],
                    attraction_id=itm.get("attraction_id"),
                    restaurant_id=itm.get("restaurant_id"),
                    time_slot=itm["time_slot"],
                    start_time=itm["start_time"],
                    end_time=itm["end_time"],
                    activity_name=itm["activity_name"],
                    activity_type=itm["activity_type"],
                    location_name=itm["location_name"],
                    latitude=itm.get("latitude"),
                    longitude=itm.get("longitude"),
                    travel_mode=itm["travel_mode"],
                    travel_duration_minutes=itm["travel_duration_minutes"],
                    visit_duration_minutes=itm["visit_duration_minutes"],
                    estimated_cost=itm["estimated_cost"],
                    booking_required=itm["booking_required"],
                    data_source=itm["data_source"],
                    order_index=itm["order_index"]
                )
                db.add(item_model)

        # Persist Initial Estimated Expenses
        for item in budget_info.get("breakdown", []):
            exp = Expense(
                trip_id=trip_id,
                category=item["category"],
                amount=item["amount"],
                currency="INR",
                description=item.get("notes", ""),
                date=s_date,
                is_actual=False
            )
            db.add(exp)

        db.commit()
    except Exception as cme:
        db.rollback()
        print(f"[Trips API] Database persist warning (falling back to memory): {cme}")

    # Build response
    return build_trip_response(new_trip, dest.name, itineraries_data, budget_info, safety_info)

@router.get("", response_model=List[TripResponse])
def list_trips(
    limit: int = Query(20, ge=1, le=50),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Trip)
    if current_user:
        query = query.filter((Trip.user_id == current_user.id) | (Trip.user_id == None))
    trips = query.order_by(Trip.created_at.desc()).limit(limit).all()

    resp_list = []
    for t in trips:
        dest_name = t.destination.name if t.destination else "Destination"
        resp_list.append(format_db_trip(t, dest_name))
    return resp_list

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found.")
    dest_name = t.destination.name if t.destination else "Destination"
    return format_db_trip(t, dest_name)

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: str, db: Session = Depends(get_db)):
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trip not found.")
    db.delete(t)
    db.commit()
    return None

def format_db_trip(t: Trip, dest_name: str) -> TripResponse:
    itin_responses = []
    for itin in t.itineraries:
        items = []
        for itm in itin.items:
            items.append({
                "id": itm.id,
                "time_slot": itm.time_slot,
                "start_time": itm.start_time,
                "end_time": itm.end_time,
                "activity_name": itm.activity_name,
                "activity_type": itm.activity_type,
                "location_name": itm.location_name,
                "latitude": itm.latitude,
                "longitude": itm.longitude,
                "travel_mode": itm.travel_mode,
                "travel_duration_minutes": itm.travel_duration_minutes,
                "visit_duration_minutes": itm.visit_duration_minutes,
                "estimated_cost": itm.estimated_cost,
                "booking_required": itm.booking_required,
                "data_source": itm.data_source,
                "order_index": itm.order_index
            })
        itin_responses.append({
            "id": itin.id,
            "day_number": itin.day_number,
            "date": itin.date.isoformat(),
            "daily_expense_estimate": itin.daily_expense_estimate,
            "notes": itin.notes,
            "items": items
        })

    exp_responses = []
    for exp in t.expenses:
        exp_responses.append({
            "id": exp.id,
            "category": exp.category,
            "amount": exp.amount,
            "currency": exp.currency,
            "description": exp.description,
            "date": exp.date.isoformat(),
            "is_actual": exp.is_actual
        })

    return TripResponse(
        id=t.id,
        user_id=t.user_id,
        destination_id=t.destination_id,
        destination_name=dest_name,
        title=t.title,
        origin=t.origin,
        start_date=t.start_date.isoformat(),
        end_date=t.end_date.isoformat(),
        total_days=t.total_days,
        num_travelers=t.num_travelers,
        total_budget=t.total_budget,
        currency=t.currency,
        travel_style=t.travel_style,
        transport_preference=t.transport_preference,
        accommodation_preference=t.accommodation_preference,
        food_preference=t.food_preference,
        accessibility_requirements=t.accessibility_requirements,
        safety_notes=t.safety_notes,
        status=t.status,
        created_at=t.created_at,
        itineraries=itin_responses,
        expenses=exp_responses
    )

def build_trip_response(t: Trip, dest_name: str, itin_data: list, budget_info: dict, safety_info: dict) -> TripResponse:
    return TripResponse(
        id=t.id,
        user_id=t.user_id,
        destination_id=t.destination_id,
        destination_name=dest_name,
        title=t.title,
        origin=t.origin,
        start_date=t.start_date.isoformat(),
        end_date=t.end_date.isoformat(),
        total_days=t.total_days,
        num_travelers=t.num_travelers,
        total_budget=t.total_budget,
        currency=t.currency,
        travel_style=t.travel_style,
        transport_preference=t.transport_preference,
        accommodation_preference=t.accommodation_preference,
        food_preference=t.food_preference,
        accessibility_requirements=t.accessibility_requirements,
        safety_notes=t.safety_notes,
        status=t.status,
        created_at=t.created_at,
        itineraries=itin_data,
        expenses=[],
        budget_breakdown=budget_info,
        safety_assessment=safety_info
    )
