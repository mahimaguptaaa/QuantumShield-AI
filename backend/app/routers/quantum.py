from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app.models import QuantumAsset, CyberEvent
from app.schemas import QuantumAssetOut

router = APIRouter(prefix="/quantum", tags=["Quantum Security"])

LEGACY_CIPHERS = {"RSA-2048", "ECDHE-RSA-2048", "TLS_RSA_WITH_AES_128_CBC_SHA"}


@router.get("")
def get_quantum_assets(db: Session = Depends(get_db)):
    assets = db.query(QuantumAsset).all()
    return [QuantumAssetOut.model_validate(a) for a in assets]


@router.get("/live-detections")
def live_quantum_detections(db: Session = Depends(get_db)):
    """
    Scans recent cyber telemetry for sessions still using legacy,
    quantum-vulnerable cipher suites (RSA/ECC) — these are the sessions
    at real risk of 'Harvest Now, Decrypt Later' interception today.
    """
    since = datetime.utcnow() - timedelta(hours=48)
    legacy_events = (
        db.query(CyberEvent)
        .filter(CyberEvent.timestamp >= since, CyberEvent.cipher_suite.in_(LEGACY_CIPHERS))
        .order_by(desc(CyberEvent.timestamp))
        .limit(50)
        .all()
    )
    total_recent = db.query(func.count(CyberEvent.id)).filter(CyberEvent.timestamp >= since).scalar() or 1
    legacy_count = db.query(func.count(CyberEvent.id)).filter(
        CyberEvent.timestamp >= since, CyberEvent.cipher_suite.in_(LEGACY_CIPHERS)
    ).scalar() or 0

    affected_users = sorted({e.user for e in legacy_events})

    return {
        "legacy_session_count": legacy_count,
        "total_sessions_scanned": total_recent,
        "harvestable_now_pct": round((legacy_count / total_recent) * 100, 1),
        "affected_users": affected_users[:15],
        "sample_events": [
            {
                "user": e.user, "cipher_suite": e.cipher_suite, "country": e.country,
                "device": e.device, "timestamp": e.timestamp,
            }
            for e in legacy_events[:15]
        ],
    }


@router.get("/education")
def quantum_education():
    return {
        "harvest_now_decrypt_later": (
            "Harvest Now, Decrypt Later (HNDL) is a strategy where adversaries intercept and store "
            "encrypted data today, waiting for future quantum computers powerful enough to break "
            "current encryption (like RSA and ECC). Even if the data is unreadable now, it can be "
            "decrypted retroactively once cryptographically-relevant quantum computers exist — "
            "making long-lived sensitive data (financial records, SWIFT transactions, customer PII) "
            "a target today, not just in the future."
        ),
        "post_quantum_algorithms": [
            {"name": "CRYSTALS-Kyber", "type": "Key Encapsulation (encryption)", "status": "NIST Standardized (ML-KEM)"},
            {"name": "CRYSTALS-Dilithium", "type": "Digital Signatures", "status": "NIST Standardized (ML-DSA)"},
            {"name": "SPHINCS+", "type": "Digital Signatures (hash-based)", "status": "NIST Standardized (SLH-DSA)"},
        ],
        "recommendation": (
            "Banks should begin a crypto-agility assessment now, prioritizing migration of long-lived "
            "sensitive data flows (SWIFT, core banking, customer authentication) to hybrid classical + "
            "post-quantum encryption schemes."
        ),
    }
