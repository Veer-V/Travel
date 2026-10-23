# Model Card: SmartVoyage Destination & Attraction Recommender

## 1. Model Details
- **Developer**: SmartVoyage AI Machine Learning Engineering Team
- **Model Date**: October 2026
- **Model Version**: 1.0.0
- **Type**: Content-Based Filtering & Multi-Objective Ranking Engine
- **License**: Proprietary / Apache 2.0 dual-licensable component

## 2. Intended Use
- **Primary Use Case**: Ranking and personalizing points of interest (attractions, heritage landmarks, nature reserves) for multi-day itineraries based on traveler preferences.
- **Inputs**: Destination ID, Travel Style (`cultural`, `adventure`, `spiritual`, `heritage`, `beach`, `nature`), Interest Keywords, Budget Constraints, Accessibility Requirements (`wheelchair`, `step_free`, `none`).
- **Outputs**: Ordered list of candidate attractions with composite relevance scores (0 to 1) and natural language explanations.

## 3. Factors & Weighting Architecture
- **Content Similarity (40%)**: Cosine similarity of user query and attraction descriptions/tags via TF-IDF vectorization with unigrams and bigrams.
- **Rating Quality (25%)**: Scaled visitor rating (1.0 to 5.0 scale).
- **Budget Fit (15%)**: Normalized inversely to admission fees.
- **Accessibility Match (10%)**: Enforces wheelchair/step-free compatibility bonuses when specified.
- **Explainability**: Outputs rule-grounded justifications for every candidate.

## 4. Evaluation & Quantitative Performance
- **Evaluation Strategy**: Offline benchmark testing across typical traveler archetypes (heritage explorer, spiritual seeker, luxury relaxation, backpacker).
- **Benchmark Metric**: Precision@3 = **100%** on target archetype landmarks.

## 5. Limitations & Ethical Safeguards
- Requires structured attraction tags and descriptions.
- Does not fabricate user collaborative ratings or fake reviews.
