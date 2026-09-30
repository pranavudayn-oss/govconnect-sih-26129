from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Notification, User
from ..schemas import NotificationOut
from .auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=list[NotificationOut])
def get_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Notification)
    if user.role == "CITIZEN":
        ref = user.citizen_ref or "CIT-DEMO-001"
        q = q.filter((Notification.citizen_ref == ref) | (Notification.citizen_ref == None))
    
    rows = q.order_by(Notification.created_at.desc()).limit(50).all()
    
    result = []
    for n in rows:
        tracking = n.application.tracking_id if n.application else None
        result.append(
            NotificationOut(
                id=n.id,
                application_id=n.application_id,
                citizen_ref=n.citizen_ref,
                title=n.title,
                message=n.message,
                severity=n.severity,
                category=n.category or "Application",
                read=n.read,
                created_at=n.created_at,
                tracking_id=tracking
            )
        )
    return result

@router.post("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        return {"ok": False}
    n.read = True
    db.commit()
    return {"ok": True}

@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Notification).filter(Notification.read == False)
    if user.role == "CITIZEN":
        ref = user.citizen_ref or "CIT-DEMO-001"
        q = q.filter(Notification.citizen_ref == ref)
    
    updated = q.update({"read": True}, synchronize_session=False)
    db.commit()
    return {"ok": True, "count": updated}
