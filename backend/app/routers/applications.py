from datetime import datetime, timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models import Application, ApplicationEvent, Department, Notification, AuditLog, Citizen, Document, ConsentRecord, User
from ..schemas import ApplicationCreate, ApplicationOut, ApplicationDetail, StatusUpdate, EventOut, DocumentOut, ConsentOut
from .auth import get_current_user, require_roles

router = APIRouter(prefix="/api/applications", tags=["Applications & Workflow"])

VALID_TRANSITIONS = {
    "Submitted": ["Submitted", "Under Verification", "In Review", "Action Required", "Rejected"],
    "Under Verification": ["Under Verification", "In Review", "Forwarded", "Action Required", "On Hold", "Approved", "Rejected"],
    "In Review": ["In Review", "Forwarded", "Action Required", "On Hold", "Approved", "Rejected"],
    "Forwarded": ["Forwarded", "In Review", "Approved", "Rejected", "On Hold"],
    "Action Required": ["Action Required", "Under Verification", "In Review"],
    "On Hold": ["On Hold", "Under Verification", "In Review", "Forwarded", "Rejected"],
    "Approved": ["Approved", "Completed", "On Hold"],
    "Completed": ["Completed"],  # Terminal state
    "Rejected": ["Rejected", "Under Verification"]  # Can only re-open via formal appeal
}

def serialize_app(app: Application) -> ApplicationOut:
    shared = [x.strip() for x in app.shared_fields.split(",") if x.strip()] if app.shared_fields else []
    return ApplicationOut(
        id=app.id,
        tracking_id=app.tracking_id,
        service_name=app.service_name,
        applicant_name=app.applicant_name,
        applicant_email=app.applicant_email or "citizen@example.gov.in",
        applicant_phone=app.applicant_phone or "+91 90000 00000",
        applicant_address=app.applicant_address or "Plot 42, Sector 5, New Delhi",
        citizen_ref=app.citizen_ref,
        department_id=app.department_id,
        department_name=app.department.name if app.department else "Government Department",
        department_code=app.department.code if app.department else "GOV",
        category=app.category or "General",
        priority=app.priority or "Normal",
        status=app.status,
        stage=app.stage,
        progress=app.progress,
        consent=app.consent,
        shared_fields=shared,
        officer_notes=app.officer_notes or "",
        sla_deadline_days=app.sla_deadline_days or 7,
        sla_risk=app.sla_risk or False,
        created_at=app.created_at,
        updated_at=app.updated_at
    )

