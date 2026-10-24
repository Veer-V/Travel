import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

# Ensure paths
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(APP_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
for p in [APP_DIR, BACKEND_DIR, ROOT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.core.config import settings
from app.database.session import engine, Base
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is ready safely
    try:
        print(f"[{settings.PROJECT_NAME}] Initializing database tables on {engine.url}...")
        Base.metadata.create_all(bind=engine)
        
        # Check if database needs seeding
        from app.database.session import SessionLocal
        from app.models.destination import Destination
        db = SessionLocal()
        try:
            count = db.query(Destination).count()
            if count == 0:
                print(f"[{settings.PROJECT_NAME}] Database empty, launching automated seeder...")
                try:
                    from app.database.seeder import seed_database
                    seed_database()
                except Exception as se:
                    print(f"[{settings.PROJECT_NAME}] Seeder encountered error: {se}")
            else:
                print(f"[{settings.PROJECT_NAME}] Database operational with {count} destinations.")
        finally:
            db.close()
    except Exception as e:
        print(f"[{settings.PROJECT_NAME}] Database lifespan initialization warning: {e}")
    
    yield
    print(f"[{settings.PROJECT_NAME}] Shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Travel Planner & Evidence-Based Safety Recommendation API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Favicon handler to prevent 500/404 browser errors
@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

# Health endpoint
@app.get("/health", tags=["System"])
def root_health():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "api_v1_docs": "/docs"
    }

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Static frontend mounting (compiled React Native Web single page app)
DIST_DIR = os.path.join(BACKEND_DIR, "dist")
if not os.path.exists(DIST_DIR):
    DIST_DIR = os.path.join(ROOT_DIR, "mobile", "dist")

if os.path.exists(DIST_DIR) and os.path.exists(os.path.join(DIST_DIR, "index.html")):
    expo_dir = os.path.join(DIST_DIR, "_expo")
    if os.path.exists(expo_dir):
        app.mount("/_expo", StaticFiles(directory=expo_dir), name="expo-static")
    
    @app.get("/", include_in_schema=False)
    def serve_frontend_root():
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

    @app.get("/api/v1/info", tags=["System"])
    def api_info():
        return {
            "status": "online",
            "service": settings.PROJECT_NAME,
            "docs": "/docs",
            "health": "/health"
        }
else:
    @app.get("/", tags=["System"])
    def root_index():
        return {
            "status": "online",
            "service": settings.PROJECT_NAME,
            "message": "SmartVoyage AI Backend is running.",
            "documentation": "/docs",
            "health": "/health",
            "api_v1": settings.API_V1_PREFIX
        }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Input validation error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
