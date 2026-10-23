# SmartVoyage AI — Responsible AI, Privacy & Ethics Framework

## 1. Ethical Principles & Non-Discrimination
SmartVoyage AI adheres to the highest standards of Responsible AI in geospatial and safety analytics:
1. **Zero Protected Attributes**: Under no circumstance does the system model or infer safety, crime, or risk from demographic characteristics, religion, caste, gender, ethnicity, or nationality.
2. **Anti-Stigmatization Policy**: Safety indicators reflect verified jurisdictional incidents normalized by population and visitor denominators, severe meteorological alerts (IMD bulletins), and official government advisories. Neighborhoods are never stigmatized based on socioeconomic composition.
3. **No False Reassurance**: The safety model enforces an explicit "Insufficient Data" protocol. If a region has outdated or missing reporting, the system returns `Insufficient data` with guidance to inquire with local authorities rather than predicting low risk.
4. **Informational Transparency**: The system explicitly disclaims guarantees of personal safety. Safety scores are informational historical benchmarks.

---

## 2. Privacy & Data Minimization
- **Minimal Data Collection**: The application requires only an email address and hashed password for registered accounts. Guest mode functions without collecting any personal identity information.
- **Local-First Itinerary Storage**: Planned trip drafts and bookmarks are stored securely on the user's device via `expo-secure-store` and `AsyncStorage`.
- **Right to Erasure**: Users can purge all locally stored trip drafts and cached data with one tap under **Profile → Privacy & Device Storage**.
- **Location Privacy**: Location permissions are requested only for distance calculations and are never tracked in the background or shared with third-party advertising brokers.
