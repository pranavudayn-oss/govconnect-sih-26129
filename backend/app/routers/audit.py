from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog
from ..schemas import AuditOut

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=list[AuditOut])
def get_audit_trail(
    category: str | None = Query(default=None),
    role: str | None = Query(default=None),
    department_code: str | None = Query(default=None),
    actor: str | None = Query(default=None),
    result: str | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=100, le=300),
    db: Session = Depends(get_db)
):
    q = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    
    if category and category != "All":
        q = q.filter(AuditLog.category == category)
    if role and role != "All":
        q = q.filter(AuditLog.role == role)
    if department_code and department_code != "All":
        q = q.filter(AuditLog.department_code == department_code)
    if actor:
        q = q.filter(AuditLog.actor.ilike(f"%{actor}%"))
    if result and result != "All":
        q = q.filter(AuditLog.result == result)
    if search:
        term = f"%{search}%"
        q = q.filter(
            (AuditLog.action.ilike(term)) |
            (AuditLog.resource.ilike(term)) |
            (AuditLog.detail.ilike(term)) |
            (AuditLog.actor.ilike(term))
        )
        
    return q.limit(limit).all()

@router.get("/categories")
def get_audit_categories():
    return [
        "LOGIN",
        "APPLICATION_CREATED",
        "DOCUMENT_UPLOADED",
        "CONSENT_GRANTED",
        "CONSENT_REVOKED",
        "STATUS_CHANGED",
        "APPLICATION_FORWARDED",
        "APPLICATION_APPROVED",
        "APPLICATION_REJECTED",
        "CONNECTOR_REQUEST",
        "SECURITY_EVENT"
    ]

@router.get("/export")
def export_audit_csv(db: Session = Depends(get_db)):
    """Exports latest audit records in CSV format for demonstration of compliance export."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
    
    header = "ID,Timestamp,Actor,Role,Action,Category,Department,Resource,Result,Detail\n"
    rows = []
    for l in logs:
        clean_detail = l.detail.replace(",", ";").replace("\n", " ")
        rows.append(f"{l.id},{l.created_at.isoformat()},{l.actor},{l.role},{l.action},{l.category},{l.department_code or ''},{l.resource},{l.result},{clean_detail}")
    
    csv_content = header + "\n".join(rows)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=govconnect_audit_trail.csv"}
    )
