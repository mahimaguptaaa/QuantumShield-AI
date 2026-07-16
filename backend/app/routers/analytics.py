from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import os
from app.database import get_db
from app.models import Transaction, CyberEvent

router = APIRouter(prefix="/analytics", tags=["Analytics"])

METRICS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml_artifacts", "metrics.json")


@router.get("/model-performance")
def model_performance():
    """Precision/recall/F1 of the hybrid rule+ML engine against known injected attack scenarios."""
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH) as f:
            return json.load(f)
    return {"error": "Model metrics not yet available. Run the seed script to train the model."}



@router.get("")
def get_analytics(db: Session = Depends(get_db)):
    fraud_by_country = (
        db.query(Transaction.country, func.count(Transaction.id))
        .filter(Transaction.risk_score >= 65)
        .group_by(Transaction.country)
        .all()
    )

    hourly_threats = (
        db.query(func.strftime("%H", Transaction.timestamp), func.count(Transaction.id))
        .filter(Transaction.risk_score >= 40)
        .group_by(func.strftime("%H", Transaction.timestamp))
        .all()
    )

    risk_distribution = (
        db.query(Transaction.threat_level, func.count(Transaction.id))
        .group_by(Transaction.threat_level)
        .all()
    )

    device_usage = (
        db.query(Transaction.device, func.count(Transaction.id))
        .group_by(Transaction.device)
        .all()
    )

    browser_usage = (
        db.query(Transaction.browser, func.count(Transaction.id))
        .group_by(Transaction.browser)
        .all()
    )

    txn_types = (
        db.query(Transaction.txn_type, func.count(Transaction.id))
        .group_by(Transaction.txn_type)
        .all()
    )

    threat_categories = (
        db.query(Transaction.threat_category, func.count(Transaction.id))
        .group_by(Transaction.threat_category)
        .all()
    )

    total = db.query(func.count(Transaction.id)).scalar() or 1
    cleared = db.query(func.count(Transaction.id)).filter(Transaction.status == "Cleared").scalar() or 0
    false_positive_rate = round((cleared / total) * 100, 1)

    return {
        "fraud_by_country": [{"name": c or "Unknown", "value": v} for c, v in fraud_by_country],
        "hourly_threats": [{"hour": h, "value": v} for h, v in sorted(hourly_threats, key=lambda x: x[0] or "0")],
        "risk_distribution": [{"name": n, "value": v} for n, v in risk_distribution],
        "device_usage": [{"name": n, "value": v} for n, v in device_usage],
        "browser_usage": [{"name": n, "value": v} for n, v in browser_usage],
        "transaction_types": [{"name": n, "value": v} for n, v in txn_types],
        "threat_categories": [{"name": n, "value": v} for n, v in threat_categories],
        "false_positive_rate": false_positive_rate,
    }
