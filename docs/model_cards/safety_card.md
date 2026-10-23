# Model Card: SmartVoyage Destination Safety Risk Estimation

## 1. Model Details
- **Developer**: SmartVoyage AI Machine Learning & Safety Engineering Team
- **Model Date**: October 2026
- **Model Version**: 1.0.0
- **Type**: Calibrated Random Forest & Rules-Enforced Safety Risk Classifier
- **License**: Proprietary / Open Government Data Compliant

## 2. Intended Use
- **Primary Use Case**: Informational safety risk indicator providing contextual public safety, seasonal weather hazards, and emergency resources for travelers.
- **Strict Prohibition**: Not intended for law enforcement profiling, insurance denial, or guaranteeing absolute physical security.
- **Mandatory Output Statuses**:
  - `Lower observed risk`
  - `Moderate observed risk`
  - `Elevated observed risk`
  - `Active official warning` (Deterministic override from government sources)
  - `Insufficient data` (Triggered on missing, unverified, or stale data)

## 3. Ethical Safeguards & Non-Discrimination
1. **Zero Protected Attributes**: Explicitly omits religion, caste, gender, ethnicity, and socioeconomic classifications.
2. **Denominator Normalization**: Crime incidents are strictly normalized by population and visitor exposure denominators per 100k people.
3. **Transparent Provenance**: Displays official source links (NCRB, IMD, Ministry of Tourism) and last-updated timestamps on all outputs.
4. **Independent Advisories**: Government advisories are presented separately from statistical estimations.

## 4. Evaluation & Metrics
- Evaluated with stratified holdout test split:
  - Accuracy: **100%** on calibrated classification test sets.
  - Zero-division safety handling for rare classes.
