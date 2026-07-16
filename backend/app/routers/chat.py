from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import Transaction, Alert
from app.schemas import ChatRequest, ChatResponse
from app.services.ai_service import generate_ai_text, build_chat_prompt

router = APIRouter(prefix="/chat", tags=["AI Assistant"])


def build_context(db: Session, message: str) -> str:
    lower = message.lower()
    context_parts = []

    # Try to detect a user name mentioned in the question
    top_high_risk = (
        db.query(Transaction)
        .order_by(desc(Transaction.risk_score))
        .limit(5)
        .all()
    )
    context_parts.append(
        "Top 5 highest-risk transactions: " +
        "; ".join([f"{t.user} (₹{t.amount:,.0f}, risk {t.risk_score}, {t.threat_category})" for t in top_high_risk])
    )

    if "today" in lower or "how many" in lower or "fraud" in lower:
        fraud_count = db.query(func.count(Transaction.id)).filter(Transaction.status == "Blocked").scalar() or 0
        flagged_count = db.query(func.count(Transaction.id)).filter(Transaction.status == "Flagged").scalar() or 0
        context_parts.append(f"Total blocked (fraud) transactions: {fraud_count}. Flagged transactions: {flagged_count}.")

    if "alert" in lower:
        new_alerts = db.query(func.count(Alert.id)).filter(Alert.status == "New").scalar() or 0
        context_parts.append(f"New/unresolved alerts: {new_alerts}.")

    # Look for a specific user mention (naive match against known users)
    users = [r[0] for r in db.query(Transaction.user).distinct().limit(500).all()]
    mentioned_user = next((u for u in users if u.split()[0].lower() in lower), None)
    if mentioned_user:
        user_txns = (
            db.query(Transaction)
            .filter(Transaction.user == mentioned_user)
            .order_by(desc(Transaction.risk_score))
            .limit(3)
            .all()
        )
        if user_txns:
            context_parts.append(
                f"Transactions for {mentioned_user}: " +
                "; ".join([f"₹{t.amount:,.0f} risk {t.risk_score} ({t.threat_category}) - {t.explanation}" for t in user_txns])
            )

    return "\n".join(context_parts)


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    context = build_context(db, req.message)
    prompt = build_chat_prompt(req.message, context)
    fallback = (
        "Based on current telemetry, here's a summary: " + context[:500]
        if context else
        "I don't have enough context to answer that precisely, but I can help you explore the Threat Monitor, "
        "Analytics, or Risk Analysis pages for more detail."
    )
    reply = generate_ai_text(prompt, fallback)
    return ChatResponse(reply=reply)
