# GovConnect — Government Service Interoperability Framework
**Smart India Hackathon (SIH) 2026 · Problem Statement: 26129**  
**Team: TechX Titansx**

---

## 🏛️ Executive Summary

**GovConnect** is an advanced, enterprise-grade Government Digital Public Infrastructure (DPI) prototype built to address **SIH 2026 Problem Statement 26129: Government Service Interoperability Framework**.

The core premise of the framework is:
> **"One login. One tracking ID. Services across departments."**  
> *Connect existing government systems without replacing them.*

Rather than attempting to replace entrenched departmental IT systems (Revenue, Municipal, Transport, Social Welfare, Education, Health), GovConnect provides a lightweight, federated middleware orchestration plane. Reusable enterprise connectors interface with legacy and modern government backends (REST, SOAP, DB Adapter, FHIR), while enforcing **DPDP Act 2023 purpose-limited citizen consent** and **tamper-evident audit logging**.

---

## 🚀 Key Working Features

### 1. Advanced Citizen Portal & Profile
- **Citizen Master Profile:** Verified citizen reference (`CIT-DEMO-001`), e-KYC verification status, contact details, profile completion meter (95%), and last login timestamp.
- **Unified Application Tracking:** Single tracking identifier (e.g. `GOV-26129-8421`) for tracking requests across all government departments.
- **Real-Time KPIs:** Live counts of active applications, items requiring citizen action, completed services, and unread notifications.

### 2. Government Service Catalog
- **Multi-Category Directory:** 9 statutory services across Revenue, Municipal Services, Social Welfare, Transport, Education, and Health.
- **Service Specifications:** Detailed description, statutory eligibility criteria, checklist of required documents, SLA turnaround time, fees, and direct *Apply Now* integration.

### 3. Smart Multi-Step Service Request Flow
- **6-Step Wizard:** Service Selection ➔ Applicant Details ➔ Eligibility & Scheme ➔ Supporting Documents ➔ Purpose-Limited Consent ➔ Review & Submission.
- **Client & Server Validation:** Type safety, required fields, and DPDP consent validation.
- **Post-Submission Confirmation:** Copyable Tracking ID, one-click case tracking, and **Download Official Acknowledgement Slip** (printable PDF receipt with security watermark).

### 4. DPDP 2023 Consent Management Center
- **Purpose-Bound Authorizations:** Information is shared *only* with the authorized department for the specified operational purpose.
- **Active & Historical Ledger:** Inspect requesting department, permitted fields, grant date, and 90-day expiry.
- **Citizen Revocation Control:** Instant consent revocation with cross-department access termination and audit logging.

### 5. Encrypted Citizen Document Locker
- **Digital Vault Simulation:** Upload, inspect, and manage supporting proofs (Identity, Address, Income, Property).
- **Validation Engine:** Extension verification (`.pdf`, `.png`, `.jpg`, `.jpeg`), MIME validation, and 5MB size limit.
- **Metadata Inspector:** Inspect MIME type, file size, SHA-256 integrity simulation, and verification status.

### 6. Officer Command Center & Case Processing Workspace
- **Officer KPIs & Charts:** Queue size, pending verification, active processing, completed services, SLA risk alerts, and workload distribution by department.
- **Multi-Filter Application Queue:** Filter by department, status, priority, SLA risk, or keyword search.
- **Case Management Drawer:**
  - Full applicant master record and contact details.
  - Document verification interface (Verify / Request Action).
  - Workflow State Machine actions (*Verify Documents*, *Request Citizen Action*, *Put on Hold*, *Approve*, *Deliver Service*, *Reject with Reason*).
  - **Cross-Department Interoperability Dispatch:** Forward transaction packets to other connected department connectors.
  - Immutable application timeline with timestamps.

### 7. Interoperability Control Plane (SIH Core Innovation)
- **Reusable Department Connectors:**
  1. *Revenue Department:* REST API / JSON Gateway (`REV`)
  2. *Municipal Services Corporation:* REST OpenAPI 3.0 (`MUNI`)
  3. *Social Welfare Directorate:* SOAP / XML Bridge (`SOC`)
  4. *Transport Authority:* REST Licensing Adapter (`TRANS`)
  5. *Education Board:* Federated DB Adapter (`EDU`)
  6. *Health & Family Welfare:* FHIR R4 / ABDM Simulated Connector (`HEALTH`)
- **Live Health Probes:** Interactive *Ping Test* triggering real backend roundtrips and measuring latency in milliseconds.
- **API Gateway Live Stream:** Real-time feed of simulated gateway transactions with HTTP methods, latency, and status codes.

### 8. Enterprise Audit & Security Center
- **Immutable Audit Ledger:** Append-only log tracking every login, consent grant, document upload, status transition, and connector dispatch.
- **Compliance Export:** One-click CSV export of the complete audit trail.
- **Security & Trust Center:** Details 8 active prototype security controls (RBAC, DPDP Consent, Append-Only Audit, Input Sanitization, File Validation, Strict CORS, DB Constraints, Simulated Rate Limiting).
- **Interactive Security Integrity Probe:** Test gateway token validation and rate-limiting policies live.

### 9. Platform Administration & Global Search
- **Platform Health Matrix:** Database, FastAPI gateway, and protocol breakdown.
- **Connector Management:** Admin toggles to simulate connector downtime or degradation during judge presentations.
- **Global Search (`Ctrl+K`):** Grouped search across applications, services, and departments.

---

## 🔑 Demo Personas & Credentials

Switch seamlessly between personas using the topbar dropdown:

| Persona | Name | Role | Department | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Priya Sharma | `CITIZEN` | Central Gateway | Applies for services, manages consents & document locker (`CIT-DEMO-001`). |
| **Verification Officer** | Rajesh Kumar | `OFFICER` | Revenue (`REV`) | Verifies documents, executes workflow transitions, adds internal notes. |
| **Department Admin** | Sunita Rao | `DEPARTMENT_ADMIN` | Municipal (`MUNI`) | Monitors department SLA, connector throughput, and queue health. |
| **System Admin** | Dr. V. Narayanan | `SYSTEM_ADMIN` | Central Control | System-wide control plane, security audit, connector toggles & health. |

*Demo Password for all personas:* `demo123`

---

## 🛠️ Technology Stack

```text
React (Vite, JavaScript, Lucide React)
               │
               ▼ REST / JSON
FastAPI (Python 3.12, Pydantic v2)
               │
               ▼ SQLAlchemy ORM
PostgreSQL 16 (Production / Docker) · SQLite (Local Fallback)
```

---

## ⚡ Quick Start

### Option 1: Run with Docker Compose (Recommended)
Requires [Docker Desktop](https://www.docker.com/).

```bash
docker compose up --build
```
- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Run Locally without Docker (Zero-Install Database)

**Terminal 1 — Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

---

## 🌐 Cloud Deployment

- **Frontend:** Pre-configured for zero-config deployment on [Vercel](https://vercel.com) (includes `vercel.json`).
- **Backend:** Ready for containerized deployment on [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io).
- **Database:** Fully compatible with managed PostgreSQL (Neon, Supabase, Render Postgres, AWS RDS).

Detailed deployment instructions and configuration variables are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## ⚖️ Hackathon Disclaimer
*This project is a functional, simulated prototype created for the **Smart India Hackathon 2026** (Problem Statement 26129). All departmental connectors, citizen records, identity documents, and verification tokens are simulated demonstrations and do not connect to real government production databases or Aadhaar registries.*
