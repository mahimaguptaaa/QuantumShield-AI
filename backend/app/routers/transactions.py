from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional
from app.database import get_db
from app.models import Transaction
from app.schemas import TransactionOut

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("")
def list_transactions(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    threat_level: Optional[str] = None,
    status: Optional[str] = None,
    txn_type: Optional[str] = None,
    sort_by: str = "timestamp",
    order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
):
    q = db.query(Transaction)

    if search:
        like = f"%{search}%"
        q = q.filter(
            or_(
                Transaction.user.ilike(like),
                Transaction.account.ilike(like),
                Transaction.ip_address.ilike(like),
                Transaction.country.ilike(like),
            )
        )
    if threat_level:
        q = q.filter(Transaction.threat_level == threat_level)
    if status:
        q = q.filter(Transaction.status == status)
    if txn_type:
        q = q.filter(Transaction.txn_type == txn_type)

    sort_col = getattr(Transaction, sort_by, Transaction.timestamp)
    q = q.order_by(desc(sort_col) if order == "desc" else asc(sort_col))

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [TransactionOut.model_validate(i) for i in items],
    }


@router.get("/{txn_id}", response_model=TransactionOut)
def get_transaction(txn_id: int, db: Session = Depends(get_db)):
    return db.query(Transaction).filter(Transaction.id == txn_id).first()
