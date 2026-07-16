"""
QuantumShield AI - Risk Correlation Engine

Implements the core innovation: correlating cybersecurity telemetry with
transactional behaviour to produce ONE explainable risk verdict per
transaction.

Two complementary scoring layers are blended:

  1. Rule engine   - transparent, named signals (failed logins, VPN, geo
                      mismatch, impossible travel, MFA failures, amount
                      anomalies...). Fully explainable, zero training data
                      required, this is what the "Why was this flagged?"
                      panel is built from.
  2. ML anomaly    - a trained IsolationForest (see ml_model.py) that
     model            learns the statistical shape of normal behaviour
                      from the full dataset and flags multivariate outliers
                      the hand-written rules might miss.

final_score = 0.6 * rule_score + 0.4 * ml_score

This hybrid design mirrors real SOC/fraud platforms: rules catch known
patterns with full transparency, an unsupervised model catches novel
combinations rules didn't anticipate.
"""
import math
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import CyberEvent, Transaction
from app.services import ml_model


def get_recent_events(db: Session, user: str, minutes: int = 120):
    since = datetime.utcnow() - timedelta(minutes=minutes)
    return (
        db.query(CyberEvent)
        .filter(CyberEvent.user == user, CyberEvent.timestamp >= since)
        .order_by(desc(CyberEvent.timestamp))
        .all()
    )


def get_user_avg_transaction(db: Session, user: str, exclude_txn_id=None) -> float:
    q = db.query(Transaction).filter(Transaction.user == user)
    if exclude_txn_id is not None:
        q = q.filter(Transaction.id != exclude_txn_id)
    txns = q.all()
    if not txns:
        return 5000.0
    return sum(t.amount for t in txns) / len(txns)


def analyze_signals(db: Session, txn: Transaction):
    """
    Runs the transparent rule engine and builds the numeric feature vector
    fed to the ML anomaly model. Returns (rule_score, signals, features).
    """
    signals = []
    score = 0
    events = get_recent_events(db, txn.user, minutes=120)

    failed_logins = [e for e in events if e.event_type == "failed_login"]
    vpn_events = [e for e in events if e.is_vpn]
    new_device_events = [e for e in events if e.event_type == "new_device_login"]
    password_resets = [e for e in events if e.event_type == "password_reset"]
    mfa_failures = [e for e in events if e.event_type == "mfa_failure"]
    admin_actions = [e for e in events if e.event_type == "admin_action"]
    login_events = [e for e in events if e.event_type in ("login", "new_device_login", "vpn_login")]

    if len(failed_logins) >= 3:
        score += 20
        signals.append(f"{len(failed_logins)} failed login attempts within 2 hours")
    elif len(failed_logins) >= 1:
        score += 8
        signals.append(f"{len(failed_logins)} failed login attempt(s) detected")

    if vpn_events:
        score += 15
        signals.append("Login originated from a VPN / anonymizing exit node")

    if new_device_events:
        score += 15
        signals.append("Transaction initiated from a new, unrecognized device")

    if password_resets:
        score += 12
        signals.append("Password was reset shortly before this transaction")

    if mfa_failures:
        score += 15
        signals.append(f"{len(mfa_failures)} MFA failure(s) recorded")

    if admin_actions:
        score += 10
        signals.append("Unusual admin-level activity detected on the account")

    is_geo_mismatch = 0
    if login_events:
        last_login_country = login_events[0].country
        if last_login_country and txn.country and last_login_country != txn.country:
            score += 18
            is_geo_mismatch = 1
            signals.append(
                f"Geo-mismatch: last login from {last_login_country}, transaction from {txn.country}"
            )

    is_impossible_travel = 0
    if len(login_events) >= 2:
        distinct_countries = {e.country for e in login_events[:3]}
        if len(distinct_countries) >= 2:
            score += 20
            is_impossible_travel = 1
            signals.append("Impossible travel pattern: logins from different countries in a short window")

    hour = txn.timestamp.hour if txn.timestamp else datetime.utcnow().hour
    if 0 <= hour <= 4:
        score += 8
        signals.append("Transaction occurred during unusual off-hours (12AM-4AM)")

    avg_amount = get_user_avg_transaction(db, txn.user, exclude_txn_id=txn.id)
    amount_ratio = (txn.amount / avg_amount) if avg_amount > 0 else 1.0
    if amount_ratio >= 15:
        score += 25
        signals.append(f"Transaction amount is {amount_ratio:.1f}x higher than the customer's average")
    elif amount_ratio >= 5:
        score += 12
        signals.append(f"Transaction amount is {amount_ratio:.1f}x higher than the customer's average")

    if txn.amount >= 200000:
        score += 10
        signals.append("High-value transfer exceeding ₹2,00,000")

    if txn.txn_type == "International":
        score += 10
        signals.append("International transaction type flagged for enhanced scrutiny")

    rule_score = min(score, 99)
    if not signals:
        signals.append("No significant anomalies detected across telemetry and transaction data")

    features = {
        "amount_log": math.log1p(txn.amount),
        "hour": hour,
        "failed_login_count": len(failed_logins),
        "is_vpn": 1 if vpn_events else 0,
        "is_new_device": 1 if new_device_events else 0,
        "is_password_reset": 1 if password_resets else 0,
        "mfa_failure_count": len(mfa_failures),
        "is_admin_action": 1 if admin_actions else 0,
        "is_geo_mismatch": is_geo_mismatch,
        "is_impossible_travel": is_impossible_travel,
        "amount_ratio": min(amount_ratio, 50.0),
        "is_international": 1 if txn.txn_type == "International" else 0,
    }

    return rule_score, signals, features


def correlate_risk(db: Session, txn: Transaction):
    """
    Full hybrid scoring: rule engine + trained ML anomaly model.
    Returns (final_score, confidence, threat_category, signals, ml_score).
    """
    rule_score, signals, features = analyze_signals(db, txn)
    ml_score = ml_model.score(features)

    final_score = round(min(0.6 * rule_score + 0.4 * ml_score, 99), 1)

    agreement_bonus = 5 if abs(rule_score - ml_score) < 15 else 0
    confidence = min(88 + len(signals) * 1.2 + agreement_bonus, 99)

    if final_score >= 85:
        category = "Account Takeover"
    elif final_score >= 65:
        category = "Suspicious Transfer"
    elif final_score >= 40:
        category = "Anomalous Behaviour"
    elif final_score >= 20:
        category = "Minor Deviation"
    else:
        category = "Normal"

    return final_score, round(confidence, 1), category, signals, ml_score


def score_to_threat_level(score: float) -> str:
    if score >= 85:
        return "Critical"
    if score >= 65:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"


def score_to_status(score: float) -> str:
    if score >= 85:
        return "Blocked"
    if score >= 65:
        return "Flagged"
    if score >= 40:
        return "Under Review"
    return "Cleared"
