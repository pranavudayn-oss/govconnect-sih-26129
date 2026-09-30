# GovConnect — Production & Demonstration Deployment Guide
**SIH 2026 Problem Statement: 26129**  
**Team: TechX Titansx**

---

## 1. Architecture Overview

```text
       Citizen Portal / Officer Dashboard (React + Vite)
                              │
                              │ REST / JSON (Secure Headers & CORS)
                              ▼
            GovConnect Interoperability Gateway (FastAPI)
         ┌────────────────────┬────────────────────┐
         ▼                    ▼                    ▼
   RBAC & DPDP          Append-Only          Reusable Connector
   Consent Engine        Audit Ledger        Orchestration Layer
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
               PostgreSQL / SQLite Database
                              │
         ┌────────────────────┴────────────────────┐
         ▼                    ▼                    ▼
 Revenue Connector    Municipal Connector   Transport / Welfare
    (REST JSON)           (OpenAPI)          (SOAP & FHIR R4)
```

---

## 2. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Default (Local) | Production Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy DB connection URI | `sqlite:///./govinterop.db` | `postgresql+psycopg://user:pass@host:5432/dbname` |
| `CORS_ORIGINS` | Permitted frontend origins (comma-separated) | `http://localhost:5173` | `https://govconnect.vercel.app` |
| `ENVIRONMENT` | Deployment environment identifier | `prototype` | `production` |

### Frontend (`frontend/.env`)

| Variable | Description | Default (Local) | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Public base URL for the backend API | `http://localhost:8000` | `https://api.govconnect.onrender.com` |

---

## 3. Local Deployment

### Method A: One-Command Docker Compose (PostgreSQL + FastAPI + Vite)

**Prerequisites:** Docker Desktop installed and running.

```bash
# Clone and enter directory
cd TechXTitansx_GovInteroperability_Prototype

# Start all three services (PostgreSQL, Backend API, Frontend UI)
docker compose up --build
```

**Access URLs:**
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Swagger Interactive API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

To tear down:
```bash
docker compose down
```

To reset the database volumes:
```bash
docker compose down -v
docker compose up --build
```

---

### Method B: Manual Local Execution (Zero-Install SQLite Fallback)

#### 1. Backend (FastAPI + Python 3.12)
```powershell
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (React + Vite)
In a separate terminal:
```powershell
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## 4. Production Cloud Deployment

### A. Managed PostgreSQL Database (Neon / Supabase / Render / AWS RDS)
1. Provision a free PostgreSQL 15/16 instance (e.g. on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com)).
2. Copy the pooled connection string. Ensure driver syntax is `postgresql+psycopg://`:
   ```text
   postgresql+psycopg://username:password@ep-sample.aws.neon.tech/govconnect?sslmode=require
   ```

### B. Backend Deployment (Render / Railway / Fly.io)

#### Deploying on Render:
1. Connect GitHub repository to [Render.com](https://render.com).
2. Choose **Web Service** with **Docker** environment (or Python 3.12 native).
   - **Root Directory:** `backend`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Configure Environment Variables:
   - `DATABASE_URL` = `<your-postgresql-connection-string>`
   - `CORS_ORIGINS` = `https://<your-vercel-domain>.vercel.app`
   - `ENVIRONMENT` = `production`
4. Health check path: `/health`

---

### C. Frontend Deployment (Vercel)

1. Import repository on [Vercel](https://vercel.com).
2. Configure Project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Set Environment Variable:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com`
4. Deploy. Vercel automatically deploys with single-page application routing (`vercel.json` included).

---

## 5. Judge Demonstration Flow (5–7 Minute Walkthrough)

| Step | Action | Feature Highlighted |
| :--- | :--- | :--- |
| **1. Citizen SSO** | Open Citizen Hub as `Priya Sharma` (`CIT-DEMO-001`) | Purpose-limited profile, KYC verification badge, dashboard metrics |
| **2. Browse Services** | Click *Government Services* catalog | 9 federated services, category filtering, clear SLA and document criteria |
| **3. Apply for Service** | Click *Apply Now* on **Income Certificate** | 6-step smart wizard, client/server input validation, demo file upload |
| **4. DPDP Consent** | Step 5: Purpose limitation review & consent grant | Data minimization, field-level authorization, DPDP 2023 alignment |
| **5. Submit & Track** | Submit -> Generate Unified Tracking ID (e.g. `GOV-26129-XXXX`) | Copy tracking ID, view confirmation, open printable acknowledgement slip |
| **6. Switch to Officer** | In topbar persona switcher, click **Rajesh Kumar (Senior Officer)** | Role-Based Access Control (RBAC), automatic switch to Officer Command Center |
| **7. Officer Workflow** | Find application in cross-department queue, click *Process Case* | Case management workspace, document verification, officer internal notes |
| **8. State Transition** | Change status from *Under Verification* -> *Approved* / *Forwarded* | Workflow state machine validation, notification push, audit event emitted |
| **9. Interoperability Bus** | Open *Integration Center* | 6 reusable department connectors, live ping latency tests, API gateway transaction feed |
| **10. Audit & Trust** | Open *Audit Trail* and *Security Center* | Immutable tamper-evident transaction trace, actor provenance, CSV compliance export |
