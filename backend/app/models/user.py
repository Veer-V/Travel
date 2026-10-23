import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    saved_places = relationship("SavedPlace", back_populates="user", cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    travel_style = Column(String(50), default="cultural") # adventure, family, romantic, cultural, historical, nature, relaxation, budget
    budget_category = Column(String(50), default="moderate") # budget, moderate, luxury
    preferred_activities = Column(Text, nullable=True) # comma-separated: sightseeing, trekking, food, beaches, temples
    preferred_accommodation = Column(String(50), default="hotel") # hotel, hostel, resort, homestay
    transport_preference = Column(String(50), default="train") # flight, train, bus, car
    dietary_options = Column(String(100), default="standard") # vegetarian, vegan, halal, standard
    accessibility_requirements = Column(String(255), default="none") # wheelchair, step_free, none
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="preferences")
