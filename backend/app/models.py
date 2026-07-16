from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.database import Base
import datetime


class CyberEvent(Base):
    __tablename__ = "cyber_events"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, index=True)
    account = Column(String)
    event_type = Column(String)  # login, failed_login, vpn_login, password_reset, mfa_failure, admin_action
    ip_address = Column(String)
    device = Column(String)
    browser = Column(String)
    os = Column(String)
    country = Column(String)
    city = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    is_vpn = Column(Boolean, default=False)
    session_duration = Column(Integer, default=0)
    cipher_suite = Column(String, default="TLS_AES_256_GCM_SHA384")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, index=True)
    account = Column(String)
    txn_type = Column(String)  # UPI, NEFT, RTGS, ATM, CreditCard, LargeTransfer, Merchant, International
    amount = Column(Float)
    currency = Column(String, default="INR")
    country = Column(String)
    device = Column(String)
    browser = Column(String)
    ip_address = Column(String)
    merchant = Column(String, nullable=True)
    risk_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    threat_level = Column(String, default="Low")  # Low, Medium, High, Critical
    threat_category = Column(String, default="Normal")
    status = Column(String, default="Cleared")  # Cleared, Flagged, Blocked, Under Review
    explanation = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    severity = Column(String, default="Medium")  # Low, Medium, High, Critical
    status = Column(String, default="New")  # New, Acknowledged, Resolved, Dismissed
    related_user = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class QuantumAsset(Base):
    __tablename__ = "quantum_assets"

    id = Column(Integer, primary_key=True, index=True)
    system_name = Column(String)
    current_encryption = Column(String)
    quantum_risk = Column(String)  # Low, Medium, High, Critical
    migration_status = Column(String)  # Not Started, In Progress, Completed
    recommended_algorithm = Column(String)
    notes = Column(Text, default="")
