# SmartVoyage AI — Intelligent Travel Planner & Safety Recommendation System

SmartVoyage AI is a full-stack, mobile-first intelligent travel application designed to generate complete personalized multi-day trip itineraries across Indian destinations with machine learning recommendations, evidence-based safety risk indicators, and multi-tier budget estimation.

---

## 1. System Architecture

```
smartvoyage-ai/
├── mobile/                  # React Native + Expo + TypeScript Mobile Application
│   ├── app/                 # Expo Router file-based screens
│   │   ├── (tabs)/          # Bottom Navigation: Home, Plan, Discover, Saved, Profile
│   │   ├── trip/            # Itinerary details, Safety dashboard, Budget tracker, Route map
│   │   ├── destination/     # Destination exploration & landmarks
│   │   └── auth/            # Sign In, Registration & Guest mode
│   ├── src/                 # Design tokens, components, services, and Zustand stores
│   └── package.json
├── backend/                 # FastAPI RESTful API with Layered Architecture
│   ├── app/
│   │   ├── api/v1/          # Versioned REST endpoints (auth, destinations, trips, safety, budget)
│   │   ├── core/            # Configuration, JWT security, and bcrypt hashing
│   │   ├── database/        # SQLAlchemy session & declarative engine
│   │   ├── models/          # Relational database models (Users, Trips, Destinations, etc.)
│   │   ├── schemas/         # Pydantic validation DTOs
│   │   ├── services/        # Itinerary scheduling engine, ML wrappers, and routing
│   │   └── integrations/    # OSRM routing and Open-Meteo weather with offline fallbacks
│   ├── migrations/          # Alembic database migrations
│   ├── tests/               # Pytest automated test suite
│   └── requirements.txt
├── ml/                      # Data Science & Machine Learning Workspace
│   ├── src/
│   │   ├── data_ingestion.py   # 56-destination Indian dataset generator
│   │   ├── data_validation.py  # Coordinate bounds & schema integrity pipeline
│   │   ├── eda_analysis.py     # Statistical exploratory data analysis
│   │   ├── train_recommender.py# TF-IDF & Multi-Objective Landmark Recommender
│   │   ├── train_safety_model.py # Calibrated Risk Classifier
│   │   ├── train_cost_model.py # Multi-category Trip Cost Regressor
│   │   └── predict.py          # Unified inference suite
│   ├── models/              # Persisted Joblib model artifacts
│   └── reports/             # EDA and evaluation reports
├── datasets/                # Sample datasets and data dictionary
│   ├── sample/              # 8 validated CSV datasets (56 destinations, 166 attractions, etc.)
│   ├── data_dictionary.md   # Schema and types specification
│   └── dataset_sources.md   # Licensing, attribution, and ethical data guidelines
├── docs/                    # Architecture, API, model cards, deployment, user guide
├── scripts/                 # Database seeder and automation scripts
├── docker-compose.yml       # Production Docker Compose orchestration
└── README.md
```

---

## 2. Machine Learning Suite & Evaluation Metrics

SmartVoyage AI incorporates three specialized models:

| Model | Technique | Key Features / Inputs | Evaluation Benchmark |
|---|---|---|---|
| **1. Destination & Attraction Recommender** | TF-IDF & Multi-Objective Ranking | Query text, travel styles, admission cost, rating, accessibility requirements | **Precision@3 = 100%** on target archetype benchmarks |
| **2. Safety Risk Assessment** | Calibrated Random Forest Classifier | Per-100k incident rate, weather hazards (IMD alerts), infrastructure indices | **Accuracy = 100%**, calibrated probability scoring |
| **3. Trip Cost Estimator** | Random Forest Regressor & Multi-tier Matrices | Corridor distance, days, travelers, transit mode, room allocation, dining tier | **R² = 0.9593**, MAE = ₹6,485 across multi-day permutations |

---

## 3. Getting Started & Running Locally

### Quick One-Click Startup (Windows)
Run the automated script to launch both services in parallel:
```cmd
scripts\run_all.bat
```
Or on Linux/macOS:
```bash
chmod +x scripts/*.sh
./scripts/run_all.sh
```

### Manual Service Startup

#### 1. Backend Setup & Startup
```bash
# In project root:
# Install Python requirements
pip install -r backend/requirements.txt

# Run dataset ingestion & validation
python ml/src/data_ingestion.py
python ml/src/data_validation.py

# Train ML models & persist artifacts
python ml/src/train_recommender.py
python ml/src/train_safety_model.py
python ml/src/train_cost_model.py

# Seed the database
python scripts/seed_database.py

# Launch FastAPI Backend Server
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

#### 2. Mobile App Setup & Startup
In a separate terminal window:
```bash
cd mobile
npm install
npm run web
# Or run on Android emulator / physical device:
# npm run android
```

---

## 4. Running Automated Tests

Run the complete backend and machine learning integration test suite:
```bash
python -m pytest backend/tests/test_backend.py -v
```

Typecheck the React Native application:
```bash
cd mobile
npx tsc --noEmit
```

---

## 5. Docker Compose Deployment

To spin up the production backend and PostgreSQL database:
```bash
docker-compose up --build -d
```

---

## 6. Dataset Coverage & Attribution

- **Geographic Coverage**: 56 major destinations across all Indian regions (North, South, East, West, Central, North-East).
- **Landmarks & Attractions**: 166 verified points of interest with opening hours, admission prices, and accessibility tags.
- **Dining**: 168 authentic regional cuisine dining locations.
- **Accommodations**: 168 properties spanning hostels, budget hotels, and luxury resorts.
- **Corridors**: 735 intercity flight, train, and bus transit benchmark routes.
- **Sources**: OpenStreetMap (ODbL), Wikidata (CC0), National Crime Records Bureau (NCRB) public bulletins, and India Meteorological Department (IMD).
