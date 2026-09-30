import os
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import AuditLog, User
from ..schemas import AuditOut

router = APIRouter(prefix="/api/security", tags=["Security & Trust Center"])

@router.get("/overview")
def security_overview(db: Session = Depends(get_db)):
    """Provides security configuration status, controls, and recent security events."""
    recent_events = (
        db.query(AuditLog)
        .filter(AuditLog.category == "SECURITY_EVENT")
        .order_by(AuditLog.created_at.desc())
        .limit(10)
        .all()
    )

    cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    
    return {
        "security_posture": "Active / Hardened Prototype",
        "compliance_alignment": [
            "Digital Personal Data Protection (DPDP) Act 2023 - Consent Architecture",
            "National Data Governance Framework Policy (NDGFP) - Federated Interoperability",
            "API Setu / Open API Guidelines for Government of India"
        ],
        "active_controls": [
            {
                "name": "Role-Based Access Control (RBAC)",
                "status": "ENFORCED",
                "details": "CITIZEN, OFFICER, DEPARTMENT_ADMIN, SYSTEM_ADMIN with route-level dependencies."
            },
            {
                "name": "Consent-First Data Minimization",
                "status": "ENFORCED",
                "details": "Purpose-limited data fields; revocable citizen consent records tracked in audit store."
            },
            {
                "name": "Append-Only Audit Logging",
                "status": "ACTIVE",
                "details": "Every transaction, transition, and connector request recorded with actor and timestamp."
            },
            {
                "name": "Input Validation & Type Safety",
                "status": "ENFORCED",
                "details": "Pydantic v2 validation on all incoming payloads; sanitization on string inputs."
            },
            {
                "name": "File Upload Protection",
                "status": "ACTIVE",
                "details": "MIME type verification, extension whitelist (.pdf, .png, .jpg, .jpeg), 5MB size limit."
            },
            {
                "name": "CORS Policy",
                "status": "CONFIGURED",
                "details": f"Strict origin enforcement configured via environment ({cors_env})."
            },
            {
                "name": "Database Constraints & Foreign Keys",
                "status": "ENFORCED",
                "details": "Unique constraints on tracking IDs and citizen refs; cascading relationship boundaries."
            },
            {
                "name": "Gateway Rate Limiting (Simulated)",
                "status": "MONITORED",
                "details": "120 requests/minute per client IP threshold; throttling metrics emitted to dashboard."
            }
        ],
        "recent_security_events": [
            AuditOut.model_validate(e) for e in recent_events
        ]
    }

@router.post("/test-event")
def trigger_security_check(action: str = "POLICY_VALIDATION", db: Session = Depends(get_db)):
    """Simulates a security validation check for live demonstration."""
    log = AuditLog(
        actor="Security Gateway Engine",
        role="SYSTEM",
        action=f"SECURITY_PROBE_{action.upper()}",
        category="SECURITY_EVENT",
        resource="gateway_waf",
        department_code="GATEWAY",
        detail="Routine cryptographic token integrity and DPDP consent validation check completed.",
        result="SUCCESS"
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"status": "validated", "audit_id": log.id, "timestamp": datetime.utcnow().isoformat()}
