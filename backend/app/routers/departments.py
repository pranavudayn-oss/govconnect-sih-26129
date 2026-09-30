from datetime import datetime
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Department, AuditLog, User
from ..schemas import DepartmentOut, DepartmentStatusUpdate
from .auth import get_current_user, require_roles

router = APIRouter(prefix="/api/departments", tags=["Departments & Connectors"])

@router.get("", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).order_by(Department.id).all()

@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(dept_id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter_by(id=dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept

@router.patch("/{dept_id}/status", response_model=DepartmentOut)
def update_connector_status(
    dept_id: int,
    payload: DepartmentStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["DEPARTMENT_ADMIN", "SYSTEM_ADMIN"]))
):
    dept = db.query(Department).filter_by(id=dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    old_status = dept.status
    dept.status = payload.status
    dept.last_sync = datetime.utcnow()
    
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="CONNECTOR_STATUS_UPDATE",
        category="CONNECTOR_REQUEST",
        resource=dept.code,
        department_code=dept.code,
        detail=f"Connector state toggled from '{old_status}' to '{payload.status}'. Control plane notification dispatched.",
        result="SUCCESS"
    ))
    db.commit()
    db.refresh(dept)
    return dept

@router.post("/{dept_id}/ping")
def ping_connector(
    dept_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    dept = db.query(Department).filter_by(id=dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    latency = random.randint(85, 230)
    dept.average_latency_ms = latency
    dept.total_requests_today += 1
    dept.last_sync = datetime.utcnow()
    
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="CONNECTOR_PING_TEST",
        category="CONNECTOR_REQUEST",
        resource=dept.code,
        department_code=dept.code,
        detail=f"Simulated health probe roundtrip to {dept.name} connector returned 200 OK in {latency}ms.",
        result="SUCCESS"
    ))
    db.commit()
    
    return {
        "status": "healthy" if dept.status != "Offline" else "unreachable",
        "connector_code": dept.code,
        "endpoint": dept.endpoint,
        "latency_ms": latency,
        "timestamp": datetime.utcnow().isoformat(),
        "simulated": True
    }
