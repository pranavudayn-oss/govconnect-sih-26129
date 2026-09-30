from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from ..database import get_db
from ..models import Application, Department, AuditLog, Citizen, Notification, User, ServiceCatalog
from .auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Analytics"])

@router.get("/summary")
def summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    total = db.query(Application).count()
    submitted = db.query(Application).filter(Application.status == "Submitted").count()
    under_verification = db.query(Application).filter(Application.status == "Under Verification").count()
    in_review = db.query(Application).filter(or_(Application.status == "In Review", Application.status == "In Progress")).count()
    action_required = db.query(Application).filter(Application.status == "Action Required").count()
    completed = db.query(Application).filter(Application.status == "Completed").count()
    rejected = db.query(Application).filter(Application.status == "Rejected").count()
    on_hold = db.query(Application).filter(Application.status == "On Hold").count()
    sla_risk_count = db.query(Application).filter(Application.sla_risk == True).count()
    
    # Department breakdown
    dept_stats = (
        db.query(Department.name, Department.code, func.count(Application.id))
        .outerjoin(Application, Department.id == Application.department_id)
        .group_by(Department.id)
        .all()
    )
    
    # Citizen specific stats if user is citizen
    citizen_total = 0
    citizen_active = 0
    citizen_completed = 0
    citizen_action_req = 0
    if user.role == "CITIZEN":
        ref = user.citizen_ref or "CIT-DEMO-001"
        citizen_total = db.query(Application).filter(Application.citizen_ref == ref).count()
        citizen_active = db.query(Application).filter(Application.citizen_ref == ref, Application.status.notin_(["Completed", "Rejected"])).count()
        citizen_completed = db.query(Application).filter(Application.citizen_ref == ref, Application.status == "Completed").count()
        citizen_action_req = db.query(Application).filter(Application.citizen_ref == ref, Application.status == "Action Required").count()
        unread_notifs = db.query(Notification).filter(Notification.citizen_ref == ref, Notification.read == False).count()
    else:
        unread_notifs = db.query(Notification).filter(Notification.read == False).count()

    total_requests = db.query(func.sum(Department.total_requests_today)).scalar() or 4250
    total_citizens = db.query(Citizen).count()
    connected_depts = db.query(Department).filter(Department.status == "Connected").count()
    total_depts = db.query(Department).count()
    security_events = db.query(AuditLog).filter(AuditLog.category == "SECURITY_EVENT").count()

    return {
        # Overall KPIs
        "total_applications": total,
        "submitted": submitted,
        "under_verification": under_verification,
        "in_progress": in_review + under_verification,
        "in_review": in_review,
        "action_required": citizen_action_req if user.role == "CITIZEN" else action_required,
        "completed": completed,
        "rejected": rejected,
        "on_hold": on_hold,
        "sla_risk": sla_risk_count,
        "connected_departments": connected_depts,
        "total_departments": total_depts,
        "audit_events": db.query(AuditLog).count(),
        "unread_notifications": unread_notifs,
        
        # Citizen specific KPIs
        "citizen_summary": {
            "total": citizen_total,
            "active": citizen_active,
            "completed": citizen_completed,
            "action_required": citizen_action_req,
            "unread_notifications": unread_notifs
        },

        # System Admin / Integration KPIs
        "platform_metrics": {
            "total_citizens": max(total_citizens, 1),
            "total_applications": total,
            "active_departments": connected_depts,
            "total_requests_today": total_requests,
            "successful_requests": int(total_requests * 0.992),
            "gateway_success_rate": 99.2,
            "average_latency_ms": 118,
            "security_events": security_events
        },

        # Department distribution
        "department_distribution": [
            {"name": name, "code": code, "count": count} for name, code, count in dept_stats
        ]
    }

@router.get("/search")
def global_search(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    term = f"%{q.strip()}%"
    
    # 1. Search Applications
    apps = (
        db.query(Application)
        .filter(
            or_(
                Application.tracking_id.ilike(term),
                Application.service_name.ilike(term),
                Application.applicant_name.ilike(term),
                Application.citizen_ref.ilike(term)
            )
        )
        .limit(6)
        .all()
    )
    
    # 2. Search Services
    services = (
        db.query(ServiceCatalog)
        .filter(
            or_(
                ServiceCatalog.name.ilike(term),
                ServiceCatalog.category.ilike(term),
                ServiceCatalog.description.ilike(term)
            )
        )
        .limit(5)
        .all()
    )

    # 3. Search Departments
    departments = (
        db.query(Department)
        .filter(
            or_(
                Department.name.ilike(term),
                Department.code.ilike(term),
                Department.category.ilike(term)
            )
        )
        .limit(4)
        .all()
    )

    return {
        "query": q,
        "applications": [
            {
                "tracking_id": a.tracking_id,
                "service_name": a.service_name,
                "applicant_name": a.applicant_name,
                "status": a.status,
                "department_name": a.department.name if a.department else ""
            } for a in apps
        ],
        "services": [
            {
                "id": s.id,
                "name": s.name,
                "category": s.category,
                "department_name": s.department.name if s.department else ""
            } for s in services
        ],
        "departments": [
            {
                "id": d.id,
                "name": d.name,
                "code": d.code,
                "status": d.status,
                "connector_type": d.connector_type
            } for d in departments
        ]
    }
