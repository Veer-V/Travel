from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class SafetyObservation(Base):
    __tablename__ = "safety_observations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_date = Column(Date, default=date.today)
    geographic_area = Column(String(100), nullable=False)
    incident_category = Column(String(50), nullable=False) # petty_theft, scam, environmental, transport_hazard, general_safety
    incident_count = Column(Integer, default=0)
    exposure_denominator = Column(Integer, nullable=True) # population or visitor volume denominator
    weather_hazard = Column(String(50), default="none") # none, heatwave, heavy_monsoon, cyclone, landslide, fog
    infrastructure_indicators = Column(String(100), default="standard") # well_lit, tourist_police_available, medical_access
    official_advisory_level = Column(String(50), default="normal") # normal, exercise_caution, avoid_non_essential, avoid_all
    data_source = Column(String(100), default="Official Public Records / Met Dept")
    data_quality_flag = Column(String(50), default="verified") # verified, provisional, synthetic_benchmark, insufficient
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    destination = relationship("Destination", back_populates="safety_observations")

class OfficialAdvisory(Base):
    __tablename__ = "official_advisories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    advisory_level = Column(String(50), nullable=False) # normal, caution, warning, severe
    advisory_text = Column(Text, nullable=False)
    issued_date = Column(Date, default=date.today)
    source_organization = Column(String(150), default="Ministry of Tourism / Local Administration")
    source_url = Column(String(500), nullable=True)
    emergency_contacts = Column(Text, nullable=True) # JSON or key-value format (Police: 112, Medical: 108, Tourist Helpline: 1363)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    destination = relationship("Destination", back_populates="advisories")
