# SmartVoyage AI — Dataset Sources, Attribution & Licensing

SmartVoyage AI prioritizes transparency, legal compliance, and strict separation between verified factual records, official governmental travel advisories, and model inferences.

---

## 1. Primary Sources & Licenses

| Dataset Domain | Primary Sources | License & Terms | Attribution Notice |
|---|---|---|---|
| **Geographic & Place Data** | OpenStreetMap (OSM) Contributors | Open Data Commons Open Database License (ODbL) v1.0 | © OpenStreetMap contributors |
| **Attraction Metadata & Wikidata** | Wikidata / Wikimedia Commons | Creative Commons CC0 / CC-BY-SA 4.0 | Wikidata structured knowledge & Wikimedia |
| **Indian Tourism Information** | Ministry of Tourism (Incredible India), State Tourism Boards | National Data Sharing and Accessibility Policy (NDSAP) / Public Domain | Government of India Tourism Portals |
| **Weather & Climate** | Open-Meteo Weather API | Non-Commercial / Commercial Terms (Attribution Required) | Open-Meteo.com & Copernicus ERA5 |
| **Safety & Incident Statistics** | National Crime Records Bureau (NCRB) Open Reports, India Meteorological Department (IMD) | Open Government Data (OGD) Platform India / Public Records | NCRB Crime in India & IMD Weather Bulletins |
| **Official Travel Advisories** | Consular Bulletins, State Disaster Management Authorities (SDMA) | Public Information Notices | Official Government Advisories |

---

## 2. Ethical Data Guidelines & Bias Prevention
1. **No Stigmatization**: Crime and safety observations are mapped strictly to administrative police jurisdiction zones and weather hazard categories. Protected demographics (religion, caste, gender, ethnicity) are strictly excluded from all training and inference pipelines.
2. **Exposure Denominators**: Raw incident counts are evaluated in proportion to visitor volume and population denominators where available, preventing high-traffic hubs from appearing disproportionately risky merely due to volume.
3. **Explicit Data Quality Flags**: Every row in `safety_observations.csv` and `travel_costs.csv` includes a `data_quality_flag`:
   - `verified`: Formally published government / census / department statistic.
   - `provisional`: Sourced from reputable open directories subject to annual audit.
   - `synthetic_benchmark`: Clearly marked simulated test vector used for offline ML calibration and stress testing.
   - `insufficient`: Incomplete or outdated records that trigger an explicit warning rather than false reassurance.
