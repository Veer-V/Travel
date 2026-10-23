from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartVoyage AI"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "smartvoyage-dev-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = "sqlite:///./smartvoyage.db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://127.0.0.1:8081",
        "*"
    ]

    # External APIs
    OPEN_METEO_API_URL: str = "https://api.open-meteo.com/v1"
    OSRM_ROUTING_URL: str = "https://router.project-osrm.org"
    
    # Data & ML model paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DATASET_DIR: str = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")), "datasets", "sample")
    MODEL_DIR: str = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")), "ml", "models")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
