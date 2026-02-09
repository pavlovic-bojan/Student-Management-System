# Student Management System

Multi-tenant Student Management System (SMS): backend API and frontend web app.

## Backend (API)

- **Base URL:** [https://student-management-system-backend-gwy8.onrender.com](https://student-management-system-backend-gwy8.onrender.com)
- **API docs (Swagger UI):** [https://student-management-system-backend-gwy8.onrender.com/api-docs/](https://student-management-system-backend-gwy8.onrender.com/api-docs/)

API base path: `/api` (e.g. `/api/health`, `/api/auth/login`, `/api/tenants`).

See [backend/README.md](backend/README.md) for local setup, env vars, and deployment.

## Frontend

Vue 3 + Vite + Quasar. See [frontend/README.md](frontend/README.md) for setup and run.

## Repository structure

- **backend/** — Express + TypeScript + Prisma (PostgreSQL)
- **frontend/** — Vue 3 + Vite + Quasar
- **project-doc/** — BRD and other project docs
