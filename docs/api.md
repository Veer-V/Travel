# SmartVoyage AI — RESTful API Documentation

**API Base URL**: `http://localhost:8000/api/v1`  
**Interactive Swagger UI**: `http://localhost:8000/docs`  
**OpenAPI Specification**: `http://localhost:8000/openapi.json`  

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Create a new user account. Returns a JWT access token.
- **Request Body**:
  ```json
  {
    "email": "traveler@example.com",
    "password": "securepassword123",
    "full_name": "Arjun Sharma"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "traveler@example.com",
    "full_name": "Arjun Sharma"
  }
  ```

### `POST /auth/login`
Authenticate with email and password.
- **Request Body**:
  ```json
  {
    "email": "traveler@example.com",
    "password": "securepassword123"
  }
  ```
- **Response `200 OK`**: Returns Token object.

### `GET /auth/me`
Retrieve currently authenticated user profile.
- **Headers**: `Authorization: Bearer <access_token>`

---

## 2. Destinations (`/api/v1/destinations`)

### `GET /destinations`
List destinations with optional category filtering and pagination.
- **Query Parameters**:
  - `destination_type`: e.g., `heritage`, `beach`, `hill_station`, `spiritual`, `wildlife`, `urban`
  - `state`: e.g., `Rajasthan`, `Kerala`
  - `limit`: Default `50` (max 100)
  - `offset`: Default `0`

### `GET /destinations/search?q={query}`
Full-text search matching destination names, states, and descriptors.

### `GET /destinations/{destination_id}`
Retrieve complete metadata for a specific destination.

---

## 3. Attractions, Dining & Lodging

### `GET /attractions?destination_id={id}&category={category}`
List cataloged attractions for a destination with visit duration, admission fee, rating, and accessibility.

### `GET /restaurants?destination_id={id}&price_level={tier}`
List local dining establishments with regional cuisines and price tiers (`budget`, `moderate`, `fine_dining`).

### `GET /accommodations?destination_id={id}&accommodation_type={tier}`
List lodging properties across hostels, hotels, and resorts.

---

## 4. Intelligent Trip Planning (`/api/v1/trips`)

### `POST /trips/plan`
Executes full AI itinerary planning pipeline:
1. Recommender ML scores top attractions for traveler preferences.
2. Safety engine audits public safety, weather hazards, and official advisories.
3. Budget engine predicts cost allocations and uncertainty intervals.
4. Scheduling algorithm sequences morning, lunch, afternoon, sunset, and dinner stops.
5. Persists trip and returns complete trip object.

- **Request Body**:
  ```json
  {
    "title": "Autumn Heritage Tour",
    "origin": "Delhi",
    "destination_id": 3,
    "start_date": "2026-11-15",
    "end_date": "2026-11-18",
    "num_travelers": 2,
    "total_budget": 25000.0,
    "currency": "INR",
    "travel_style": "heritage",
    "transport_preference": "train",
    "accommodation_preference": "hotel",
    "food_preference": "moderate",
    "accessibility_requirements": "none"
  }
  ```

### `GET /trips`
List all trips belonging to the current user (or public/guest drafts).

### `GET /trips/{trip_id}`
Retrieve full trip details including daily scheduled items and expenses.

### `DELETE /trips/{trip_id}`
Delete a trip and associated itineraries.

---

## 5. Safety Risk Assessment (`/api/v1/safety`)

### `GET /safety/location/{location_id}`
Returns calibrated safety assessment:
- Overall evidence-based risk category (`Lower observed risk`, `Moderate observed risk`, `Elevated observed risk`, `Active official warning`, `Insufficient data`)
- Petty crime frequency per 100k exposure
- Meteorological hazards (IMD alerts)
- Official travel advisories
- Verified emergency contact hotlines (112, 1363, 108)
- Informational disclaimer

---

## 6. Budget Estimation (`/api/v1/budget`)

### `POST /budget/estimate`
Predicts multi-tier travel budget line items:
- Round-trip intercity transport
- Lodging tariff
- Meals & dining
- Local transit & cabs
- Sightseeing & admissions
- 12% emergency contingency reserve
- Low-to-high budget range (±15%)

---

## 7. System Health & Diagnostics

- `GET /health`: API status, version, and environment.
- `GET /api/v1/models/status`: Verification of loaded ML model artifacts.
- `GET /api/v1/data/status`: Database records audit.
