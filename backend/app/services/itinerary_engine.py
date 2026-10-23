import uuid
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from app.integrations.osrm import routing_provider, haversine_distance

class ItineraryEngine:
    async def generate_itinerary(
        self,
        trip_id: str,
        start_date_str: str,
        num_days: int,
        attractions: List[Dict[str, Any]],
        restaurants: List[Dict[str, Any]],
        accommodations: List[Dict[str, Any]],
        destination_name: str,
        travel_style: str = "cultural"
    ) -> List[Dict[str, Any]]:
        try:
            start_dt = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except Exception:
            start_dt = date.today()

        itineraries = []
        attraction_idx = 0
        rest_idx = 0

        hotel_lat, hotel_lon = None, None
        if accommodations:
            hotel_lat = accommodations[0].get("latitude")
            hotel_lon = accommodations[0].get("longitude")

        for day_num in range(1, num_days + 1):
            day_date = start_dt + timedelta(days=day_num - 1)
            itinerary_id = str(uuid.uuid4())
            day_items = []
            order_idx = 0
            daily_cost = 0.0

            # 1. Morning Activity (09:00 - 11:30)
            if attraction_idx < len(attractions):
                attr1 = attractions[attraction_idx]
                attraction_idx += 1
            else:
                attr1 = attractions[0] if attractions else None

            if attr1:
                cost = float(attr1.get("admission_price", 0.0))
                daily_cost += cost
                day_items.append({
                    "id": str(uuid.uuid4()),
                    "itinerary_id": itinerary_id,
                    "attraction_id": attr1.get("id") or attr1.get("attraction_id"),
                    "restaurant_id": None,
                    "time_slot": "morning",
                    "start_time": "09:00",
                    "end_time": "11:30",
                    "activity_name": f"Visit {attr1['name']}",
                    "activity_type": "attraction",
                    "location_name": attr1["name"],
                    "latitude": attr1.get("latitude"),
                    "longitude": attr1.get("longitude"),
                    "travel_mode": "cab",
                    "travel_duration_minutes": 20,
                    "visit_duration_minutes": attr1.get("estimated_visit_duration", 120),
                    "estimated_cost": cost,
                    "booking_required": cost > 100.0,
                    "data_source": "SmartVoyage AI Engine",
                    "order_index": order_idx
                })
                order_idx += 1

            # 2. Lunch Break (12:30 - 14:00)
            cur_rest = restaurants[rest_idx % len(restaurants)] if restaurants else None
            rest_idx += 1
            if cur_rest:
                lunch_cost = 450.0
                daily_cost += lunch_cost
                day_items.append({
                    "id": str(uuid.uuid4()),
                    "itinerary_id": itinerary_id,
                    "attraction_id": None,
                    "restaurant_id": cur_rest.get("id"),
                    "time_slot": "afternoon",
                    "start_time": "12:30",
                    "end_time": "14:00",
                    "activity_name": f"Regional Lunch at {cur_rest['name']}",
                    "activity_type": "restaurant",
                    "location_name": cur_rest["name"],
                    "latitude": cur_rest.get("latitude"),
                    "longitude": cur_rest.get("longitude"),
                    "travel_mode": "walking" if day_items and day_items[-1].get("latitude") else "cab",
                    "travel_duration_minutes": 15,
                    "visit_duration_minutes": 90,
                    "estimated_cost": lunch_cost,
                    "booking_required": False,
                    "data_source": "Curated Local Guide",
                    "order_index": order_idx
                })
                order_idx += 1

            # 3. Afternoon Activity (14:30 - 17:00)
            if attraction_idx < len(attractions):
                attr2 = attractions[attraction_idx]
                attraction_idx += 1
            else:
                attr2 = attractions[(day_num) % len(attractions)] if attractions else None

            if attr2:
                cost = float(attr2.get("admission_price", 0.0))
                daily_cost += cost
                day_items.append({
                    "id": str(uuid.uuid4()),
                    "itinerary_id": itinerary_id,
                    "attraction_id": attr2.get("id") or attr2.get("attraction_id"),
                    "restaurant_id": None,
                    "time_slot": "afternoon",
                    "start_time": "14:30",
                    "end_time": "17:00",
                    "activity_name": f"Explore {attr2['name']}",
                    "activity_type": "attraction",
                    "location_name": attr2["name"],
                    "latitude": attr2.get("latitude"),
                    "longitude": attr2.get("longitude"),
                    "travel_mode": "cab",
                    "travel_duration_minutes": 25,
                    "visit_duration_minutes": attr2.get("estimated_visit_duration", 120),
                    "estimated_cost": cost,
                    "booking_required": cost > 100.0,
                    "data_source": "SmartVoyage AI Engine",
                    "order_index": order_idx
                })
                order_idx += 1

            # 4. Evening Sunset / Leisure Activity (17:30 - 19:30)
            eve_attr = attractions[(attraction_idx + 1) % len(attractions)] if attractions else None
            eve_name = f"{destination_name} Heritage Sunset & Market Stroll"
            eve_lat = attr2.get("latitude") if attr2 else None
            eve_lon = attr2.get("longitude") if attr2 else None
            if eve_attr and eve_attr.get("category") in ["viewpoint", "beach", "cultural", "park"]:
                eve_name = f"Sunset view at {eve_attr['name']}"
                eve_lat = eve_attr.get("latitude")
                eve_lon = eve_attr.get("longitude")

            day_items.append({
                "id": str(uuid.uuid4()),
                "itinerary_id": itinerary_id,
                "attraction_id": None,
                "restaurant_id": None,
                "time_slot": "evening",
                "start_time": "17:30",
                "end_time": "19:30",
                "activity_name": eve_name,
                "activity_type": "attraction",
                "location_name": f"{destination_name} Evening Promenade",
                "latitude": eve_lat,
                "longitude": eve_lon,
                "travel_mode": "walking",
                "travel_duration_minutes": 15,
                "visit_duration_minutes": 120,
                "estimated_cost": 50.0,
                "booking_required": False,
                "data_source": "Local Experience Curator",
                "order_index": order_idx
            })
            order_idx += 1

            # 5. Dinner Dining (20:00 - 21:30)
            dinner_rest = restaurants[(rest_idx + 1) % len(restaurants)] if restaurants else None
            if dinner_rest:
                dinner_cost = 600.0
                daily_cost += dinner_cost
                day_items.append({
                    "id": str(uuid.uuid4()),
                    "itinerary_id": itinerary_id,
                    "attraction_id": None,
                    "restaurant_id": dinner_rest.get("id"),
                    "time_slot": "night",
                    "start_time": "20:00",
                    "end_time": "21:30",
                    "activity_name": f"Dinner at {dinner_rest['name']}",
                    "activity_type": "restaurant",
                    "location_name": dinner_rest["name"],
                    "latitude": dinner_rest.get("latitude"),
                    "longitude": dinner_rest.get("longitude"),
                    "travel_mode": "cab",
                    "travel_duration_minutes": 20,
                    "visit_duration_minutes": 90,
                    "estimated_cost": dinner_cost,
                    "booking_required": True if dinner_rest.get("price_level") == "fine_dining" else False,
                    "data_source": "Curated Local Guide",
                    "order_index": order_idx
                })

            itineraries.append({
                "id": itinerary_id,
                "trip_id": trip_id,
                "day_number": day_num,
                "date": day_date.isoformat(),
                "daily_expense_estimate": round(daily_cost, 2),
                "notes": f"Day {day_num}: Curated for {travel_style.title()} exploration in {destination_name}.",
                "items": day_items
            })

        return itineraries

itinerary_engine = ItineraryEngine()
