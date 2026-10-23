from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    destinations,
    attractions,
    restaurants,
    accommodations,
    trips,
    itineraries,
    safety,
    budget,
    recommendations,
    system
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(destinations.router, prefix="/destinations", tags=["Destinations"])
api_router.include_router(attractions.router, prefix="/attractions", tags=["Attractions"])
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["Restaurants"])
api_router.include_router(accommodations.router, prefix="/accommodations", tags=["Accommodations"])
api_router.include_router(trips.router, prefix="/trips", tags=["Trips"])
api_router.include_router(itineraries.router, prefix="/itineraries", tags=["Itineraries"])
api_router.include_router(safety.router, prefix="/safety", tags=["Safety Assessment"])
api_router.include_router(budget.router, prefix="/budget", tags=["Budget Estimation"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(system.router, tags=["System"])
