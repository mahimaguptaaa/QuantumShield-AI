from pydantic import BaseModel
from typing import Optional, List
import datetime


class CyberEventOut(BaseModel):
    id: int
    user: str
    account: str
    event_type: str
    ip_address: str
    device: str
    browser: str
    os: str
    country: str
    city: str
    lat: float
    lon: float
    is_vpn: bool
    session_duration: int
    cipher_suite: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True


class TransactionOut(BaseModel):
    id: int
    user: str
    account: str
    txn_type: str
    amount: float
    currency: str
    country: str
    device: str
    browser: str
    ip_address: str
    merchant: Optional[str]
    risk_score: float
    confidence: float
    threat_level: str
    threat_category: str
    status: str
    explanation: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    related_user: Optional[str]
    timestamp: datetime.datetime

    class Config:
        from_attributes = True


class QuantumAssetOut(BaseModel):
    id: int
    system_name: str
    current_encryption: str
    quantum_risk: str
    migration_status: str
    recommended_algorithm: str
    notes: str

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class ExplanationRequest(BaseModel):
    transaction_id: int


class SimulateResponse(BaseModel):
    message: str
    transaction: TransactionOut
    events: List[CyberEventOut]
    alert: AlertOut
