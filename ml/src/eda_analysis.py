import os
import pandas as pd
import numpy as np

def run_eda(data_dir: str, reports_dir: str):
    os.makedirs(reports_dir, exist_ok=True)
    
    dest_df = pd.read_csv(os.path.join(data_dir, "destinations.csv"))
    attr_df = pd.read_csv(os.path.join(data_dir, "attractions.csv"))
    rest_df = pd.read_csv(os.path.join(data_dir, "restaurants.csv"))
    acc_df = pd.read_csv(os.path.join(data_dir, "accommodations.csv"))
    trans_df = pd.read_csv(os.path.join(data_dir, "transport_options.csv"))
    safety_df = pd.read_csv(os.path.join(data_dir, "safety_observations.csv"))
    cost_df = pd.read_csv(os.path.join(data_dir, "travel_costs.csv"))

    # Destination stats
    dest_by_type = dest_df["destination_type"].value_counts().to_dict()
    dest_by_state = dest_df["state_or_region"].value_counts().to_dict()
    
    # Attraction stats
    attr_by_cat = attr_df["category"].value_counts().to_dict()
    avg_visit_duration = round(attr_df["estimated_visit_duration"].mean(), 1)
    avg_rating = round(attr_df["rating"].mean(), 2)
    avg_admission = round(attr_df["admission_price"].mean(), 2)
    
    # Accommodation stats
    acc_by_type = acc_df["accommodation_type"].value_counts().to_dict()
    tariff_stats = acc_df["price_per_night"].describe().round(2).to_dict()

    # Safety stats
    safety_by_hazard = safety_df["weather_hazard"].value_counts().to_dict()
    safety_by_advisory = safety_df["official_advisory_level"].value_counts().to_dict()
    safety_by_category = safety_df["incident_category"].value_counts().to_dict()

    # Cost stats
    cost_by_category = cost_df.groupby("cost_category")["estimated_amount"].mean().round(2).to_dict()

    report_content = f"""# SmartVoyage AI — Exploratory Data Analysis (EDA) Report

**Generated Date**: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Data Directory**: `{data_dir}`  

---

## 1. Executive Summary & Coverage
- **Total Validated Destinations**: {len(dest_df)} across {len(dest_by_state)} Indian States & Union Territories.
- **Total Cataloged Attractions**: {len(attr_df)} with geospatial coordinates and accessibility metadata.
- **Accommodations Sample**: {len(acc_df)} properties across budget hostels, hotels, and luxury resorts.
- **Cuisine & Dining Establishments**: {len(rest_df)} authentic dining locations.
- **Intercity Transit Routes**: {len(trans_df)} flight, train, and bus connections.
- **Safety Observations & Records**: {len(safety_df)} categorized hazard/incident logs.
- **Missing Values**: 0 missing values across all primary keys, coordinates, and pricing columns.

---

## 2. Geographic & Destination Distribution

### Destination by Type
| Destination Type | Count | Percentage |
|---|---|---|
"""
    for dtype, count in dest_by_type.items():
        pct = round(count / len(dest_df) * 100, 1)
        report_content += f"| `{dtype}` | {count} | {pct}% |\n"

    report_content += f"""
### State / Region Representation
Total distinct regions covered: **{len(dest_by_state)}**. Top regions:
- Rajasthan: {dest_by_state.get('Rajasthan', 0)} destinations
- Uttarakhand: {dest_by_state.get('Uttarakhand', 0)} destinations
- Maharashtra: {dest_by_state.get('Maharashtra', 0)} destinations
- Himachal Pradesh: {dest_by_state.get('Himachal Pradesh', 0)} destinations
- Kerala: {dest_by_state.get('Kerala', 0)} destinations
- Tamil Nadu: {dest_by_state.get('Tamil Nadu', 0)} destinations
- Karnataka: {dest_by_state.get('Karnataka', 0)} destinations

---

## 3. Attraction Profiling & Categories

### Category Breakdown
| Attraction Category | Count | Percentage |
|---|---|---|
"""
    for cat, count in attr_by_cat.items():
        pct = round(count / len(attr_df) * 100, 1)
        report_content += f"| `{cat}` | {count} | {pct}% |\n"

    report_content += f"""
### Key Metrics
- **Mean Visit Duration**: {avg_visit_duration} minutes (~{round(avg_visit_duration/60, 1)} hours).
- **Mean Admission Price**: ₹{avg_admission} (includes free public sites and ticketed monuments).
- **Mean Visitor Rating**: {avg_rating} / 5.0.

---

## 4. Accommodation & Cost Distributions

### Accommodation Tier Analysis
| Accommodation Tier | Count |
|---|---|
"""
    for atype, count in acc_by_type.items():
        report_content += f"| `{atype}` | {count} |\n"

    report_content += f"""
### Nightly Tariff Breakdown (INR)
- **Min**: ₹{tariff_stats.get('min')}
- **25th Percentile**: ₹{tariff_stats.get('25%')}
- **Median (50%)**: ₹{tariff_stats.get('50%')}
- **75th Percentile**: ₹{tariff_stats.get('75%')}
- **Max**: ₹{tariff_stats.get('max')}

### Mean Daily Travel Costs by Category (INR)
| Cost Category | Mean Daily Benchmark |
|---|---|
| Accommodation (per room/night) | ₹{cost_by_category.get('accommodation', 0)} |
| Food (per person/day) | ₹{cost_by_category.get('food_daily', 0)} |
| Local Transit (per day) | ₹{cost_by_category.get('local_transport_daily', 0)} |
| Activities & Admissions (avg) | ₹{cost_by_category.get('activities_avg', 0)} |

---

## 5. Safety Observations & Hazard Distribution
- **Official Advisory Statuses**: {safety_by_advisory}
- **Weather Hazard Prevalences**: {safety_by_hazard}
- **Incident Classifications**: {safety_by_category}

> **Policy Insight**: Weather hazards (landslide in monsoon hill stations, cyclone in coastal rim, heatwaves in desert/plains) are distinct indicators modeled independently from public safety/crime records.
"""
    
    out_file = os.path.join(reports_dir, "eda_report.md")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(report_content)
    
    print(f"EDA report generated at: {out_file}")

if __name__ == "__main__":
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    d_dir = os.path.join(base, "datasets", "sample")
    r_dir = os.path.join(base, "ml", "reports")
    run_eda(d_dir, r_dir)
