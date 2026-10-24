from typing import List, Union, Optional
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
import os

def _get_default_database_url() -> str:
    env_url = os.environ.get("DATABASE_URL")
    if env_url:
        return env_url
    # Vercel serverless filesystem is read-only except /tmp
    if os.environ.get("VERCEL"):
        return "sqlite:////tmp/smartvoyage.db"
    
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    root_db = os.path.join(root_dir, "smartvoyage.db")
    if os.path.exists(root_db):
        return f"sqlite:///{root_db.replace(chr(92), '/')}"
    return "sqlite:///./smartvoyage.db"

def _get_default_dataset_dir() -> str:
    backend_datasets = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")), "datasets")
    if os.path.exists(backend_datasets):
        return backend_datasets
    return os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")), "datasets", "sample")

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartVoyage AI"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")
    DEBUG: bool = os.environ.get("DEBUG", "True").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "smartvoyage-dev-secret-key-change-in-production-min-32-chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = _get_default_database_url()

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
    
    # Internal Service Bindings (e.g. Vercel Services)
    ML_SERVICE_URL: Optional[str] = os.environ.get("ML_SERVICE_URL")

    # Data & ML model paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DATASET_DIR: str = _get_default_dataset_dir()
    MODEL_DIR: str = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")), "ml", "models")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
