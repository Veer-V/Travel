import math
import httpx
from typing import Tuple, Dict, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class RoutingProvider:
    def __init__(self, base_url: str = "https://router.project-osrm.org"):
        self.base_url = base_url

    async def get_route(
        self,
        start_coord: Tuple[float, float],
        end_coord: Tuple[float, float]
    ) -> Dict[str, Any]:
        """
        Coordinates: (latitude, longitude)
        Returns: distance_km, duration_minutes, is_approximate
        """
        lat1, lon1 = start_coord
        lat2, lon2 = end_coord

        # Attempt live OSRM routing
        # OSRM expects: {lon},{lat};{lon},{lat}
        url = f"{self.base_url}/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("code") == "Ok" and data.get("routes"):
                        route = data["routes"][0]
                        dist_km = round(route["distance"] / 1000.0, 2)
                        dur_min = max(5, int(route["duration"] / 60.0))
                        return {
                            "distance_km": dist_km,
                            "duration_minutes": dur_min,
                            "provider": "OSRM Live Routing",
                            "is_approximate": False
                        }
        except Exception:
            # Fallback seamlessly to geodesic calculation with urban congestion buffer
            pass

        # Fallback heuristic
        dist_km = haversine_distance(lat1, lon1, lat2, lon2)
        # In city traffic, average speed is ~25 km/h -> 2.4 min/km + 5 min base
        dur_min = max(10, int(dist_km * 2.5 + 5))
        return {
            "distance_km": dist_km,
            "duration_minutes": dur_min,
            "provider": "Geodesic Haversine Fallback",
            "is_approximate": True
        }

routing_provider = RoutingProvider()
