# Student Management System

Multi-tenant Student Management System (SMS): backend API and frontend web app.

## Live app

- **Frontend (Vercel):** [https://student-management-system-frontend-topaz.vercel.app/auth/login?redirect=/](https://student-management-system-frontend-topaz.vercel.app/auth/login?redirect=/)

## Backend (API)

- **Base URL:** [https://student-management-system-backend-gwy8.onrender.com](https://student-management-system-backend-gwy8.onrender.com)
- **API docs (Swagger UI):** [https://student-management-system-backend-gwy8.onrender.com/api-docs/](https://student-management-system-backend-gwy8.onrender.com/api-docs/)

API base path: `/api` (e.g. `/api/health`, `/api/auth/login`, `/api/tenants`).

See [backend/README.md](backend/README.md) for local setup, env vars, and deployment.

## Frontend

Vue 3 + Vite + Quasar. See [frontend/README.md](frontend/README.md) for setup and run.

## Seed users (after `npm run prisma:seed` in backend)

These users are created by the backend seed script. Use them to log in to the app (e.g. at the Vercel URL above). **Change passwords in production.**

| Username (email) | Password | Role |
|------------------|----------|------|
| platform-admin@sms.edu | seed-platform-admin-change-me | PLATFORM_ADMIN |
| admin@bg.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@ns.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@ni.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@kg.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@bl.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@sa.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@zg.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@lj.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@sk.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@cg.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@pg.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@pr.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@tz.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@mo.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@su.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@np.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@ca.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@le.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@sm.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@zr.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@pa.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@sh.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@kr.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@vr.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@uz.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@va.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@so.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@ki.edu | seed-admin-change-me | SCHOOL_ADMIN |
| admin@ja.edu | seed-admin-change-me | SCHOOL_ADMIN |
| prof1@bg.edu … prof8@bg.edu | seed-prof-change-me | PROFESSOR |
| prof1@ns.edu … prof8@ns.edu | seed-prof-change-me | PROFESSOR |
| prof1@ni.edu … prof8@ni.edu | seed-prof-change-me | PROFESSOR |
| prof1@kg.edu … prof8@kg.edu | seed-prof-change-me | PROFESSOR |
| prof1@bl.edu … prof8@bl.edu | seed-prof-change-me | PROFESSOR |
| prof1@sa.edu … prof8@sa.edu | seed-prof-change-me | PROFESSOR |
| prof1@zg.edu … prof8@zg.edu | seed-prof-change-me | PROFESSOR |
| prof1@lj.edu … prof8@lj.edu | seed-prof-change-me | PROFESSOR |
| prof1@sk.edu … prof8@sk.edu | seed-prof-change-me | PROFESSOR |
| prof1@cg.edu … prof8@cg.edu | seed-prof-change-me | PROFESSOR |
| prof1@pg.edu … prof8@pg.edu | seed-prof-change-me | PROFESSOR |
| prof1@pr.edu … prof8@pr.edu | seed-prof-change-me | PROFESSOR |
| prof1@tz.edu … prof8@tz.edu | seed-prof-change-me | PROFESSOR |
| prof1@mo.edu … prof8@mo.edu | seed-prof-change-me | PROFESSOR |
| prof1@su.edu … prof8@su.edu | seed-prof-change-me | PROFESSOR |
| prof1@np.edu … prof8@np.edu | seed-prof-change-me | PROFESSOR |
| prof1@ca.edu … prof8@ca.edu | seed-prof-change-me | PROFESSOR |
| prof1@le.edu … prof8@le.edu | seed-prof-change-me | PROFESSOR |
| prof1@sm.edu … prof8@sm.edu | seed-prof-change-me | PROFESSOR |
| prof1@zr.edu … prof8@zr.edu | seed-prof-change-me | PROFESSOR |
| prof1@pa.edu … prof8@pa.edu | seed-prof-change-me | PROFESSOR |
| prof1@sh.edu … prof8@sh.edu | seed-prof-change-me | PROFESSOR |
| prof1@kr.edu … prof8@kr.edu | seed-prof-change-me | PROFESSOR |
| prof1@vr.edu … prof8@vr.edu | seed-prof-change-me | PROFESSOR |
| prof1@uz.edu … prof8@uz.edu | seed-prof-change-me | PROFESSOR |
| prof1@va.edu … prof8@va.edu | seed-prof-change-me | PROFESSOR |
| prof1@so.edu … prof8@so.edu | seed-prof-change-me | PROFESSOR |
| prof1@ki.edu … prof8@ki.edu | seed-prof-change-me | PROFESSOR |
| prof1@ja.edu … prof8@ja.edu | seed-prof-change-me | PROFESSOR |

*Seed does not create STUDENT login accounts; students exist as records but do not have user logins by default.*

**Tests:** `npm run backend:test:unit` and `npm run frontend:test` run without a database. Full `npm run test:all` (including backend integration tests) requires PostgreSQL; see LOCAL_SETUP.md.

## Repository structure

- **backend/** — Express + TypeScript + Prisma (PostgreSQL)
- **frontend/** — Vue 3 + Vite + Quasar
- **tests/** — E2E, API, DB, performance (placeholder scripts until tests are added)
- **project-doc/** — BRD, MVP checklist, and other project docs
