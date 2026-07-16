# QuantumShield AI

**AI-Powered Cyber Fusion Center for Smart Banking Security**

Built for **Bank of Maharashtra FINSPARK'26 Hackathon**

Problem Statement: *AI-Driven Correlation of Cybersecurity Telemetry & Transactional Behaviour*

---

## Overview

Banks normally analyze cybersecurity telemetry (logins, VPN usage, device/geo anomalies) and
transactional behaviour (UPI, NEFT, RTGS, large transfers) in separate silos. QuantumShield AI
fuses both data planes into a single **AI Correlation Engine** that produces one explainable risk
score per transaction — turning a chain like *failed login → VPN → new device → foreign IP →
₹3,50,000 transfer* into a single, understandable verdict instead of scattered alerts.

## Architecture

```
Cybersecurity Telemetry  ─┐
 (logins, VPN, device,    │
  geo, MFA, sessions)     ├──▶  AI Correlation Engine  ──▶  Risk Score + Confidence + Category
                          │      (risk_engine.py)              │
Transactional Behaviour  ─┘                                     ├──▶ Explainable AI (Gemini/Groq)
 (UPI, NEFT, RTGS, ATM,                                          ├──▶ Threat Timeline / World Map
  large transfers, intl)                                         └──▶ AI Security Assistant (chat)
```

## Features

- **Correlation Engine** — rule-weighted, fully transparent scoring across failed logins, VPN,
  new device, geo-mismatch, impossible travel, MFA failures, odd-hour activity, and amount anomalies
- **Explainable AI** — every flagged transaction has a natural-language "why" (Gemini/Groq, with
  deterministic fallback so the demo never breaks)
- **AI Security Assistant** — chat interface answering questions like "Why was X flagged?" or
  "How many frauds today?"
- **Live Attack Simulator** — one click generates a full account-takeover event chain end-to-end
- **Interactive Threat Timeline**, **World Map**, **Analytics dashboards**, and a dedicated
  **Quantum Security** module covering "Harvest Now, Decrypt Later" risk and post-quantum migration

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Axios |
| Backend    | FastAPI, SQLAlchemy, SQLite |
| AI         | Google Gemini API or Groq API (auto-fallback if no key configured) |
| Data       | Faker-generated realistic banking dataset (280+ transactions, 400+ cyber events) |

## Folder Structure

```
QuantumShield-AI/
├── backend/
│   └── app/
│       ├── main.py            # FastAPI entrypoint
│       ├── config.py          # Env/config loader
│       ├── database.py        # SQLAlchemy session setup
│       ├── models.py          # ORM models
│       ├── schemas.py         # Pydantic schemas
│       ├── seed.py            # Realistic demo data generator
│       ├── routers/           # /dashboard /transactions /events /threats
│       │                      # /analytics /quantum /chat /explanation /simulate
│       └── services/
│           ├── risk_engine.py # Core correlation logic
│           └── ai_service.py  # Gemini/Groq wrapper
├── frontend/
│   └── src/
│       ├── pages/             # Landing, Login, Dashboard, and all sidebar pages
│       ├── layouts/           # Sidebar, Topbar, AppShell
│       ├── components/        # StatCard, RiskBadge, Skeleton
│       └── services/api.js    # Axios API client
├── requirements.txt
├── .env.example
└── README.md
```

## Installation & Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r ../requirements.txt

# copy env file and add your AI key (optional — falls back gracefully without one)
cp ../.env.example ../.env

uvicorn app.main:app --reload --port 8000
```

The database auto-seeds on first run — no manual step needed.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Environment Variables

See `.env.example`:

| Variable | Description |
|---|---|
| `AI_PROVIDER` | `gemini` or `groq` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini credentials |
| `GROQ_API_KEY` / `GROQ_MODEL` | Groq credentials |
| `DATABASE_URL` | SQLite path (default works out of the box) |
| `VITE_API_BASE_URL` | Frontend → backend URL |

## How to Run (Quick Demo)

1. Start backend (`uvicorn app.main:app --port 8000`) — auto-seeds 280+ records
2. Start frontend (`npm run dev`)
3. Log in with the pre-filled demo credentials
4. Click **Generate Live Attack** on the dashboard to watch the correlation engine detect a
   simulated account-takeover chain in real time


## Future Scope

- Replace rule-weighted scoring with a trained ML/graph-based anomaly model
- Real-time streaming ingestion (Kafka) instead of polling
- Integration with actual core banking and SIEM systems
- Multi-tenant support for cross-bank deployment
- Hardware security module (HSM) integration for post-quantum key migration

---

*This is a hackathon prototype. All data is simulated for demonstration purposes.*
