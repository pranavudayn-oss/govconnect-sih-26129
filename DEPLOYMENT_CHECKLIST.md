# Deployment checklist

## Recommended hackathon deployment

### 1. Database
Create a managed PostgreSQL database.

Copy its connection string as:

`postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME`

### 2. Backend
Deploy `backend/` as a Docker web service.

Environment variables:
- `DATABASE_URL=<managed-postgres-url>`
- `CORS_ORIGINS=https://<frontend-domain>`

Health endpoint:

`/health`

API documentation:

`/docs`

### 3. Frontend
Deploy `frontend/` to a static/Node host.

Environment variable:
- `VITE_API_URL=https://<backend-domain>`

Build command:

`npm run build`

Output directory:

`dist`

### 4. Final public demo
Use the frontend URL in the SIH PPT.

Example label:

**Live Prototype — GovConnect**
`https://<frontend-domain>`

Do not put database credentials or secret keys in the frontend.
