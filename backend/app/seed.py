"""
Seeds the SQLite database with realistic demo data for QuantumShield AI,
then trains the hybrid ML anomaly model on the resulting behavioural
dataset and reports precision/recall against the deliberately injected
attack scenarios.

Run directly: python -m app.seed
"""
import json
import os
import random
import datetime
from faker import Faker
from app.database import Base, engine, SessionLocal
from app.models import CyberEvent, Transaction, Alert, QuantumAsset
from app.services import risk_engine, ml_model
from app.services.ai_service import build_fallback_explanation

fake = Faker("en_IN")
random.seed(42)

# Indian cities used for legitimate/home activity
INDIAN_LOCATIONS = [
    ("India", "Mumbai", 19.0760, 72.8777),
    ("India", "Pune", 18.5204, 73.8567),
    ("India", "Delhi", 28.7041, 77.1025),
    ("India", "Bengaluru", 12.9716, 77.5946),
    ("India", "Hyderabad", 17.3850, 78.4867),
    ("India", "Ahmedabad", 23.0225, 72.5714),
    ("India", "Nagpur", 21.1458, 79.0882),
    ("India", "Jaipur", 26.9124, 75.7873),
    ("India", "Kolkata", 22.5726, 88.3639),
    ("India", "Chennai", 13.0827, 80.2707),
]

# Foreign locations used for VPN / attack-origin scenarios
FOREIGN_LOCATIONS = [
    ("Russia", "Moscow", 55.7558, 37.6173),
    ("Nigeria", "Lagos", 6.5244, 3.3792),
    ("China", "Beijing", 39.9042, 116.4074),
    ("Vietnam", "Hanoi", 21.0278, 105.8342),
    ("Brazil", "Sao Paulo", -23.5505, -46.6333),
]

ALL_LOCATIONS = INDIAN_LOCATIONS + FOREIGN_LOCATIONS

DEVICES = ["iPhone 15 Pro", "Samsung Galaxy S24", "Windows Laptop", "MacBook Pro", "Redmi Note 13", "OnePlus 12", "iPad Air", "Linux Desktop"]
BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Opera"]
OS_LIST = ["Windows 11", "macOS Sonoma", "iOS 17", "Android 14", "Ubuntu 22.04"]

EVENT_TYPES = ["login", "failed_login", "vpn_login", "new_device_login", "password_reset", "mfa_failure", "admin_action"]
TXN_TYPES = ["UPI", "NEFT", "RTGS", "ATM Withdrawal", "Credit Card", "LargeTransfer", "Merchant Payment", "International"]

MODERN_CIPHERS = ["TLS_AES_256_GCM_SHA384", "X25519+Kyber768 (Hybrid PQC)", "TLS_CHACHA20_POLY1305_SHA256"]
LEGACY_CIPHERS = ["RSA-2048", "ECDHE-RSA-2048", "TLS_RSA_WITH_AES_128_CBC_SHA"]

NUM_USERS = 60
NUM_EVENTS = 400
NUM_TRANSACTIONS = 250
NUM_ATTACK_CHAINS = 30

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
METRICS_PATH = os.path.join(BASE_DIR, "ml_artifacts", "metrics.json")


def random_geo(foreign_only=False):
    pool = FOREIGN_LOCATIONS if foreign_only else ALL_LOCATIONS
    return random.choice(pool)


