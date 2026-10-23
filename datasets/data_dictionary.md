# SmartVoyage AI — Data Dictionary & Schema Specification

This document defines the schema, types, allowed values, constraints, and provenance for all primary datasets in SmartVoyage AI.

---

## 1. `destinations.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `destination_id` | Integer | No | Unique primary identifier (e.g. 1, 2) |
| `destination_name` | String | No | City or destination name (e.g., Jaipur, Varanasi, Kochi) |
| `state_or_region` | String | No | State or Union Territory (e.g., Rajasthan, Uttar Pradesh, Kerala) |
| `country` | String | No | Country name (Default: "India") |
| `latitude` | Float | No | Geographic latitude (Range: 8.0°N to 37.0°N) |
| `longitude` | Float | No | Geographic longitude (Range: 68.0°E to 97.5°E) |
| `destination_type` | String | No | Category: `heritage`, `beach`, `hill_station`, `wildlife`, `spiritual`, `urban` |
| `description` | Text | Yes | Overview of historical, geographical, and cultural significance |
| `best_time_to_visit`| String | Yes | Seasonal recommendation (e.g., "October to March") |
| `climate` | String | Yes | `Tropical`, `Temperate`, `Subtropical`, `Alpine`, `Arid` |
| `source` | String | No | Provenance: "Ministry of Tourism / OpenStreetMap / Wikidata" |
| `last_updated` | ISO Date| No | Record verification timestamp |

---

## 2. `attractions.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `attraction_id` | Integer | No | Unique attraction identifier |
| `destination_id` | Integer | No | Foreign key referencing `destinations.destination_id` |
| `name` | String | No | Name of attraction (e.g., Amber Palace, Gateway of India) |
| `category` | String | No | `historical`, `nature`, `religious`, `adventure`, `cultural`, `viewpoint`, `museum`, `park`, `beach` |
| `latitude` | Float | No | Coordinate latitude |
| `longitude` | Float | No | Coordinate longitude |
| `estimated_visit_duration` | Integer | No | Suggested visit duration in minutes (e.g., 60 to 240) |
| `admission_price` | Float | No | Admission price in INR (0 for free public monuments) |
| `opening_hours` | String | No | Standard daily hours (e.g., "09:00 - 18:00") |
| `rating` | Float | No | Verified visitor rating (1.0 to 5.0 scale) |
| `accessibility_features` | String | No | `Wheelchair accessible`, `Ramps available`, `Steep stairs`, `Standard access` |
| `tags` | String | Yes | Comma-separated search/ML keywords (e.g., "fort, architecture, mughal, photography") |
| `source` | String | No | Provenance |
| `last_updated` | ISO Date| No | Timestamp |

---

## 3. `restaurants.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `restaurant_id` | Integer | No | Primary key |
| `destination_id` | Integer | No | Foreign key referencing `destinations.destination_id` |
| `name` | String | No | Establishment name |
| `cuisine` | String | No | Primary style (e.g., Rajasthani, South Indian, Mughlai, Coastal) |
| `latitude` | Float | No | Coordinate latitude |
| `longitude` | Float | No | Coordinate longitude |
| `price_level` | String | No | `budget` (₹100-300), `moderate` (₹300-800), `fine_dining` (₹800+) |
| `dietary_options` | String | No | `Pure Vegetarian`, `Vegetarian & Non-Vegetarian`, `Vegan options` |
| `rating` | Float | No | Aggregated rating (1.0 to 5.0) |
| `opening_hours` | String | No | Operating window |
| `source` | String | No | Provenance |
| `last_updated` | ISO Date| No | Timestamp |

---

## 4. `accommodations.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `accommodation_id` | Integer | No | Primary key |
| `destination_id` | Integer | No | Foreign key referencing `destinations.destination_id` |
| `name` | String | No | Lodging property name |
| `accommodation_type` | String | No | `hotel`, `hostel`, `resort`, `homestay`, `guesthouse` |
| `latitude` | Float | No | Coordinate latitude |
| `longitude` | Float | No | Coordinate longitude |
| `price_per_night` | Float | No | Estimated nightly tariff in INR |
| `amenities` | String | No | Comma-separated amenities (`WiFi, AC, Breakfast, Pool`) |
| `rating` | Float | No | Rating (1.0 to 5.0) |
| `booking_url` | String | Yes | Direct website or informational listing link |
| `source` | String | No | Provenance |
| `last_updated` | ISO Date| No | Timestamp |

---

## 5. `transport_options.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `transport_id` | Integer | No | Primary key |
| `origin` | String | No | Departure hub / city |
| `destination` | String | No | Arrival destination name |
| `transport_mode` | String | No | `flight`, `train`, `bus`, `car` |
| `estimated_duration` | Integer | No | Total travel duration in minutes |
| `estimated_cost` | Float | No | Benchmark cost per traveler in INR |
| `distance` | Float | No | Approximate route distance in kilometers |
| `source` | String | No | Provenance |
| `last_updated` | ISO Date| No | Timestamp |

---

## 6. `safety_observations.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `observation_id` | Integer | No | Primary key |
| `location_id` | Integer | No | Foreign key referencing `destinations.destination_id` |
| `observation_date` | Date | No | Reporting period / date |
| `geographic_area` | String | No | Urban district or tourist zone |
| `incident_category` | String | No | `petty_theft`, `scam`, `environmental`, `transport_hazard`, `general_safety` |
| `incident_count` | Integer | No | Reported incidents during reporting window |
| `population_or_exposure_denominator_when_available` | Integer | Yes | Base population or seasonal visitor denominator |
| `weather_hazard` | String | No | `none`, `heatwave`, `heavy_monsoon`, `cyclone`, `landslide`, `fog` |
| `infrastructure_indicators` | String | No | `well_lit`, `tourist_police_available`, `medical_access`, `standard` |
| `official_advisory_level` | String | No | `normal`, `exercise_caution`, `avoid_non_essential`, `avoid_all` |
| `data_source` | String | No | Official registry / State police / IMD |
| `data_quality_flag` | String | No | `verified`, `provisional`, `synthetic_benchmark`, `insufficient` |
| `last_updated` | ISO Date| No | Timestamp |

---

## 7. `travel_preferences.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `preference_id` | Integer | No | Primary key |
| `travel_style` | String | No | `adventure`, `family`, `romantic`, `cultural`, `historical`, `nature`, `relaxation`, `budget` |
| `budget_category` | String | No | `budget`, `moderate`, `luxury` |
| `preferred_activities` | String | No | Comma-separated preferred activity types |
| `preferred_accommodation` | String | No | Preferred accommodation category |
| `transport_preference` | String | No | Preferred transport mode |

---

## 8. `travel_costs.csv`
| Column | Type | Nullable | Description / Allowed Values |
|---|---|---|---|
| `cost_id` | Integer | No | Primary key |
| `destination_id` | Integer | No | Foreign key referencing `destinations.destination_id` |
| `cost_category` | String | No | `accommodation`, `food_daily`, `local_transport_daily`, `activities_avg` |
| `estimated_amount` | Float | No | Baseline cost in INR |
| `currency` | String | No | "INR" |
| `observation_date` | Date | No | Benchmark calculation date |
| `source` | String | No | Provenance |
