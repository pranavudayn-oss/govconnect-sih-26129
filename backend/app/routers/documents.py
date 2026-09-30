import os
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Document, Application, AuditLog, User
from ..schemas import DocumentOut, DocumentCreate
from .auth import get_current_user, require_roles

router = APIRouter(prefix="/api/documents", tags=["Document Management"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB

def sanitize_filename(filename: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    return cleaned[:100]

@router.get("", response_model=list[DocumentOut])
def list_documents(
    citizen_ref: str | None = Query(default=None),
    application_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    q = db.query(Document)
    
    # If user is a citizen, only allow viewing their own documents
    if user.role == "CITIZEN":
        ref = user.citizen_ref or "CIT-DEMO-001"
        q = q.filter(Document.citizen_ref == ref)
    else:
        if citizen_ref:
            q = q.filter(Document.citizen_ref == citizen_ref)
    
    if application_id:
        q = q.filter(Document.application_id == application_id)
        
    return q.order_by(Document.uploaded_at.desc()).all()

@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    citizen_ref: str = Form(default="CIT-DEMO-001"),
    application_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, PNG, JPG, JPEG"
        )
    
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type '{file.content_type}'. Must be application/pdf or image/*"
        )
    
    contents = await file.read()
    file_size_bytes = len(contents)
    if file_size_bytes > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of 5MB (Uploaded: {file_size_bytes / (1024*1024):.2f}MB)"
        )
    
    safe_name = sanitize_filename(file.filename)
    effective_ref = user.citizen_ref if user.role == "CITIZEN" else citizen_ref

    doc = Document(
        application_id=application_id,
        citizen_ref=effective_ref,
        category=category,
        file_name=safe_name,
        file_type=file.content_type,
        file_size_kb=max(1, file_size_bytes // 1024),
        verification_status="Pending Review",
        notes="Uploaded via Citizen Portal. Demo verification pending."
    )
    db.add(doc)
    
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="DOCUMENT_UPLOADED",
        category="DOCUMENT_UPLOADED",
        resource=safe_name,
        department_code="GATEWAY",
        detail=f"Uploaded {category} ({safe_name}, {doc.file_size_kb} KB) for citizen {effective_ref}.",
        result="SUCCESS"
    ))
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/record", response_model=DocumentOut, status_code=201)
def create_document_record(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    doc = Document(
        application_id=payload.application_id,
        citizen_ref=payload.citizen_ref,
        category=payload.category,
        file_name=sanitize_filename(payload.file_name),
        file_type=payload.file_type,
        file_size_kb=payload.file_size_kb,
        verification_status="Verified",
        notes=payload.notes or "Simulated document attached to application"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.patch("/{document_id}/verify", response_model=DocumentOut)
def update_verification_status(
    document_id: int,
    status: str = Query(..., regex="^(Verified|Pending Review|Flagged)$"),
    notes: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["OFFICER", "DEPARTMENT_ADMIN", "SYSTEM_ADMIN"]))
):
    doc = db.query(Document).filter_by(id=document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.verification_status = status
    if notes:
        doc.notes = notes
    
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="DOCUMENT_VERIFIED",
        category="STATUS_CHANGED",
        resource=doc.file_name,
        detail=f"Verification status updated to '{status}' by {user.role}. Notes: {notes or 'None'}",
        result="SUCCESS"
    ))
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter_by(id=document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if user.role == "CITIZEN" and doc.citizen_ref != user.citizen_ref:
        raise HTTPException(status_code=403, detail="Cannot delete documents belonging to another citizen")
    
    db.delete(doc)
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="DOCUMENT_DELETED",
        category="SECURITY_EVENT",
        resource=doc.file_name,
        detail=f"Document {doc.file_name} removed from system.",
        result="SUCCESS"
    ))
    db.commit()
    return {"ok": True, "message": "Document deleted successfully"}
