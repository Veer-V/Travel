from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True) # historical, nature, religious, adventure, cultural, viewpoint, museum, park, beach
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    estimated_visit_duration = Column(Integer, default=120) # in minutes
    admission_price = Column(Float, default=0.0) # INR
    opening_hours = Column(String(100), default="09:00 - 18:00")
    rating = Column(Float, default=4.0)
    accessibility_features = Column(String(255), default="Standard access") # Wheelchair accessible, ramps, etc.
    description = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True) # comma-separated tags for recommender TF-IDF
    image_url = Column(String(500), nullable=True)
    source = Column(String(100), default="OpenStreetMap / Tourism Dept")
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    destination = relationship("Destination", back_populates="attractions")
