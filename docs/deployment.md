# SmartVoyage AI — Deployment and Operations Guide

This guide covers running SmartVoyage AI in local development, containerized staging with Docker Compose, and production deployment on cloud infrastructure.

---

## 1. Local Development Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

### Step 1: Clone and Configure Environment
```bash
git clone <repo-url> smartvoyage-ai
cd smartvoyage-ai
cp .env.example .env
```

### Step 2: Install Backend & ML Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Run Dataset Pipeline & Train ML Models
```bash
# 1. Generate & validate starter datasets (56 Indian destinations)
python ml/src/data_ingestion.py
python ml/src/data_validation.py

# 2. Train Recommender, Safety, and Budget ML models
python ml/src/train_recommender.py
python ml/src/train_safety_model.py
python ml/src/train_cost_model.py

# 3. Seed SQLite database
python scripts/seed_database.py
```

### Step 4: Launch FastAPI Backend Server
```bash
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
Access Swagger UI documentation at: `http://127.0.0.1:8000/docs`

### Step 5: Launch Mobile App (Expo)
In a separate terminal:
```bash
cd mobile
npm install
npm run web
# Or run on Android emulator:
# npm run android
```

---

## 2. Docker Compose Deployment

To deploy the production-ready stack with PostgreSQL:

```bash
docker-compose up --build -d
```

### Services Deployed:
1. `smartvoyage-postgres`: PostgreSQL 16 container with persistent data volume.
2. `smartvoyage-backend`: FastAPI container with automated database initialization.

### Apply Database Migrations in Docker
```bash
docker-compose exec backend python -m alembic upgrade head
```

---

## 3. Production Cloud Hosting Guidance

- **Backend Hosting**: Deploy FastAPI to AWS ECS, Google Cloud Run, or Render with at least 1 vCPU and 1 GB RAM.
- **Database**: Managed PostgreSQL instance (e.g., AWS RDS, Supabase, Neon) with SSL connection string.
- **Mobile Builds**: Use EAS Build (`eas build -p android` or `eas build -p ios`) to compile standalone native application packages.
- **Environment Variables**:
  - Ensure `SECRET_KEY` is a cryptographically strong 32+ character random secret.
  - Set `DEBUG=False` and configure `CORS_ORIGINS` to trusted mobile scheme domains.
