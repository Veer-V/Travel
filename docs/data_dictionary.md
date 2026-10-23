# SmartVoyage AI — Data Dictionary

This data dictionary provides a complete definition of all entities, fields, data types, constraints, and valid ranges utilized across the SmartVoyage AI platform (both CSV ingestion pipelines and relational database models).

---

## 1. Core Entities & Field Specifications

### 1.1 Destinations (`destinations.csv` / `destinations` table)
| Column Name | Data Type | Nullable | Primary / Foreign Key | Description & Permitted Values |
|---|---|---|---|---|
| `id` / `destination_id` | Integer | No | PK | Unique identifier for destination |
| `name` | String(100) | No | None | Destination name (e.g., "Jaipur", "Kochi") |
| `state` | String(100) | No | None | Indian State or Union Territory |
| `country` | String(50) | No | None | Default "India" |
| `latitude` | Float | No | None | WGS84 decimal latitude (-90.0 to +90.0) |
| `longitude` | Float | No | None | WGS84 decimal longitude (-180.0 to +180.0) |
| `category` | String(50) | No | None | Primary category: `Heritage`, `Nature`, `Spiritual`, `Beach`, `Urban`, `Adventure`, `Wildlife` |
| `description` | Text | Yes | None | Overview of destination highlights and culture |
| `best_season` | String(50) | Yes | None | Best travel months (e.g., "Oct-Mar", "Nov-Feb") |
| `ideal_duration_days` | Integer | No | None | Suggested duration in days (typically 2–7) |
| `average_daily_budget_inr` | Float | No | None | Base budget benchmark per traveler per day (INR) |
| `is_active` | Boolean | No | None | Operational flag (default `True`) |

---

### 1.2 Attractions (`attractions.csv` / `attractions` table)
| Column Name | Data Type | Nullable | Primary / Foreign Key | Description & Permitted Values |
|---|---|---|---|---|
| `id` / `attraction_id` | Integer | No | PK | Unique identifier for attraction |
| `destination_id` | Integer | No | FK (`destinations.id`) | Associated destination |
| `name` | String(150) | No | None | Attraction name (e.g., "Hawa Mahal", "Amber Palace") |
| `category` | String(50) | No | None | `Monument`, `Museum`, `Palace`, `Fort`, `Temple`, `Nature`, `Beach`, `Market`, `Park` |
| `latitude` | Float | No | None | WGS84 decimal latitude |
| `longitude` | Float | No | None | WGS84 decimal longitude |
| `rating` | Float | No | None | User rating (1.0 to 5.0) |
| `entry_fee_inr` | Float | No | None | Admission fee in INR (0.0 for free entry) |
| `typical_duration_hours` | Float | No | None | Recommended visit duration in hours (0.5 to 5.0) |
| `opening_time` | String(10) | Yes | None | 24-hr opening format (e.g., "09:00") |
| `closing_time` | String(10) | Yes | None | 24-hr closing format (e.g., "17:30") |
| `wheelchair_accessible` | Boolean | No | None | Physical accessibility indicator |
| `description` | Text | Yes | None | Architectural, historical, or scenic summary |

---

### 1.3 Accommodations (`accommodations.csv` / `accommodations` table)
| Column Name | Data Type | Nullable | Primary / Foreign Key | Description & Permitted Values |
|---|---|---|---|---|
| `id` | Integer | No | PK | Unique accommodation identifier |
| `destination_id` | Integer | No | FK (`destinations.id`) | Associated destination |
| `name` | String(150) | No | None | Property name |
| `tier` | String(30) | No | None | `budget`, `mid_range`, `luxury` |
| `price_per_night_inr` | Float | No | None | Base room rate per night in INR |
| `rating` | Float | No | None | Verified guest score (1.0 to 5.0) |
| `latitude` | Float | No | None | WGS84 latitude |
| `longitude` | Float | No | None | WGS84 longitude |
| `amenities` | String(255) | Yes | None | Comma-delimited features (e.g., "WiFi,AC,Breakfast") |

---

### 1.4 Restaurants (`restaurants.csv` / `restaurants` table)
| Column Name | Data Type | Nullable | Primary / Foreign Key | Description & Permitted Values |
|---|---|---|---|---|
| `id` | Integer | No | PK | Unique dining venue identifier |
| `destination_id` | Integer | No | FK (`destinations.id`) | Associated destination |
| `name` | String(150) | No | None | Venue name |
| `cuisine_type` | String(80) | No | None | e.g., `Rajasthani`, `South Indian`, `Mughlai`, `Continental` |
| `price_tier` | String(30) | No | None | `budget`, `mid_range`, `luxury` |
| `avg_cost_per_meal_inr` | Float | No | None | Average cost per person per meal in INR |
| `rating` | Float | No | None | Dining rating (1.0 to 5.0) |
| `dietary_options` | String(100) | Yes | None | e.g., `Vegetarian,Vegan,Halal,Jain` |

