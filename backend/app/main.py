import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.config import CORS_ORIGINS
from app.routers import dashboard, transactions, events, threats, analytics, quantum, chat, explanation, simulate

app = FastAPI(
    title="QuantumShield AI",
    description="AI-Powered Cyber Fusion Center for Smart Banking Security — Bank of Maharashtra FINSPARK'26",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Auto-seed if the database is empty (first run)
    from app.database import SessionLocal
    from app.models import Transaction
    db = SessionLocal()
    try:
        count = db.query(Transaction).count()
        if count == 0:
            from app.seed import seed
            seed()
    finally:
        db.close()


app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(events.router)
app.include_router(threats.router)
app.include_router(analytics.router)
app.include_router(quantum.router)
app.include_router(chat.router)
app.include_router(explanation.router)
app.include_router(simulate.router)


@app.get("/")
def root():
    return {
        "product": "QuantumShield AI",
        "tagline": "AI-Powered Cyber Fusion Center for Smart Banking Security",
        "status": "online",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
