from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

# ----------------- Auth Schemas -----------------
class LoginRequest(BaseModel):
    email: str
    password: str = "demo123"
    role: str = "CITIZEN"

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    department_code: str | None = None
    citizen_ref: str | None = None
    designation: str | None = None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ----------------- Department Schemas -----------------
class DepartmentOut(BaseModel):
    id: int
    code: str
    name: str
    category: str
    status: str
    connector_type: str
    endpoint: str
    officer_count: int = 10
    total_requests_today: int = 850
    success_rate: float = 99.2
    average_latency_ms: int = 120
    last_sync: datetime | None = None
    api_version: str = "v2.1"
    model_config = ConfigDict(from_attributes=True)

class DepartmentStatusUpdate(BaseModel):
    status: str  # Connected, Degraded, Offline

# ----------------- Citizen Schemas -----------------
class CitizenOut(BaseModel):
    id: int
    citizen_ref: str
    name: str
    email: str
    phone: str
    address: str
    kyc_status: str
    profile_completed_pct: int
    consent_given: bool
    last_login: datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Service Catalog Schemas -----------------
class ServiceOut(BaseModel):
    id: int
    code: str
    name: str
    department_id: int
    department_name: str | None = None
    department_code: str | None = None
    category: str
    description: str
    eligibility: str
    required_documents: list[str] = []
    estimated_processing_days: int
    digital_availability: str
    fee: int
    workflow_stages: list[str] = []
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

# ----------------- Document Schemas -----------------
class DocumentOut(BaseModel):
    id: int
    application_id: int | None = None
    citizen_ref: str
    category: str
    file_name: str
    file_type: str
    file_size_kb: int
    verification_status: str
    notes: str | None = None
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DocumentCreate(BaseModel):
    application_id: int | None = None
    citizen_ref: str = "CIT-DEMO-001"
    category: str
    file_name: str
    file_type: str = "application/pdf"
    file_size_kb: int = 245
    notes: str | None = None

# ----------------- Consent Schemas -----------------
class ConsentOut(BaseModel):
    id: int
    citizen_ref: str
    tracking_id: str | None = None
    department_code: str
    department_name: str
    purpose: str
    data_requested: list[str]
    status: str
    scope: str
    created_at: datetime
    expires_at: datetime
    revoked_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class ConsentCreate(BaseModel):
    citizen_ref: str = "CIT-DEMO-001"
    tracking_id: str | None = None
    department_code: str
    department_name: str
    purpose: str
    data_requested: list[str]
    scope: str = "Purpose-limited government service interoperability"

# ----------------- Application Schemas -----------------
class ApplicationCreate(BaseModel):
    service_name: str
    applicant_name: str
    applicant_email: str = "citizen@example.gov.in"
    applicant_phone: str = "+91 98765 43210"
    applicant_address: str = "Plot 42, Sector 5, New Delhi"
    citizen_ref: str = "CIT-DEMO-001"
    department_id: int
    category: str = "General"
    priority: str = "Normal"
    consent: bool = True
    shared_fields: list[str] = ["name", "email", "citizen_ref", "address"]
    notes: str | None = None
    uploaded_documents: list[DocumentCreate] = []

class ApplicationOut(BaseModel):
    id: int
    tracking_id: str
    service_name: str
    applicant_name: str
    applicant_email: str
    applicant_phone: str
    applicant_address: str
    citizen_ref: str
    department_id: int
    department_name: str
    department_code: str
    category: str
    priority: str
    status: str
    stage: str
    progress: int
    consent: bool
    shared_fields: list[str]
    officer_notes: str
    sla_deadline_days: int
    sla_risk: bool
    created_at: datetime
    updated_at: datetime

class EventOut(BaseModel):
    id: int
    actor: str = "System"
    stage: str
    status: str
    message: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ApplicationDetail(ApplicationOut):
    events: list[EventOut] = []
    documents: list[DocumentOut] = []
    consents: list[ConsentOut] = []

class StatusUpdate(BaseModel):
    status: str
    stage: str
    progress: int
    note: str
    priority: str | None = None
    officer_notes: str | None = None
    actor_name: str = "Verification Officer"
    forward_to_department_code: str | None = None

# ----------------- Notification Schemas -----------------
class NotificationOut(BaseModel):
    id: int
    application_id: int | None = None
    citizen_ref: str | None = None
    title: str
    message: str
    severity: str
    category: str = "Application"
    read: bool
    created_at: datetime
    tracking_id: str | None = None
    model_config = ConfigDict(from_attributes=True)

# ----------------- Audit Schemas -----------------
class AuditOut(BaseModel):
    id: int
    actor: str
    role: str
    action: str
    category: str
    resource: str
    department_code: str | None = None
    detail: str
    ip_address: str
    result: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Gateway / Monitoring Schemas -----------------
class GatewayMetricsOut(BaseModel):
    total_requests_today: int
    requests_per_minute: int
    avg_latency_ms: int
    success_rate: float
    active_connectors: int
    rate_limit_events: int
    security_events_today: int
    recent_transactions: list[dict] = []
