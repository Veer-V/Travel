import os
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional

class TravelRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.tfidf_matrix = None
        self.attractions_df: Optional[pd.DataFrame] = None
        self.destinations_df: Optional[pd.DataFrame] = None
        self.weights = {
            "content_sim": 0.40,
            "rating": 0.25,
            "budget": 0.15,
            "accessibility": 0.10,
            "diversity": 0.10
        }

    def fit(self, attractions_df: pd.DataFrame, destinations_df: pd.DataFrame):
        self.attractions_df = attractions_df.copy()
        self.destinations_df = destinations_df.copy()
        
        # Build text corpus for each attraction
        # Combine: name + category + description + tags + accessibility_features
        corpus = []
        for _, row in self.attractions_df.iterrows():
            text = f"{row['name']} {row['category']} {row.get('description', '')} {row.get('tags', '')} {row.get('accessibility_features', '')}"
            corpus.append(text.lower())
        
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        print(f"Recommender fitted on {len(self.attractions_df)} attractions with {self.tfidf_matrix.shape[1]} vocabulary features.")
        return self

    def recommend_attractions(
        self,
        destination_id: int,
        travel_style: str = "cultural",
        interests: List[str] = None,
        budget: float = 20000.0,
        accessibility_req: str = "none",
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        if self.attractions_df is None or self.tfidf_matrix is None:
            raise ValueError("Model is not fitted yet!")

        if interests is None:
            interests = []

        # Filter attractions for this destination
        dest_mask = (self.attractions_df["destination_id"] == destination_id)
        if not dest_mask.any():
            return []

        sub_df = self.attractions_df[dest_mask].copy()
        sub_indices = sub_df.index.tolist()

        # Build query text
        query_text = f"{travel_style} {' '.join(interests)}".lower()
        query_vec = self.vectorizer.transform([query_text])
        sub_tfidf = self.tfidf_matrix[sub_indices]

        # Calculate cosine similarity
        sim_scores = cosine_similarity(query_vec, sub_tfidf).flatten()

        results = []
        for i, idx in enumerate(sub_indices):
            row = sub_df.loc[idx]
            content_score = float(sim_scores[i])

            # Normalized rating score (1-5 scaled to 0-1)
            raw_rating = float(row.get("rating", 4.0))
            rating_score = max(0.0, min(1.0, (raw_rating - 1.0) / 4.0))

            # Budget suitability: cheaper admission is friendlier, admission under budget fraction
            adm_price = float(row.get("admission_price", 0.0))
            budget_score = 1.0 if adm_price == 0 else max(0.2, 1.0 - (adm_price / 1000.0))

            # Accessibility score
            acc_feat = str(row.get("accessibility_features", "")).lower()
            if accessibility_req.lower() in ["wheelchair", "step_free", "accessible"]:
                acc_score = 1.0 if ("wheelchair" in acc_feat or "ramp" in acc_feat or "step-free" in acc_feat) else 0.3
            else:
                acc_score = 1.0

            # Composite weighted score
            final_score = (
                self.weights["content_sim"] * content_score +
                self.weights["rating"] * rating_score +
                self.weights["budget"] * budget_score +
                self.weights["accessibility"] * acc_score
            )

            # Explanations
            reasons = []
            if content_score > 0.15:
                reasons.append(f"Strong match for '{travel_style}' style & interests")
            if raw_rating >= 4.6:
                reasons.append(f"Top-rated landmark ({raw_rating}★)")
            if adm_price == 0.0:
                reasons.append("Free admission")
            elif adm_price <= 50.0:
                reasons.append(f"Low admission fee (₹{adm_price:.0f})")
            if accessibility_req.lower() != "none" and acc_score == 1.0:
                reasons.append("Meets accessibility requirements")

            if not reasons:
                reasons.append("Popular landmark in destination")

            results.append({
                "attraction_id": int(row["attraction_id"]),
                "destination_id": int(row["destination_id"]),
                "name": str(row["name"]),
                "category": str(row["category"]),
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "estimated_visit_duration": int(row["estimated_visit_duration"]),
                "admission_price": float(row["admission_price"]),
                "opening_hours": str(row["opening_hours"]),
                "rating": raw_rating,
                "accessibility_features": str(row["accessibility_features"]),
                "description": str(row.get("description", "")),
                "tags": str(row.get("tags", "")),
                "relevance_score": round(float(final_score), 4),
                "explanation": reasons
            })

        # Sort by relevance_score descending
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results[:top_k]

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        payload = {
            "vectorizer": self.vectorizer,
            "tfidf_matrix": self.tfidf_matrix,
            "attractions_df": self.attractions_df,
            "destinations_df": self.destinations_df,
            "weights": self.weights
        }
        joblib.dump(payload, filepath)
        print(f"Recommender model saved to: {filepath}")

    @classmethod
    def load(cls, filepath: str) -> "TravelRecommender":
        payload = joblib.load(filepath)
        rec = cls()
        rec.vectorizer = payload["vectorizer"]
        rec.tfidf_matrix = payload["tfidf_matrix"]
        rec.attractions_df = payload["attractions_df"]
        rec.destinations_df = payload["destinations_df"]
        rec.weights = payload["weights"]
        return rec

def train_and_evaluate_recommender(data_dir: str, model_path: str):
    attr_df = pd.read_csv(os.path.join(data_dir, "attractions.csv"))
    dest_df = pd.read_csv(os.path.join(data_dir, "destinations.csv"))
    
    rec = TravelRecommender()
    rec.fit(attr_df, dest_df)
    rec.save(model_path)

    # Evaluate on explicit benchmark test cases
    test_cases = [
        {"dest_id": 3, "style": "heritage", "interests": ["palace", "fort", "royal"], "budget": 15000, "access": "none", "expected_top": "Amber Palace"},
        {"dest_id": 7, "style": "spiritual", "interests": ["temple", "peace"], "budget": 10000, "access": "wheelchair", "expected_top": "Golden Temple"},
        {"dest_id": 2, "style": "historical", "interests": ["wonder", "romantic", "sunset"], "budget": 20000, "access": "none", "expected_top": "Taj Mahal"},
        {"dest_id": 18, "style": "beach", "interests": ["relaxation", "ocean", "sunset"], "budget": 25000, "access": "none", "expected_top": "Palolem Beach"}
    ]

    print("\n--- Evaluating Offline Recommender Benchmark Test Cases ---")
    precision_at_3 = []
    for tc in test_cases:
        top_recs = rec.recommend_attractions(
            destination_id=tc["dest_id"],
            travel_style=tc["style"],
            interests=tc["interests"],
            budget=tc["budget"],
            accessibility_req=tc["access"],
            top_k=3
        )
        top_names = [r["name"] for r in top_recs]
        matched = any(tc["expected_top"].lower() in n.lower() for n in top_names)
        precision_at_3.append(1.0 if matched else 0.0)
        print(f"Test [Dest: {tc['dest_id']}, Style: {tc['style']}]: Top-3 -> {top_names} | Matched '{tc['expected_top']}': {matched}")

    p3_score = np.mean(precision_at_3)
    print(f"\nRecommender Precision@3 Benchmark: {p3_score * 100:.1f}%\n")
    return rec

if __name__ == "__main__":
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    d_dir = os.path.join(base, "datasets", "sample")
    m_path = os.path.join(base, "ml", "models", "recommender.joblib")
    train_and_evaluate_recommender(d_dir, m_path)
