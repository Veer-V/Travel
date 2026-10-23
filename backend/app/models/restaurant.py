from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    cuisine = Column(String(100), nullable=False) # North Indian, South Indian, Mughlai, Continental, Seafood, Local Rajasthani, etc.
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    price_level = Column(String(20), default="moderate") # budget ($), moderate ($$), fine_dining ($$$)
    dietary_options = Column(String(100), default="Vegetarian, Non-Vegetarian")
    rating = Column(Float, default=4.2)
    opening_hours = Column(String(100), default="11:00 - 23:00")
    source = Column(String(100), default="Curated Directory / OpenStreetMap")
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    destination = relationship("Destination", back_populates="restaurants")
