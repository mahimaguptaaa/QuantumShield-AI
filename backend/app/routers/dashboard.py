from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Transaction, CyberEvent, Alert

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LEGACY_CIPHERS = {"RSA-2048", "ECDHE-RSA-2048", "TLS_RSA_WITH_AES_128_CBC_SHA"}


@router.get("")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_transactions = db.query(func.count(Transaction.id)).scalar() or 0
    threats_detected = db.query(func.count(Transaction.id)).filter(Transaction.risk_score >= 40).scalar() or 0
    high_risk_users = db.query(func.count(func.distinct(Transaction.user))).filter(Transaction.risk_score >= 65).scalar() or 0
    fraud_cases = db.query(func.count(Transaction.id)).filter(Transaction.status == "Blocked").scalar() or 0

    since = datetime.utcnow() - timedelta(hours=48)
    quantum_alerts = db.query(func.count(CyberEvent.id)).filter(
        CyberEvent.timestamp >= since, CyberEvent.cipher_suite.in_(LEGACY_CIPHERS)
    ).scalar() or 0

    avg_risk = db.query(func.avg(Transaction.risk_score)).scalar() or 0
    avg_confidence = db.query(func.avg(Transaction.confidence)).scalar() or 0
    active_alerts = db.query(func.count(Alert.id)).filter(Alert.status == "New").scalar() or 0
    total_events = db.query(func.count(CyberEvent.id)).scalar() or 0

    return {
        "total_transactions": total_transactions,
        "threats_detected": threats_detected,
        "high_risk_users": high_risk_users,
        "fraud_cases": fraud_cases,
        "quantum_alerts": quantum_alerts,
        "avg_risk_score": round(avg_risk, 1),
        "ai_confidence": round(avg_confidence, 1),
        "active_alerts": active_alerts,
        "total_cyber_events": total_events,
    }
