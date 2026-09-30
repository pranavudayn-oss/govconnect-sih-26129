import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ServiceCatalog, Department
from ..schemas import ServiceOut

router = APIRouter(prefix="/api/services", tags=["Government Services Catalog"])

def serialize_service(s: ServiceCatalog) -> ServiceOut:
    req_docs = [x.strip() for x in s.required_documents.split(",") if x.strip()] if s.required_documents else []
    stages = [x.strip() for x in s.workflow_stages.split(",") if x.strip()] if s.workflow_stages else []
    
    return ServiceOut(
        id=s.id,
        code=s.code,
        name=s.name,
        department_id=s.department_id,
        department_name=s.department.name if s.department else None,
        department_code=s.department.code if s.department else None,
        category=s.category,
        description=s.description,
        eligibility=s.eligibility,
        required_documents=req_docs,
        estimated_processing_days=s.estimated_processing_days,
        digital_availability=s.digital_availability,
        fee=s.fee,
        workflow_stages=stages,
        is_active=s.is_active
    )

@router.get("", response_model=list[ServiceOut])
def list_services(
    category: str | None = Query(default=None),
    department_id: int | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    q = db.query(ServiceCatalog).filter(ServiceCatalog.is_active == True)
    if category and category != "All":
        q = q.filter(ServiceCatalog.category.ilike(category))
    if department_id:
        q = q.filter(ServiceCatalog.department_id == department_id)
    if search:
        term = f"%{search}%"
        q = q.filter((ServiceCatalog.name.ilike(term)) | (ServiceCatalog.description.ilike(term)))
    
    services = q.order_by(ServiceCatalog.name).all()
    return [serialize_service(s) for s in services]

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    services = db.query(ServiceCatalog).filter(ServiceCatalog.is_active == True).all()
    cats = {}
    for s in services:
        cats[s.category] = cats.get(s.category, 0) + 1
    return [{"category": k, "count": v} for k, v in cats.items()]

@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    s = db.query(ServiceCatalog).filter_by(id=service_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Service not found in catalog")
    return serialize_service(s)
