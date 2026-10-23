from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base

class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False, index=True)
    state_or_region = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False, default="India")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    destination_type = Column(String(50), nullable=False) # heritage, beach, hill_station, wildlife, spiritual, urban
    description = Column(Text, nullable=True)
    best_time_to_visit = Column(String(100), nullable=True) # e.g. "October to March"
    climate = Column(String(50), nullable=True) # Tropical, Temperate, Alpine, Arid
    source = Column(String(100), default="Official Tourism / OpenStreetMap")
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    attractions = relationship("Attraction", back_populates="destination", cascade="all, delete-orphan")
    accommodations = relationship("Accommodation", back_populates="destination", cascade="all, delete-orphan")
    restaurants = relationship("Restaurant", back_populates="destination", cascade="all, delete-orphan")
    safety_observations = relationship("SafetyObservation", back_populates="destination", cascade="all, delete-orphan")
    advisories = relationship("OfficialAdvisory", back_populates="destination", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="destination")