def random_cipher(legacy_bias=0.15):
    return random.choice(LEGACY_CIPHERS) if random.random() < legacy_bias else random.choice(MODERN_CIPHERS)


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    users = [f"{fake.first_name()} {fake.last_name()}" for _ in range(NUM_USERS)]
    accounts = {u: f"ACC{random.randint(100000, 999999)}" for u in users}
    now = datetime.datetime.utcnow()

    # ---------------------------------------------------------------
    # 1. Baseline cyber events (mostly legitimate Indian activity)
    # ---------------------------------------------------------------
    events = []
    for _ in range(NUM_EVENTS):
        user = random.choice(users)
        country, city, lat, lon = random_geo()
        event_type = random.choices(EVENT_TYPES, weights=[40, 12, 10, 10, 8, 8, 4], k=1)[0]
        is_vpn = event_type == "vpn_login" or random.random() < 0.08
        ts = now - datetime.timedelta(minutes=random.randint(0, 60 * 24 * 5))
        events.append(CyberEvent(
            user=user, account=accounts[user], event_type=event_type,
            ip_address=fake.ipv4_public(), device=random.choice(DEVICES),
            browser=random.choice(BROWSERS), os=random.choice(OS_LIST),
            country=country, city=city, lat=lat + random.uniform(-0.2, 0.2),
            lon=lon + random.uniform(-0.2, 0.2), is_vpn=is_vpn,
            session_duration=random.randint(30, 3600),
            cipher_suite=random_cipher(),
            timestamp=ts,
        ))
    db.add_all(events)
    db.commit()

    # ---------------------------------------------------------------
    # 2. Deliberate high-risk attack chains (guarantees a demo-ready
    #    dataset with real positives for both the rule engine and the
    #    ML model to learn from / be evaluated against)
    # ---------------------------------------------------------------
    attack_users = set(random.sample(users, NUM_ATTACK_CHAINS))
    attack_chain_info = {}
    for user in attack_users:
        attack_country, attack_city, a_lat, a_lon = random_geo(foreign_only=True)
        attack_time = now - datetime.timedelta(minutes=random.randint(5, 90))
        chain = []
        for j in range(random.randint(3, 5)):
            chain.append(CyberEvent(
                user=user, account=accounts[user], event_type="failed_login",
                ip_address=fake.ipv4_public(), device="Unknown Device", browser="Chrome",
                os="Windows 11", country=attack_country, city=attack_city,
                lat=a_lat, lon=a_lon, is_vpn=False, session_duration=5,
                cipher_suite=random.choice(LEGACY_CIPHERS),
                timestamp=attack_time - datetime.timedelta(minutes=15 - j),
            ))
        chain.append(CyberEvent(
            user=user, account=accounts[user], event_type="vpn_login",
            ip_address=fake.ipv4_public(), device="Windows Laptop", browser="Chrome",
            os="Windows 11", country=attack_country, city=attack_city,
            lat=a_lat, lon=a_lon, is_vpn=True, session_duration=400,
            cipher_suite=random.choice(LEGACY_CIPHERS),
            timestamp=attack_time - datetime.timedelta(minutes=8),
        ))
        chain.append(CyberEvent(
            user=user, account=accounts[user], event_type="new_device_login",
            ip_address=fake.ipv4_public(), device="Unregistered Device", browser="Chrome",
            os="Android 14", country=attack_country, city=attack_city,
            lat=a_lat, lon=a_lon, is_vpn=True, session_duration=300,
            cipher_suite=random.choice(LEGACY_CIPHERS),
            timestamp=attack_time - datetime.timedelta(minutes=3),
        ))
        if random.random() < 0.5:
            chain.append(CyberEvent(
                user=user, account=accounts[user], event_type="mfa_failure",
                ip_address=fake.ipv4_public(), device="Unregistered Device", browser="Chrome",
                os="Android 14", country=attack_country, city=attack_city,
                lat=a_lat, lon=a_lon, is_vpn=True, session_duration=60,
                cipher_suite=random.choice(LEGACY_CIPHERS),
                timestamp=attack_time - datetime.timedelta(minutes=2),
            ))
        db.add_all(chain)
        attack_chain_info[user] = (attack_time, attack_country)
    db.commit()

    # ---------------------------------------------------------------
    # 3. Create ALL transactions first (attack + random), collecting
    #    rule-score + feature vectors WITHOUT the ML model yet
    #    (two-phase: the model needs the full feature distribution
    #    before it can be trained).
    # ---------------------------------------------------------------
    pending = []  # list of dicts: txn, rule_score, signals, features, is_attack

    for user, (attack_time, attack_country) in attack_chain_info.items():
        txn_type = random.choice(["International", "LargeTransfer", "RTGS"])
        amount = round(random.uniform(200000, 950000), 2)
        txn = Transaction(
            user=user, account=accounts[user], txn_type=txn_type, amount=amount,
            currency="INR", country=attack_country, device="Unregistered Device",
            browser="Chrome", ip_address=fake.ipv4_public(), merchant=None,
            timestamp=attack_time,
        )
        db.add(txn)
        db.flush()
        rule_score, signals, features = risk_engine.analyze_signals(db, txn)
        pending.append({"txn": txn, "rule_score": rule_score, "signals": signals, "features": features, "is_attack": True})

    for i in range(NUM_TRANSACTIONS):
        user = random.choice(users)
        country, city, lat, lon = random_geo()
        txn_type = random.choices(TXN_TYPES, weights=[25, 12, 8, 12, 15, 8, 15, 5], k=1)[0]

        if txn_type == "LargeTransfer":
            amount = round(random.uniform(150000, 900000), 2)
        elif txn_type == "International":
            amount = round(random.uniform(50000, 400000), 2)
        elif txn_type == "RTGS":
            amount = round(random.uniform(200000, 800000), 2)
        elif txn_type == "ATM Withdrawal":
            amount = round(random.uniform(1000, 25000), 2)
        else:
            amount = round(random.uniform(200, 60000), 2)

        ts = now - datetime.timedelta(minutes=random.randint(0, 60 * 24 * 5))
        txn = Transaction(
            user=user, account=accounts[user], txn_type=txn_type, amount=amount,
            currency="INR", country=country, device=random.choice(DEVICES),
            browser=random.choice(BROWSERS), ip_address=fake.ipv4_public(),
            merchant=fake.company() if txn_type == "Merchant Payment" else None,
            timestamp=ts,
        )
        db.add(txn)
        db.flush()
        rule_score, signals, features = risk_engine.analyze_signals(db, txn)
        pending.append({"txn": txn, "rule_score": rule_score, "signals": signals, "features": features, "is_attack": False})

    db.commit()

    # ---------------------------------------------------------------
    # 4. Train the IsolationForest on the full feature distribution
    # ---------------------------------------------------------------
    ml_model.train([p["features"] for p in pending])

    # ---------------------------------------------------------------
    # 5. Second pass: blend rule_score with the now-trained ML score,
    #    finalize each transaction, and create alerts for high risk.
    # ---------------------------------------------------------------
    transactions = []
    alerts = []
    tp = fp = tn = fn = 0

    for p in pending:
        txn = p["txn"]
        rule_score, signals = p["rule_score"], p["signals"]
        ml_score = ml_model.score(p["features"])
        final_score = round(min(0.6 * rule_score + 0.4 * ml_score, 99), 1)
        agreement_bonus = 5 if abs(rule_score - ml_score) < 15 else 0
        confidence = round(min(88 + len(signals) * 1.2 + agreement_bonus, 99), 1)

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

        txn.risk_score = final_score
        txn.confidence = confidence
        txn.threat_category = category
        txn.threat_level = risk_engine.score_to_threat_level(final_score)
        txn.status = risk_engine.score_to_status(final_score)
        txn.explanation = build_fallback_explanation(txn, signals)
        transactions.append(txn)

        flagged = final_score >= 65
        if p["is_attack"] and flagged:
            tp += 1
        elif p["is_attack"] and not flagged:
            fn += 1
        elif not p["is_attack"] and flagged:
            fp += 1
        else:
            tn += 1

        if flagged:
            alerts.append(Alert(
                title=f"{category} detected for {txn.user}",
                description=txn.explanation,
                severity="Critical" if final_score >= 85 else "High",
                status="New", related_user=txn.user, timestamp=txn.timestamp,
            ))

    db.commit()
    db.add_all(alerts)
    db.commit()

    # ---------------------------------------------------------------
    # 6. Quantum security assets (static inventory) + metrics export
    # ---------------------------------------------------------------
    quantum_assets = [
        QuantumAsset(system_name="Core Banking Database (Oracle)", current_encryption="RSA-2048",
                      quantum_risk="High", migration_status="Not Started", recommended_algorithm="CRYSTALS-Kyber",
                      notes="Vulnerable to 'Harvest Now, Decrypt Later' attacks once cryptographically relevant quantum computers exist."),
        QuantumAsset(system_name="Customer Authentication Service", current_encryption="ECC (P-256)",
                      quantum_risk="High", migration_status="In Progress", recommended_algorithm="CRYSTALS-Dilithium",
                      notes="Pilot migration to post-quantum signatures underway for high-value customer accounts."),
        QuantumAsset(system_name="Internal File Storage", current_encryption="AES-256",
                      quantum_risk="Low", migration_status="Completed", recommended_algorithm="AES-256 (Grover-resistant with key size)",
                      notes="Symmetric encryption with 256-bit keys remains largely quantum-resistant."),
        QuantumAsset(system_name="SWIFT Payment Gateway", current_encryption="RSA-3072",
                      quantum_risk="Critical", migration_status="Not Started", recommended_algorithm="CRYSTALS-Kyber + Dilithium Hybrid",
                      notes="Highest priority migration target due to long-term sensitivity of payment data."),
        QuantumAsset(system_name="Mobile Banking App TLS", current_encryption="ECDHE-RSA-2048",
                      quantum_risk="Medium", migration_status="In Progress", recommended_algorithm="Hybrid TLS (X25519 + Kyber)",
                      notes="Hybrid post-quantum TLS rollout in staged deployment across app versions."),
    ]
    db.add_all(quantum_assets)
    db.commit()
    db.close()

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0

    metrics = {
        "true_positives": tp, "false_positives": fp, "true_negatives": tn, "false_negatives": fn,
        "precision": round(precision, 3), "recall": round(recall, 3), "f1_score": round(f1, 3),
        "total_transactions": len(pending), "attack_scenarios": NUM_ATTACK_CHAINS,
        "model": "IsolationForest (n_estimators=200, contamination=0.15) blended 60/40 with rule engine",
    }
    os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Seeded {len(users)} users, {len(events)} cyber events, "
          f"{len(transactions)} transactions, {len(alerts)} alerts, {len(quantum_assets)} quantum assets.")
    print(f"Model performance vs {NUM_ATTACK_CHAINS} known attack scenarios: "
          f"precision={precision:.2f} recall={recall:.2f} f1={f1:.2f}")


if __name__ == "__main__":
    seed()
