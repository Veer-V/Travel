from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Accommodation(Base):
    __tablename__ = "accommodations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    accommodation_type = Column(String(50), nullable=False) # hotel, hostel, resort, homestay, guesthouse
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    price_per_night = Column(Float, nullable=False) # INR
    amenities = Column(String(255), default="WiFi, AC, Breakfast")
    rating = Column(Float, default=4.0)
    booking_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    source = Column(String(100), default="Direct Listing / Verified Directory")
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    destination = relationship("Destination", back_populates="accommodations")