@router.get("", response_model=list[ApplicationOut])
def list_applications(
    search: str | None = Query(default=None),
    department_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    sla_risk_only: bool | None = Query(default=None),
    citizen_ref: str | None = Query(default=None),
    limit: int = Query(default=100, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    q = db.query(Application).order_by(Application.created_at.desc())

    # Role-based restriction: Citizen sees only their own applications
    if user.role == "CITIZEN":
        ref = user.citizen_ref or "CIT-DEMO-001"
        q = q.filter(Application.citizen_ref == ref)
    elif citizen_ref:
        q = q.filter(Application.citizen_ref == citizen_ref)

    if department_id:
        q = q.filter(Application.department_id == department_id)
        
    if status and status != "All":
        # Handle case normalization e.g. "In Progress" vs "In Review"
        q = q.filter(Application.status.ilike(status))

    if priority and priority != "All":
        q = q.filter(Application.priority == priority)

    if sla_risk_only:
        q = q.filter(Application.sla_risk == True)

    if search:
        term = f"%{search.strip()}%"
        q = q.filter(
            or_(
                Application.tracking_id.ilike(term),
                Application.service_name.ilike(term),
                Application.applicant_name.ilike(term),
                Application.citizen_ref.ilike(term)
            )
        )

    apps = q.limit(limit).all()
    return [serialize_app(x) for x in apps]

@router.get("/{tracking_id}", response_model=ApplicationDetail)
def get_application(
    tracking_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    app = db.query(Application).filter_by(tracking_id=tracking_id).first()
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{tracking_id}' not found")

    # Citizen privacy check
    if user.role == "CITIZEN" and app.citizen_ref != user.citizen_ref:
        raise HTTPException(status_code=403, detail="Unauthorized to view this application")

    base = serialize_app(app)
    
    # Fetch events
    events = [
        EventOut(
            id=e.id,
            actor=e.actor or "System Gateway",
            stage=e.stage,
            status=e.status,
            message=e.message,
            created_at=e.created_at
        ) for e in sorted(app.events, key=lambda e: e.created_at)
    ]
    
    # Fetch documents
    docs = [
        DocumentOut(
            id=d.id,
            application_id=d.application_id,
            citizen_ref=d.citizen_ref,
            category=d.category,
            file_name=d.file_name,
            file_type=d.file_type,
            file_size_kb=d.file_size_kb,
            verification_status=d.verification_status,
            notes=d.notes,
            uploaded_at=d.uploaded_at
        ) for d in app.documents
    ]
    
    # Fetch consents for this citizen
    consents_raw = db.query(ConsentRecord).filter_by(citizen_ref=app.citizen_ref).all()
    consents = [
        ConsentOut(
            id=c.id,
            citizen_ref=c.citizen_ref,
            tracking_id=c.tracking_id,
            department_code=c.department_code,
            department_name=c.department_name,
            purpose=c.purpose,
            data_requested=[x.strip() for x in c.data_requested.split(",") if x.strip()],
            status=c.status,
            scope=c.scope,
            created_at=c.created_at,
            expires_at=c.expires_at,
            revoked_at=c.revoked_at
        ) for c in consents_raw
    ]

    return ApplicationDetail(
        **base.model_dump(),
        events=events,
        documents=docs,
        consents=consents
    )

@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Explicit consent is required to process cross-department service requests.")

    dept = db.query(Department).filter_by(id=payload.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department connector not found")

    effective_citizen_ref = user.citizen_ref if user.role == "CITIZEN" else payload.citizen_ref

    # Ensure Citizen record exists
    citizen = db.query(Citizen).filter_by(citizen_ref=effective_citizen_ref).first()
    if not citizen:
        citizen = Citizen(
            citizen_ref=effective_citizen_ref,
            name=payload.applicant_name,
            email=payload.applicant_email,
            phone=payload.applicant_phone,
            address=payload.applicant_address,
            consent_given=True
        )
        db.add(citizen)
        db.flush()

    # Generate unified tracking ID
    token = secrets.token_hex(3).upper()
    tracking_id = f"GOV-26129-{token}"

    app = Application(
        tracking_id=tracking_id,
        service_name=payload.service_name,
        applicant_name=payload.applicant_name,
        applicant_email=payload.applicant_email,
        applicant_phone=payload.applicant_phone,
        applicant_address=payload.applicant_address,
        citizen_ref=effective_citizen_ref,
        department_id=payload.department_id,
        category=payload.category,
        priority=payload.priority,
        status="Submitted",
        stage="Submission",
        progress=15,
        consent=True,
        shared_fields=",".join(payload.shared_fields),
        officer_notes=payload.notes or "",
        sla_deadline_days=7,
        sla_risk=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(app)
    db.flush()

    # Create initial workflow event
    db.add(ApplicationEvent(
        application_id=app.id,
        actor="Citizen Portal",
        stage="Submission",
        status="Submitted",
        message=f"Application registered on GovConnect Interoperability Gateway and routed to {dept.name} via {dept.connector_type} connector."
    ))

    # Create purpose-limited consent record
    db.add(ConsentRecord(
        citizen_ref=effective_citizen_ref,
        tracking_id=tracking_id,
        department_code=dept.code,
        department_name=dept.name,
        purpose=f"Verification & fulfillment of {payload.service_name}",
        data_requested=",".join(payload.shared_fields),
        status="ACTIVE",
        scope="Service Interoperability Framework",
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=90)
    ))

    # Add initial notification
    db.add(Notification(
        application_id=app.id,
        citizen_ref=effective_citizen_ref,
        title="Application Submitted Successfully",
        message=f"Unified Tracking ID: {tracking_id} assigned. Processing initiated with {dept.name}.",
        severity="success",
        category="Application"
    ))

    # Attach documents if provided in payload
    for doc_payload in payload.uploaded_documents:
        db.add(Document(
            application_id=app.id,
            citizen_ref=effective_citizen_ref,
            category=doc_payload.category,
            file_name=doc_payload.file_name,
            file_type=doc_payload.file_type,
            file_size_kb=doc_payload.file_size_kb,
            verification_status="Pending Review",
            notes="Uploaded during service application wizard"
        ))

    # Audit log
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="APPLICATION_CREATED",
        category="APPLICATION_CREATED",
        resource=tracking_id,
        department_code=dept.code,
        detail=f"New service request '{payload.service_name}' registered. Fields shared: {', '.join(payload.shared_fields)}. Consent logged.",
        result="SUCCESS"
    ))

    # Increment connector requests count
    dept.total_requests_today += 1
    dept.last_sync = datetime.utcnow()

    db.commit()
    db.refresh(app)
    return serialize_app(app)

@router.patch("/{tracking_id}/status", response_model=ApplicationOut)
def update_status(
    tracking_id: str,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["OFFICER", "DEPARTMENT_ADMIN", "SYSTEM_ADMIN"]))
):
    app = db.query(Application).filter_by(tracking_id=tracking_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Workflow state transition validation
    current_status = app.status
    target_status = payload.status

    allowed = VALID_TRANSITIONS.get(current_status, [target_status])
    if target_status not in allowed and target_status != current_status:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid workflow transition: Cannot move application from '{current_status}' to '{target_status}'."
        )

    if target_status == "Rejected" and len(payload.note.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Rejection requires a documented reason in the officer note."
        )

    app.status = target_status
    app.stage = payload.stage
    app.progress = max(0, min(100, payload.progress))
    if payload.priority:
        app.priority = payload.priority
    if payload.officer_notes:
        app.officer_notes = payload.officer_notes
    app.updated_at = datetime.utcnow()

    # If forwarding to another department
    action_type = "STATUS_CHANGED"
    if payload.forward_to_department_code:
        target_dept = db.query(Department).filter_by(code=payload.forward_to_department_code).first()
        if target_dept:
            app.department_id = target_dept.id
            action_type = "APPLICATION_FORWARDED"
            target_dept.total_requests_today += 1

    # Record event
    db.add(ApplicationEvent(
        application_id=app.id,
        actor=user.full_name,
        stage=payload.stage,
        status=target_status,
        message=payload.note
    ))

    # Send notification to applicant
    notif_severity = "success" if target_status in ("Approved", "Completed") else ("warning" if target_status in ("Action Required", "Rejected") else "info")
    db.add(Notification(
        application_id=app.id,
        citizen_ref=app.citizen_ref,
        title=f"Application Update: {target_status}",
        message=f"{app.tracking_id} is now '{target_status}' at stage '{payload.stage}'. {payload.note}",
        severity=notif_severity,
        category="Application"
    ))

    # Audit log
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action=action_type,
        category=action_type,
        resource=tracking_id,
        department_code=app.department.code if app.department else "GOV",
        detail=f"Workflow transition to '{target_status}' / '{payload.stage}'. Officer note: {payload.note}",
        result="SUCCESS"
    ))

    db.commit()
    db.refresh(app)
    return serialize_app(app)
