import random
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from faker import Faker
from app.database import get_db
from app.models import CyberEvent, Transaction, Alert
from app.services.risk_engine import correlate_risk, score_to_threat_level, score_to_status
from app.services.ai_service import generate_ai_text, build_explanation_prompt, build_fallback_explanation
from app.schemas import SimulateResponse, TransactionOut, CyberEventOut, AlertOut

router = APIRouter(prefix="/simulate", tags=["Attack Simulator"])
fake = Faker("en_IN")

ATTACK_LOCATIONS = [
    ("Russia", "Moscow", 55.7558, 37.6173),
    ("Nigeria", "Lagos", 6.5244, 3.3792),
    ("China", "Beijing", 39.9042, 116.4074),
    ("Vietnam", "Hanoi", 21.0278, 105.8342),
]
LEGACY_CIPHERS = ["RSA-2048", "ECDHE-RSA-2048", "TLS_RSA_WITH_AES_128_CBC_SHA"]


@router.post("", response_model=SimulateResponse)
def generate_live_attack(db: Session = Depends(get_db)):
    """
    Simulates a realistic account-takeover attack chain:
    multiple failed logins -> VPN login -> geo change -> large transaction.
    Returns the generated events, resulting transaction, and alert for live
    dashboard animation.
    """
    user = f"{fake.first_name()} {fake.last_name()}"
    account = f"ACC{random.randint(100000,999999)}"
    country, city, lat, lon = random.choice(ATTACK_LOCATIONS)
    now = datetime.datetime.utcnow()

    generated_events = []

    for i in range(random.randint(3, 5)):
        ev = CyberEvent(
            user=user, account=account, event_type="failed_login",
            ip_address=fake.ipv4_public(), device="Unknown Device", browser="Chrome",
            os="Windows 11", country=country, city=city, lat=lat, lon=lon,
            is_vpn=False, session_duration=5, cipher_suite=random.choice(LEGACY_CIPHERS),
            timestamp=now - datetime.timedelta(minutes=10 - i),
        )
        db.add(ev)
        generated_events.append(ev)

    vpn_ev = CyberEvent(
        user=user, account=account, event_type="vpn_login",
        ip_address=fake.ipv4_public(), device="Windows Laptop", browser="Chrome",
        os="Windows 11", country=country, city=city, lat=lat, lon=lon,
        is_vpn=True, session_duration=600, cipher_suite=random.choice(LEGACY_CIPHERS),
        timestamp=now - datetime.timedelta(minutes=5),
    )
    db.add(vpn_ev)
    generated_events.append(vpn_ev)

    new_device_ev = CyberEvent(
        user=user, account=account, event_type="new_device_login",
        ip_address=fake.ipv4_public(), device="Unregistered Android Device", browser="Chrome",
        os="Android 14", country=country, city=city, lat=lat, lon=lon,
        is_vpn=True, session_duration=300, cipher_suite=random.choice(LEGACY_CIPHERS),
        timestamp=now - datetime.timedelta(minutes=3),
    )
    db.add(new_device_ev)
    generated_events.append(new_device_ev)

    db.commit()

    amount = round(random.uniform(250000, 950000), 2)
    txn = Transaction(
        user=user, account=account, txn_type="International",
        amount=amount, currency="INR", country=country,
        device="Unregistered Android Device", browser="Chrome",
        ip_address=fake.ipv4_public(), merchant=None,
        timestamp=now,
    )
    db.add(txn)
    db.flush()

    score, confidence, category, signals, ml_score = correlate_risk(db, txn)
    txn.risk_score = max(score, 88)  # ensure simulator always produces a high-severity demo result
    txn.confidence = max(confidence, 95)
    txn.threat_category = "Account Takeover"
    txn.threat_level = score_to_threat_level(txn.risk_score)
    txn.status = score_to_status(txn.risk_score)

    fallback = build_fallback_explanation(txn, signals)
    prompt = build_explanation_prompt(txn, signals)
    txn.explanation = generate_ai_text(prompt, fallback)
    db.commit()
    db.refresh(txn)

    alert = Alert(
        title=f"Account Takeover Attack Simulated for {user}",
        description=txn.explanation,
        severity="Critical",
        status="New",
        related_user=user,
        timestamp=now,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    return SimulateResponse(
        message="Live attack simulation complete. AI correlation engine detected an Account Takeover pattern.",
        transaction=TransactionOut.model_validate(txn),
        events=[CyberEventOut.model_validate(e) for e in generated_events],
        alert=AlertOut.model_validate(alert),
    )
