# JobPred: Portfolio & CV Builder

## Overview
JobPred is a full-stack application for students and professionals to build, analyze, and export their CVs, leveraging NLP-powered GitHub analysis and ATS (Applicant Tracking System) compatibility checks. It features:
- Modern React/Next.js frontend
- FastAPI Python backend
- JWT-based authentication (via Clerk)
- Dashboard with CRUD for CV entities
- GitHub repo analysis and LaTeX CV export
- ATS scoring for resumes

---

## Features
- **Authentication:** Register, login, and logout with JWT (Clerk integration)
- **Dashboard:** Manage profile, skills, work experience, certifications, awards, extracurriculars
- **CV Builder:** Create and preview LaTeX CVs, export to Overleaf or PDF
- **GitHub Analyzer:** Analyze and summarize your GitHub repositories using NLP
- **ATS Checker:** Check your resume's compatibility with job descriptions

---

## Project Structure
```
backend/   # FastAPI server (Python)
client/    # Next.js frontend (React/TypeScript)
```

---

## Getting Started

### Backend (Python/FastAPI)
1. `cd backend`
2. Create a virtual environment and activate it
3. `pip install -r requirements.txt`
4. `uvicorn main:app --reload`

### Frontend (Next.js)
1. `cd client`
2. `npm install`
3. `npm run dev`

---

## Authentication
- Uses Clerk for user management and JWT authentication
- Protects API routes and dashboard pages
- JWT is stored securely (httpOnly cookie)

---

## Dashboard & CRUD Entity
- After login, users access a dashboard
- CRUD operations for:
  - Profile
  - Skills
  - Work Experience
  - Certifications
  - Awards
  - Extracurriculars
- Data is stored in Supabase (PostgreSQL)

---

## API Documentation

### Main Endpoints
- `POST /api/analyze-github` — Analyze GitHub repos (NLP summary)
- `POST /api/generate-cv` — Generate LaTeX CV from user data
- `POST /api/ats-check` — ATS compatibility analysis
- `POST /api/ats-check-pdf` — ATS check from PDF resume

### Example: ATS Check
```
POST /api/ats-check
{
  "resume_text": "...",
  "job_description": "..."
}
```

### Postman Collection
- See `postman_collection.json` (add this file if required)

---

## Scaling Frontend-Backend Integration (Production)
- Use environment variables for API URLs and secrets
- Deploy backend and frontend separately (e.g., Vercel for Next.js, Azure/AWS for FastAPI)
- Use HTTPS and CORS settings for secure communication
- Store JWT in httpOnly cookies for security
- Use a CDN for static assets (frontend)
- Add API gateway or load balancer for backend
- Use managed database (e.g., Supabase, AWS RDS)
- Monitor and log errors (Sentry, LogRocket, etc.)

---

## License
MIT
