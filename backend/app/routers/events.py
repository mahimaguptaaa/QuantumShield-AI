from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app.database import get_db
from app.models import CyberEvent
from app.schemas import CyberEventOut

router = APIRouter(prefix="/events", tags=["Cyber Events"])


@router.get("")
def list_events(
    db: Session = Depends(get_db),
    user: Optional[str] = None,
    event_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    q = db.query(CyberEvent)
    if user:
        q = q.filter(CyberEvent.user.ilike(f"%{user}%"))
    if event_type:
        q = q.filter(CyberEvent.event_type == event_type)
    q = q.order_by(desc(CyberEvent.timestamp))

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [CyberEventOut.model_validate(i) for i in items],
    }


@router.get("/timeline/{user}")
def user_timeline(user: str, db: Session = Depends(get_db)):
    """Combined chronological timeline of events for the interactive Threat Timeline page."""
    events = (
        db.query(CyberEvent)
        .filter(CyberEvent.user.ilike(f"%{user}%"))
        .order_by(CyberEvent.timestamp)
        .all()
    )
    return [CyberEventOut.model_validate(e) for e in events]


@router.get("/map/world")
def world_map_events(db: Session = Depends(get_db)):
    """Aggregated event geo-data for the World Map page (attack origins / risk heatmap)."""
    events = db.query(CyberEvent).order_by(desc(CyberEvent.timestamp)).limit(300).all()
    return [
        {
            "user": e.user,
            "country": e.country,
            "city": e.city,
            "lat": e.lat,
            "lon": e.lon,
            "is_vpn": e.is_vpn,
            "event_type": e.event_type,
            "timestamp": e.timestamp,
        }
        for e in events
    ]
