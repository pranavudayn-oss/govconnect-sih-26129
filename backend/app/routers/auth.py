import hashlib
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Citizen, AuditLog
from ..schemas import LoginRequest, UserOut, TokenOut

router = APIRouter(prefix="/api/auth", tags=["Authentication & Identity"])

DEMO_USERS = [
    {
        "email": "citizen@govconnect.demo",
        "username": "priya.sharma",
        "full_name": "Priya Sharma",
        "role": "CITIZEN",
        "citizen_ref": "CIT-DEMO-001",
        "designation": "Citizen Applicant",
        "description": "Standard citizen applying for certificates, subsidies & municipal services."
    },
    {
        "email": "officer@govconnect.demo",
        "username": "rajesh.kumar",
        "full_name": "Rajesh Kumar",
        "role": "OFFICER",
        "department_code": "REV",
        "designation": "Senior Verification Officer",
        "description": "Verifies documents, processes applications, forwards across departments."
    },
    {
        "email": "deptadmin@govconnect.demo",
        "username": "sunita.rao",
        "full_name": "Sunita Rao",
        "role": "DEPARTMENT_ADMIN",
        "department_code": "MUNI",
        "designation": "Municipal Service Director",
        "description": "Monitors department connectors, SLA compliance, and officer queues."
    },
    {
        "email": "admin@govconnect.demo",
        "username": "dr.v.narayanan",
        "full_name": "Dr. V. Narayanan",
        "role": "SYSTEM_ADMIN",
        "designation": "Interoperability Gateway Administrator",
        "description": "System-wide control plane, security audit, connector topology & health."
    }
]

def generate_demo_token(user: User) -> str:
    seed = f"govconnect-{user.email}-{user.role}-session"
    return f"gov_{hashlib.sha256(seed.encode()).hexdigest()[:32]}"

def get_current_user(
    authorization: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None),
    x_user_email: str | None = Header(default=None),
    db: Session = Depends(get_db)
) -> User:
    # 1. Check Bearer token if provided
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        for demo in DEMO_USERS:
            u = db.query(User).filter_by(email=demo["email"]).first()
            if u and generate_demo_token(u) == token:
                return u

    # 2. Check X-User-Role / X-User-Email fallback for seamless UI role switching
    if x_user_email:
        u = db.query(User).filter_by(email=x_user_email).first()
        if u:
            return u

    if x_user_role:
        u = db.query(User).filter_by(role=x_user_role.upper()).first()
        if u:
            return u

    # 3. Default to demo citizen if unauthenticated (demo-friendly)
    default_user = db.query(User).filter_by(role="CITIZEN").first()
    if default_user:
        return default_user
    
    # Fallback user in case DB is still seeding
    return User(
        id=1,
        email="citizen@govconnect.demo",
        username="priya.sharma",
        full_name="Priya Sharma",
        role="CITIZEN",
        citizen_ref="CIT-DEMO-001",
        is_active=True
    )

def require_roles(allowed_roles: list[str]):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden: Action requires one of {allowed_roles}, but current persona is {user.role}"
            )
        return user
    return role_checker

@router.get("/demo-users")
def list_demo_users():
    """Returns list of preconfigured demo personas for fast switching in UI."""
    return DEMO_USERS

@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=payload.email).first()
    if not user:
        # Match by role if email is generic
        user = db.query(User).filter_by(role=payload.role.upper()).first()
    
    if not user:
        # Seed on demand if user not found
        user = User(
            email=payload.email,
            username=payload.email.split("@")[0],
            full_name="Demonstration User",
            role=payload.role.upper(),
            citizen_ref="CIT-DEMO-001" if payload.role.upper() == "CITIZEN" else None,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = generate_demo_token(user)
    
    # Audit log login
    db.add(AuditLog(
        actor=user.full_name,
        role=user.role,
        action="USER_LOGIN",
        category="LOGIN",
        resource="auth_gateway",
        department_code=user.department_code or "CENTRAL",
        detail=f"User authenticated into GovConnect Gateway as {user.role}. Session initiated.",
        result="SUCCESS"
    ))
    db.commit()

    return TokenOut(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)