---

### 1.5 Transport Routes (`transport_options.csv` / `transport_options` table)
| Column Name | Data Type | Nullable | Primary / Foreign Key | Description & Permitted Values |
|---|---|---|---|---|
| `id` | Integer | No | PK | Unique transport option identifier |
| `origin_destination_id` | Integer | No | FK (`destinations.id`) | Departure destination |
| `destination_id` | Integer | No | FK (`destinations.id`) | Arrival destination |
| `mode` | String(30) | No | None | `flight`, `train`, `bus`, `cab` |
| `estimated_cost_inr` | Float | No | None | One-way transit cost in INR |
| `duration_hours` | Float | No | None | Estimated travel duration in hours |
| `frequency_daily` | Integer | No | None | Approximate scheduled daily departures |

---

### 1.6 Safety Observations (`safety_observations.csv` / `safety_observations` table)
| Column Name | Data Type | Nullable | Primary / Foreign Key | Description & Permitted Values |
|---|---|---|---|---|
| `id` | Integer | No | PK | Unique observation identifier |
| `destination_id` | Integer | No | FK (`destinations.id`) | Associated destination |
| `month` | Integer | No | None | Observation month (1 to 12) |
| `crime_index` | Float | No | None | Scaled crime index (0.0 to 100.0) |
| `weather_hazard_level` | Float | No | None | Scaled weather risk index (0.0 to 100.0) |
| `scam_alert_level` | Float | No | None | Tourist scam alert index (0.0 to 100.0) |
| `health_risk_level` | Float | No | None | Health and hygiene risk index (0.0 to 100.0) |
| `safety_score` | Float | No | None | Composite ground safety score (0.0 to 100.0, higher = safer) |
| `risk_level` | String(20) | No | None | Categorical label: `low`, `moderate`, `high` |
| `women_safety_index` | Float | No | None | Specific solo/women safety score (0.0 to 100.0) |
| `emergency_contacts` | Text | Yes | None | JSON-serialized emergency numbers (Police, Ambulance, Women Helpline) |
| `data_quality_flag` | String(30) | No | None | `verified`, `provisional`, `synthetic_benchmark`, `insufficient` |

---

### 1.7 Travel Costs (`travel_costs.csv` / `travel_costs` table)
| Column Name | Data Type | Nullable | Primary / Foreign Key | Description & Permitted Values |
|---|---|---|---|---|
| `id` | Integer | No | PK | Unique cost sample identifier |
| `destination_id` | Integer | No | FK (`destinations.id`) | Associated destination |
| `duration_days` | Integer | No | None | Trip duration in days |
| `travelers_count` | Integer | No | None | Number of travelers |
| `travel_style` | String(30) | No | None | `budget`, `mid_range`, `luxury` |
| `season` | String(20) | No | None | `peak`, `shoulder`, `off_peak` |
| `total_cost_inr` | Float | No | None | Target variable: total aggregate trip cost in INR |
| `accommodation_cost_inr` | Float | No | None | Subtotal for lodging |
| `food_cost_inr` | Float | No | None | Subtotal for dining |
| `activity_cost_inr` | Float | No | None | Subtotal for entry tickets and activities |
| `local_transit_cost_inr` | Float | No | None | Subtotal for local taxis/auto-rickshaws |
| `intercity_transit_cost_inr` | Float | No | None | Subtotal for intercity transit |

---

## 2. Machine Learning Feature Spaces

### 2.1 Recommender Features
- **Item Profile Vector**: TF-IDF unigram and bigram representation (500 max features) extracted from combined textual metadata (`category`, `state`, `description`, `best_season`, accessibility tokens).
- **Ranking Objectives**: Multi-attribute linear combination of normalized content similarity, user budget compatibility penalty, historical visitor rating score, and geographic distance penalty.

### 2.2 Safety Classifier Features
- Numerical vector: `[crime_index, weather_hazard_level, scam_alert_level, health_risk_level, women_safety_index, month]`.
- Output: Calibrated probability distribution across `low`, `moderate`, `high` risk classes.

### 2.3 Budget Regressor Features
- Tabular feature array: `[duration_days, travelers_count, base_daily_rate, style_budget, style_mid_range, style_luxury, season_peak, season_shoulder, season_off_peak]`.
- Target: `total_cost_inr` (continuous regression with low/high 90% prediction intervals).
