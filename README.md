# ResuMesh Administrative Workspace (`admin/`)

This directory houses the administrative applications of **ResuMesh**, an open-source intelligent portfolio and CV management system. The administrative functionalities are completely isolated from the visitor-facing client to optimize security, resource management, and deployment flexibility.

## Workspace Structure

The administrative space is divided into two separate applications:

```
admin/
├── backend/    # Independent FastAPI administrative API (Port 8001)
└── frontend/   # Independent React/Vite administration dashboard (Port 8081)
```

---

## 1. Administrative Backend (`admin/backend`)

The administrative backend is a dedicated Python/FastAPI service responsible for securing write access, executing resource-heavy AI processes, and managing third-party platform scraping.

### Key Capabilities
- **Authentication**: JWT-based session management (`/api/v1/auth/*`) exclusively for admin logins.
- **AI CV Tailoring**: Processes external job descriptions using LLMs to format CVs dynamically (`/api/v1/admin/generate-cv`).
- **Data Ingestion Scrapers**: Pulls projects and publications from GitHub, Medium, and Dev.to in the background (`/api/v1/admin/refresh-data`).
- **LinkedIn PDF Import**: Parses LinkedIn profile PDF exports into structured database schemas using AI parser services (`/api/v1/admin/import/linkedin-pdf`).
- **Reactive Resume Integration**: Automatically synchronizes local database CV elements with the Reactive Resume platform (`/api/v1/admin/rxresume/*`).
- **Log Management**: Retrieves paginated system diagnostics and audit logs (`/api/v1/admin/logs`).
- **Data Mutations**: Houses all CRUD operations (POST, PUT, DELETE) on education, experiences, projects, skills, certificates, and articles.

---

## 2. Administrative Frontend (`admin/frontend`)

The administrative frontend is a React Single Page Application (SPA) built with Vite and TailwindCSS that acts as the control panel for ResuMesh owners.

### Key Capabilities
- **Secured Routing**: Uses authentication context and protected route wrappers to prevent unauthorized access.
- **LinkedIn PDF Uploader**: Interface to upload LinkedIn profile PDF exports and review parsed structured details.
- **AI CV Generation Panel**: Interactive form to input job URLs and generate customized versions of resume details.
- **Resource Management Tables**: Forms, tables, and modal dialogs to manage portfolio elements manually.
- **Live Logging**: Audit log viewer with log level filters and text search functionality.

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- A configured Supabase project (SUPABASE_URL, SUPABASE_KEY, and PostgreSQL connection string)

### Local Configuration
Create an `.env` file under `admin/backend/` and `admin/frontend/` using their respective `.env.example` templates.

For the backend:
```env
ENVIRONMENT=development
DATABASE_URL=postgresql://<user>:<pwd>@<host>:<port>/<db>
SUPABASE_URL=https://<id>.supabase.co
SUPABASE_KEY=<key>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_to_strong_password
JWT_SECRET_KEY=super-secret-key
ENABLE_ADMIN_WORKSPACE=true
LLM_PROVIDER=groq
GROQ_API_KEY=<gsk_key>
GROQ_MODEL=llama-3.3-70b-versatile
```

For the frontend:
```env
VITE_ADMIN_API_URL=http://localhost:8001
VITE_API_URL=http://localhost:8000
```

### Running Locally with Docker
You can spin up the entire developer environment (both public and admin portals) from the root project directory:

```bash
docker-compose up --build
```

- Public Portfolio App: `http://localhost`
- Administrative Dashboard: `http://localhost:8081`

### Running Locally (Manual Development)

To run the admin backend manually:
```bash
cd admin/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

To run the admin frontend manually:
```bash
cd admin/frontend
npm install
npm run dev -- --port 8081
```

---

## Testing

Admin backend tests can be executed separately:
```bash
cd admin/backend
PYTHONPATH=. pytest tests/ -v
```

Admin frontend unit tests can be executed separately:
```bash
cd admin/frontend
npm run test
```
