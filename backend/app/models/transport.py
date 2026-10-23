from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database.session import Base

class TransportOption(Base):
    __tablename__ = "transport_options"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String(100), nullable=False, index=True)
    destination = Column(String(100), nullable=False, index=True)
    transport_mode = Column(String(50), nullable=False) # flight, train, bus, car
    estimated_duration = Column(Integer, nullable=False) # minutes
    estimated_cost = Column(Float, nullable=False) # INR
    distance = Column(Float, nullable=False) # km
    source = Column(String(100), default="Transit Estimates / OpenStreetMap")
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))
