from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction
from app.schemas import ExplanationRequest
from app.services.risk_engine import correlate_risk
from app.services.ai_service import generate_ai_text, build_explanation_prompt, build_fallback_explanation

router = APIRouter(prefix="/explanation", tags=["Explainable AI"])


@router.post("")
def explain_transaction(req: ExplanationRequest, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == req.transaction_id).first()
    if not txn:
        return {"error": "Transaction not found"}

    _, _, _, signals, ml_score = correlate_risk(db, txn)
    fallback = build_fallback_explanation(txn, signals)
    prompt = build_explanation_prompt(txn, signals)
    explanation = generate_ai_text(prompt, fallback)

    return {
        "transaction_id": txn.id,
        "risk_score": txn.risk_score,
        "ml_anomaly_score": ml_score,
        "threat_category": txn.threat_category,
        "signals": signals,
        "explanation": explanation,
    }


@router.get("/{txn_id}")
def get_explanation(txn_id: int, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        return {"error": "Transaction not found"}
    _, _, _, signals, ml_score = correlate_risk(db, txn)
    return {
        "transaction_id": txn.id,
        "risk_score": txn.risk_score,
        "ml_anomaly_score": ml_score,
        "threat_category": txn.threat_category,
        "signals": signals,
        "explanation": txn.explanation,
    }
