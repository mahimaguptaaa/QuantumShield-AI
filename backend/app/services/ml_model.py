"""
QuantumShield AI - ML Anomaly Model

A genuine trained model (scikit-learn IsolationForest) that learns the
"shape" of normal cyber+transaction behaviour from the seeded dataset and
scores new transactions by how far they sit from that learned norm. Its
0-100 anomaly score is blended with the transparent rule engine
(risk_engine.py) so the platform combines:

  - Explainability (rule engine: exact named signals)
  - Genuine unsupervised learning (this module: statistical anomaly score)

This is intentionally unsupervised (IsolationForest) rather than a
classifier: in fraud detection we rarely have enough confirmed fraud
labels to train supervised models reliably, so isolating statistical
outliers is the industry-standard first line of defense.
"""
import os
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml_artifacts")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.joblib")

FEATURE_NAMES = [
    "amount_log",
    "hour",
    "failed_login_count",
    "is_vpn",
    "is_new_device",
    "is_password_reset",
    "mfa_failure_count",
    "is_admin_action",
    "is_geo_mismatch",
    "is_impossible_travel",
    "amount_ratio",
    "is_international",
]

_model = None
_calib = None


def build_feature_vector(f: dict):
    return [float(f.get(name, 0.0)) for name in FEATURE_NAMES]


def train(feature_dicts: list):
    """Fit the IsolationForest on a batch of feature dicts and persist it."""
    global _model, _calib
    X = np.array([build_feature_vector(f) for f in feature_dicts])

    model = IsolationForest(
        n_estimators=200,
        contamination=0.15,
        max_samples="auto",
        random_state=42,
    )
    model.fit(X)

    raw_scores = -model.decision_function(X)  # higher = more anomalous
    calib = {"min": float(raw_scores.min()), "max": float(raw_scores.max())}

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({"model": model, "calib": calib, "features": FEATURE_NAMES}, MODEL_PATH)

    _model, _calib = model, calib
    return model, calib


def _ensure_loaded():
    global _model, _calib
    if _model is None and os.path.exists(MODEL_PATH):
        data = joblib.load(MODEL_PATH)
        _model, _calib = data["model"], data["calib"]
    return _model is not None


def score(features: dict) -> float:
    """Return a 0-100 anomaly score for a single transaction's feature dict."""
    if not _ensure_loaded():
        return 0.0
    X = np.array([build_feature_vector(features)])
    raw = float(-_model.decision_function(X)[0])
    lo, hi = _calib["min"], _calib["max"]
    if hi - lo < 1e-6:
        return 50.0
    norm = (raw - lo) / (hi - lo) * 100
    return round(max(0.0, min(100.0, norm)), 1)


def is_trained() -> bool:
    return _ensure_loaded()
