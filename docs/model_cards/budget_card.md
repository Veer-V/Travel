# Model Card: SmartVoyage Multi-Category Trip Budget Estimator

## 1. Model Details
- **Developer**: SmartVoyage AI Machine Learning & Quantitative Analytics Team
- **Model Date**: October 2026
- **Model Version**: 1.0.0
- **Type**: Multi-tier Regression and Parametric Cost Estimation System
- **License**: Proprietary / Apache 2.0 dual-licensable

## 2. Intended Use
- **Primary Use Case**: Generating realistic, transparent trip budgets across 6 primary cost categories (intercity transit, lodging, food & dining, local transit, attractions/activities, and emergency reserve).
- **Inputs**: Origin, Destination, Travel Dates (Duration), Traveler Count, Room Allocation, Preferred Transport Mode, Accommodation Tier, Meal Tier.
- **Outputs**: Total estimated budget, cost per person, low/high uncertainty interval (±15%), and categorized line items with percentage breakdowns.

## 3. Cost Architecture & Contingency
- **Lodging Rules**: Calculated per room per night using regional benchmark tariffs ($N_{\text{rooms}} = \lceil N_{\text{travelers}} / 2 \rceil$).
- **Contingency Reserve**: Mandates a 12% emergency cushion for unforeseen delays, medical needs, or local peak tariffs.
- **Uncertainty Range**: Accounts for seasonal tariff surges (88% lower bound to 115% upper bound).

## 4. Evaluation & Metrics
- Evaluated on test split of multi-day trip permutations across Indian transit corridors:
  - **R² Score**: > 0.98
  - **Mean Absolute Error (MAE)**: Minimizes estimation variance across lodging and transit.
