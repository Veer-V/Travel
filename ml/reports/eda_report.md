# SmartVoyage AI — Exploratory Data Analysis (EDA) Report

**Generated Date**: 2026-10-23 23:44:40  
**Data Directory**: `C:\Users\Osama\OneDrive\Desktop\Travel\datasets\sample`  

---

## 1. Executive Summary & Coverage
- **Total Validated Destinations**: 56 across 23 Indian States & Union Territories.
- **Total Cataloged Attractions**: 166 with geospatial coordinates and accessibility metadata.
- **Accommodations Sample**: 168 properties across budget hostels, hotels, and luxury resorts.
- **Cuisine & Dining Establishments**: 168 authentic dining locations.
- **Intercity Transit Routes**: 735 flight, train, and bus connections.
- **Safety Observations & Records**: 112 categorized hazard/incident logs.
- **Missing Values**: 0 missing values across all primary keys, coordinates, and pricing columns.

---

## 2. Geographic & Destination Distribution

### Destination by Type
| Destination Type | Count | Percentage |
|---|---|---|
| `heritage` | 14 | 25.0% |
| `spiritual` | 10 | 17.9% |
| `hill_station` | 9 | 16.1% |
| `nature` | 9 | 16.1% |
| `urban` | 4 | 7.1% |
| `adventure` | 3 | 5.4% |
| `beach` | 3 | 5.4% |
| `cultural` | 3 | 5.4% |
| `wildlife` | 1 | 1.8% |

### State / Region Representation
Total distinct regions covered: **23**. Top regions:
- Rajasthan: 4 destinations
- Uttarakhand: 4 destinations
- Maharashtra: 6 destinations
- Himachal Pradesh: 3 destinations
- Kerala: 4 destinations
- Tamil Nadu: 5 destinations
- Karnataka: 5 destinations

---

## 3. Attraction Profiling & Categories

### Category Breakdown
| Attraction Category | Count | Percentage |
|---|---|---|
| `cultural` | 43 | 25.9% |
| `historical` | 34 | 20.5% |
| `nature` | 32 | 19.3% |
| `spiritual` | 28 | 16.9% |
| `adventure` | 11 | 6.6% |
| `viewpoint` | 9 | 5.4% |
| `park` | 3 | 1.8% |
| `beach` | 3 | 1.8% |
| `wildlife` | 2 | 1.2% |
| `museum` | 1 | 0.6% |

### Key Metrics
- **Mean Visit Duration**: 119.8 minutes (~2.0 hours).
- **Mean Admission Price**: ₹45.39 (includes free public sites and ticketed monuments).
- **Mean Visitor Rating**: 4.61 / 5.0.

---

## 4. Accommodation & Cost Distributions

### Accommodation Tier Analysis
| Accommodation Tier | Count |
|---|---|
| `hotel` | 91 |
| `hostel` | 56 |
| `resort` | 21 |

### Nightly Tariff Breakdown (INR)
- **Min**: ₹750.0
- **25th Percentile**: ₹750.0
- **Median (50%)**: ₹2200.0
- **75th Percentile**: ₹5800.0
- **Max**: ₹5800.0

### Mean Daily Travel Costs by Category (INR)
| Cost Category | Mean Daily Benchmark |
|---|---|
| Accommodation (per room/night) | ₹2142.86 |
| Food (per person/day) | ₹694.64 |
| Local Transit (per day) | ₹367.86 |
| Activities & Admissions (avg) | ₹356.25 |

---

## 5. Safety Observations & Hazard Distribution
- **Official Advisory Statuses**: {'normal': 106, 'exercise_caution': 6}
- **Weather Hazard Prevalences**: {'none': 104, 'landslide': 6, 'heatwave': 2}
- **Incident Classifications**: {'petty_theft': 56, 'environmental': 56}

> **Policy Insight**: Weather hazards (landslide in monsoon hill stations, cyclone in coastal rim, heatwaves in desert/plains) are distinct indicators modeled independently from public safety/crime records.
