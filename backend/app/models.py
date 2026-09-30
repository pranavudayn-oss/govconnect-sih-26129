from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150))
    role: Mapped[str] = mapped_column(String(50))  # CITIZEN, OFFICER, DEPARTMENT_ADMIN, SYSTEM_ADMIN
    department_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    citizen_ref: Mapped[str | None] = mapped_column(String(50), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), default="Connected")  # Connected, Degraded, Offline
    connector_type: Mapped[str] = mapped_column(String(50), default="REST")  # REST, SOAP, DB Adapter, FHIR
    endpoint: Mapped[str] = mapped_column(String(255), default="simulated://connector")
    officer_count: Mapped[int] = mapped_column(Integer, default=12)
    total_requests_today: Mapped[int] = mapped_column(Integer, default=850)
    success_rate: Mapped[float] = mapped_column(Float, default=99.2)
    average_latency_ms: Mapped[int] = mapped_column(Integer, default=120)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    api_version: Mapped[str] = mapped_column(String(20), default="v2.1")
    
    applications = relationship("Application", back_populates="department")
    services = relationship("ServiceCatalog", back_populates="department", cascade="all, delete-orphan")

class Citizen(Base):
    __tablename__ = "citizens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    citizen_ref: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180))
    phone: Mapped[str] = mapped_column(String(30))
    address: Mapped[str] = mapped_column(String(255), default="Flat 402, Block B, Govt Colony, New Delhi")
    kyc_status: Mapped[str] = mapped_column(String(30), default="VERIFIED")  # VERIFIED, PENDING, REJECTED
    profile_completed_pct: Mapped[int] = mapped_column(Integer, default=95)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    applications = relationship(
        "Application",
        back_populates="citizen",
        primaryjoin="Citizen.citizen_ref == foreign(Application.citizen_ref)"
    )

class ServiceCatalog(Base):
    __tablename__ = "service_catalog"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    category: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    eligibility: Mapped[str] = mapped_column(Text)
    required_documents: Mapped[str] = mapped_column(Text)  # Comma-separated or JSON list
    estimated_processing_days: Mapped[int] = mapped_column(Integer, default=7)
    digital_availability: Mapped[str] = mapped_column(String(50), default="100% Online")
    fee: Mapped[int] = mapped_column(Integer, default=0)
    workflow_stages: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    department = relationship("Department", back_populates="services")

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tracking_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    service_name: Mapped[str] = mapped_column(String(180))
    applicant_name: Mapped[str] = mapped_column(String(120))
    applicant_email: Mapped[str] = mapped_column(String(180), default="citizen@example.gov.in")
    applicant_phone: Mapped[str] = mapped_column(String(30), default="+91 90000 00000")
    applicant_address: Mapped[str] = mapped_column(String(255), default="Plot 42, Sector 5, New Delhi")
    citizen_ref: Mapped[str] = mapped_column(String(50), index=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    category: Mapped[str] = mapped_column(String(80), default="General")
    priority: Mapped[str] = mapped_column(String(30), default="Normal")  # High, Normal, Low
    status: Mapped[str] = mapped_column(String(50), default="Submitted")  # SUBMITTED, UNDER_VERIFICATION, IN_REVIEW, ACTION_REQUIRED, FORWARDED, APPROVED, REJECTED, ON_HOLD, COMPLETED
    stage: Mapped[str] = mapped_column(String(80), default="Submission")
    progress: Mapped[int] = mapped_column(Integer, default=15)
    consent: Mapped[bool] = mapped_column(Boolean, default=True)
    shared_fields: Mapped[str] = mapped_column(Text, default="name,email,citizen_ref,address")
    officer_notes: Mapped[str] = mapped_column(Text, default="")
    sla_deadline_days: Mapped[int] = mapped_column(Integer, default=7)
    sla_risk: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="applications")
    citizen = relationship(
        "Citizen",
        back_populates="applications",
        primaryjoin="Citizen.citizen_ref == foreign(Application.citizen_ref)"
    )
    events = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="application", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="application", cascade="all, delete-orphan")

class ApplicationEvent(Base):
    __tablename__ = "application_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id"))
    actor: Mapped[str] = mapped_column(String(100), default="System Gateway")
    stage: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(50))
    message: Mapped[str] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="events")

class Document(Base):
    __tablename__ = "documents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int | None] = mapped_column(ForeignKey("applications.id"), nullable=True)
    citizen_ref: Mapped[str] = mapped_column(String(50), index=True)
    category: Mapped[str] = mapped_column(String(80))  # Identity Proof, Address Proof, Income Proof, Property Document, Educational Certificate
    file_name: Mapped[str] = mapped_column(String(200))
    file_type: Mapped[str] = mapped_column(String(50))  # application/pdf, image/png, image/jpeg
    file_size_kb: Mapped[int] = mapped_column(Integer, default=240)
    verification_status: Mapped[str] = mapped_column(String(40), default="Verified")  # Verified, Pending Review, Flagged
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="documents")

class ConsentRecord(Base):
    __tablename__ = "consent_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    citizen_ref: Mapped[str] = mapped_column(String(50), index=True)
    tracking_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    department_code: Mapped[str] = mapped_column(String(30))
    department_name: Mapped[str] = mapped_column(String(150))
    purpose: Mapped[str] = mapped_column(String(255))
    data_requested: Mapped[str] = mapped_column(Text)  # Comma-separated field list
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")  # ACTIVE, REVOKED, EXPIRED
    scope: Mapped[str] = mapped_column(String(100), default="Purpose-limited service processing")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int | None] = mapped_column(ForeignKey("applications.id"), nullable=True)
    citizen_ref: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(180))
    message: Mapped[str] = mapped_column(String(400))
    severity: Mapped[str] = mapped_column(String(30), default="info")  # success, info, warning, alert
    category: Mapped[str] = mapped_column(String(50), default="Application")  # Application, Document, Consent, Security
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(50), default="SYSTEM")  # CITIZEN, OFFICER, DEPARTMENT_ADMIN, SYSTEM_ADMIN, SYSTEM
    action: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(60), default="GENERAL")  # LOGIN, APPLICATION_CREATED, DOCUMENT_UPLOADED, CONSENT_GRANTED, CONSENT_REVOKED, STATUS_CHANGED, APPLICATION_FORWARDED, APPLICATION_APPROVED, APPLICATION_REJECTED, CONNECTOR_REQUEST, SECURITY_EVENT
    resource: Mapped[str] = mapped_column(String(180))
    department_code: Mapped[str | None] = mapped_column(String(30), nullable=True)
    detail: Mapped[str] = mapped_column(Text)
    ip_address: Mapped[str] = mapped_column(String(60), default="127.0.0.1 (Gateway)")
    result: Mapped[str] = mapped_column(String(30), default="SUCCESS")  # SUCCESS, FAILURE, WARNING
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
