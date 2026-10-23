import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Integer, Float, Text, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True) # nullable for guest mode
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="RESTRICT"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    origin = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Integer, nullable=False, default=3)
    num_travelers = Column(Integer, nullable=False, default=1)
    total_budget = Column(Float, nullable=False, default=15000.0) # INR
    currency = Column(String(10), default="INR")
    travel_style = Column(String(50), default="cultural") # adventure, family, romantic, cultural, historical, nature, relaxation, budget
    transport_preference = Column(String(50), default="train") # flight, train, bus, car
    accommodation_preference = Column(String(50), default="hotel") # hotel, hostel, resort, homestay
    food_preference = Column(String(50), default="standard")
    accessibility_requirements = Column(String(255), default="none")
    safety_notes = Column(Text, nullable=True)
    status = Column(String(30), default="planned") # planned, active, completed, archived
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="trips")
    destination = relationship("Destination", back_populates="trips")
    itineraries = relationship("Itinerary", back_populates="trip", cascade="all, delete-orphan", order_by="Itinerary.day_number")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")

class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    daily_expense_estimate = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    trip = relationship("Trip", back_populates="itineraries")
    items = relationship("ItineraryItem", back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryItem.order_index")

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    itinerary_id = Column(String(36), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False, index=True)
    attraction_id = Column(Integer, ForeignKey("attractions.id", ondelete="SET NULL"), nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="SET NULL"), nullable=True)
    time_slot = Column(String(20), default="morning") # morning, afternoon, evening, night
    start_time = Column(String(10), default="09:00")
    end_time = Column(String(10), default="11:30")
    activity_name = Column(String(200), nullable=False)
    activity_type = Column(String(50), default="attraction") # attraction, restaurant, transport, rest, check_in
    location_name = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    travel_mode = Column(String(50), default="cab") # walking, cab, transit, metro
    travel_duration_minutes = Column(Integer, default=15)
    visit_duration_minutes = Column(Integer, default=90)
    estimated_cost = Column(Float, default=0.0)
    booking_required = Column(Boolean, default=False)
    data_source = Column(String(100), default="AI Itinerary Engine")
    order_index = Column(Integer, default=0)

    itinerary = relationship("Itinerary", back_populates="items")
    attraction = relationship("Attraction")
    restaurant = relationship("Restaurant")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False) # transport, accommodation, food, activities, local_transit, emergency, miscellaneous
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    description = Column(String(255), nullable=True)
    date = Column(Date, default=date.today)
    is_actual = Column(Boolean, default=False) # False = estimated, True = actual spent by user
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="expenses")

class SavedPlace(Base):
    __tablename__ = "saved_places"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    place_type = Column(String(50), nullable=False) # destination, attraction, restaurant, accommodation
    place_id = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="saved_places")
