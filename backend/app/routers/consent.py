from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ConsentRecord, AuditLog, User, Application, Notification
from ..schemas import ConsentOut, ConsentCreate
from .auth import get_current_user

router = APIRouter(prefix="/api/consent", tags=["Consent Management Center"])

def serialize_consent(c: ConsentRecord) -> ConsentOut:
    fields = [x.strip() for x in c.data_requested.split(",") if x.strip()]
    return ConsentOut(
        id=c.id,
        citizen_ref=c.citizen_ref,
        tracking_id=c.tracking_id,
        department_code=c.department_code,
        department_name=c.department_name,
        purpose=c.purpose,
        data_requested=fields,
        status=c.status,
        scope=c.scope,
        created_at=c.created_at,
        expires_at=c.expires_at,
        revoked_at=c.revoked_at
    )

@router.get("", response_model=list[ConsentOut])
def list_consents(
    citizen_ref: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    q = db.query(ConsentRecord)
    
    if user.role == "CITIZEN":
        ref = user.citizen_ref or "CIT-DEMO-001"
        q = q.filter(ConsentRecord.citizen_ref == ref)
    elif citizen_ref:
        q = q.filter(ConsentRecord.citizen_ref == citizen_ref)
        
    if status:
        q = q.filter(ConsentRecord.status == status.upper())
        
    consents = q.order_by(ConsentRecord.created_at.desc()).all()
    return [serialize_consent(c) for c in consents]

@router.post("", response_model=ConsentOut, status_code=201)
def grant_consent(
    payload: ConsentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    effective_ref = user.citizen_ref if user.role == "CITIZEN" else payload.citizen_ref
    
    consent = ConsentRecord(
        citizen_ref=effective_ref,
        tracking_id=payload.tracking_id,
        department_code=payload.department_code,
        department_name=payload.department_name,
        purpose=payload.purpose,
        data_requested=",".join(payload.data_requested),
        status="ACTIVE",
        scope=payload.scope,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=90)
    )
    db.add(consent)
    
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="CONSENT_GRANTED",
        category="CONSENT_GRANTED",
        resource=payload.department_code,
        department_code=payload.department_code,
        detail=f"Purpose-limited consent granted to {payload.department_name} for '{payload.purpose}'. Fields: {', '.join(payload.data_requested)}",
        result="SUCCESS"
    ))
    db.commit()
    db.refresh(consent)
    return serialize_consent(consent)

@router.post("/{consent_id}/revoke", response_model=ConsentOut)
def revoke_consent(
    consent_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    consent = db.query(ConsentRecord).filter_by(id=consent_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent record not found")
        
    if user.role == "CITIZEN" and consent.citizen_ref != user.citizen_ref:
        raise HTTPException(status_code=403, detail="Cannot revoke consent of another citizen")
        
    consent.status = "REVOKED"
    consent.revoked_at = datetime.utcnow()
    
    # Notify if associated application exists
    if consent.tracking_id:
        app = db.query(Application).filter_by(tracking_id=consent.tracking_id).first()
        if app:
            db.add(Notification(
                application_id=app.id,
                citizen_ref=consent.citizen_ref,
                title="Consent Revocation Alert",
                message=f"Consent for {consent.department_name} on application {consent.tracking_id} was revoked. Cross-department data transfers paused.",
                severity="warning",
                category="Consent"
            ))

    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="CONSENT_REVOKED",
        category="CONSENT_REVOKED",
        resource=consent.department_code,
        department_code=consent.department_code,
        detail=f"Citizen revoked data-sharing consent for {consent.department_name}. Purpose: {consent.purpose}",
        result="SUCCESS"
    ))
    db.commit()
    db.refresh(consent)
    return serialize_consent(consent)
