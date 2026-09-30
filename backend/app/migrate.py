import logging
from sqlalchemy import text, inspect
from .database import engine, Base

logger = logging.getLogger("govinterop.migrate")

def run_migrations():
    """
    Safe incremental schema migration for SQLite and PostgreSQL.
    Ensures that any columns added in models exist in existing database tables
    without dropping or losing existing data.
    """
    Base.metadata.create_all(bind=engine)

    insp = inspect(engine)
    existing_tables = set(insp.get_table_names())

    migrations = {
        "applications": [
            ("applicant_email", "VARCHAR(180) DEFAULT 'citizen@example.gov.in'"),
            ("applicant_phone", "VARCHAR(30) DEFAULT '+91 90000 00000'"),
            ("applicant_address", "VARCHAR(255) DEFAULT 'Plot 42, Sector 5, New Delhi'"),
            ("category", "VARCHAR(80) DEFAULT 'General'"),
            ("priority", "VARCHAR(30) DEFAULT 'Normal'"),
            ("officer_notes", "TEXT DEFAULT ''"),
            ("sla_deadline_days", "INTEGER DEFAULT 7"),
            ("sla_risk", "BOOLEAN DEFAULT 0"),
        ],
        "departments": [
            ("officer_count", "INTEGER DEFAULT 12"),
            ("total_requests_today", "INTEGER DEFAULT 850"),
            ("success_rate", "FLOAT DEFAULT 99.2"),
            ("average_latency_ms", "INTEGER DEFAULT 120"),
            ("last_sync", "DATETIME DEFAULT '2026-09-30 12:00:00'"),
            ("api_version", "VARCHAR(20) DEFAULT 'v2.1'"),
        ],
        "citizens": [
            ("address", "VARCHAR(255) DEFAULT 'Flat 402, Block B, Govt Colony, New Delhi'"),
            ("kyc_status", "VARCHAR(30) DEFAULT 'VERIFIED'"),
            ("profile_completed_pct", "INTEGER DEFAULT 95"),
            ("last_login", "DATETIME DEFAULT '2026-09-30 12:00:00'"),
        ],
        "application_events": [
            ("actor", "VARCHAR(100) DEFAULT 'System Gateway'"),
        ],
        "notifications": [
            ("citizen_ref", "VARCHAR(50) DEFAULT 'CIT-DEMO-001'"),
            ("category", "VARCHAR(50) DEFAULT 'Application'"),
        ],
        "audit_logs": [
            ("role", "VARCHAR(50) DEFAULT 'SYSTEM'"),
            ("category", "VARCHAR(60) DEFAULT 'GENERAL'"),
            ("department_code", "VARCHAR(30) DEFAULT 'GATEWAY'"),
            ("ip_address", "VARCHAR(60) DEFAULT '127.0.0.1 (Gateway)'"),
            ("result", "VARCHAR(30) DEFAULT 'SUCCESS'"),
        ]
    }

    with engine.begin() as conn:
        for table_name, cols in migrations.items():
            if table_name in existing_tables:
                existing_cols = set(c["name"] for c in insp.get_columns(table_name))
                for col_name, col_def in cols:
                    if col_name not in existing_cols:
                        try:
                            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_def}"))
                            print(f"Added column {col_name} to {table_name}")
                        except Exception as e:
                            print(f"Could not add {col_name} to {table_name}: {e}")
