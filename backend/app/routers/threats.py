from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app.database import get_db
from app.models import Transaction, Alert
from app.schemas import TransactionOut, AlertOut

router = APIRouter(prefix="/threats", tags=["Threats"])


@router.get("/high-risk")
def high_risk_transactions(db: Session = Depends(get_db), limit: int = 20):
    items = (
        db.query(Transaction)
        .filter(Transaction.risk_score >= 65)
        .order_by(desc(Transaction.risk_score))
        .limit(limit)
        .all()
    )
    return [TransactionOut.model_validate(i) for i in items]


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db), status: Optional[str] = None):
    q = db.query(Alert)
    if status:
        q = q.filter(Alert.status == status)
    items = q.order_by(desc(Alert.timestamp)).limit(100).all()
    return [AlertOut.model_validate(i) for i in items]


@router.post("/alerts/{alert_id}/update")
def update_alert(alert_id: int, status: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"error": "Alert not found"}
    alert.status = status
    db.commit()
    return {"success": True, "alert_id": alert_id, "status": status}
