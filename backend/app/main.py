import os
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal
from .migrate import run_migrations
from .seed import seed
from .routers import (
    applications, departments, dashboard, audit,
    auth, services, documents, consent, notifications, security
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("govinterop")

app = FastAPI(
    title="GovConnect — Government Service Interoperability Framework API",
    version="2.0.0",
    description="SIH 2026 Problem Statement 26129 - Federated Interoperability Gateway connecting legacy and modern government systems.",
    contact={
        "name": "Team TechX Titansx",
        "url": "https://govconnect.sih2026.internal"
    }
)

# CORS configuration
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
origins = [x.strip() for x in origins_env.split(",") if x.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safe error handling middleware to sanitize internal stack traces
@app.middleware("http")
async def sanitize_errors_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
    except Exception as exc:
        logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Something went wrong while processing this government service request.",
                "reference_id": f"ERR-{os.urandom(3).hex().upper()}",
                "prototype_note": "A safe generic error response is displayed to protect sensitive infrastructure information."
            }
        )

# Database migration & seed initialization
try:
    run_migrations()
    with SessionLocal() as db:
        seed(db)
    logger.info("Database migration and demonstration seed completed successfully.")
except Exception as e:
    logger.error(f"Initialization warning: {e}", exc_info=True)

# Register routers
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(services.router)
app.include_router(documents.router)
app.include_router(consent.router)
app.include_router(departments.router)
app.include_router(dashboard.router)
app.include_router(audit.router)
app.include_router(notifications.router)
app.include_router(security.router)

@app.get("/")
def root():
    return {
        "name": "GovConnect — Government Service Interoperability Framework",
        "problem_statement": "26129",
        "team": "TechX Titansx",
        "version": "2.0.0",
        "status": "online",
        "demo_mode": True,
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "govconnect-interoperability-gateway",
        "environment": os.getenv("ENVIRONMENT", "prototype"),
        "compliance": "DPDP Act 2023 Purpose-Limited Simulation"
    }
