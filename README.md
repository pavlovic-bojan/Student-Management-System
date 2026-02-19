# Student Management System

**SMS** – multi-tenant student management system for universities. Manages tenants (institutions), users, students, programs, courses, exams, finance, and tickets. Role-based access (Platform Admin, School Admin, Professor, Student) and full-stack monorepo (backend, frontend, tests).

Stack: **Express + TypeScript + Prisma (PostgreSQL)** for the API, **Vue 3 + Vite + Quasar** for the web app. Tests: **Playwright** (API + E2E) and **k6** (performance).

## Test reports

GitHub Pages (`gh-pages` branch):

| Report | URL |
|--------|-----|
| **Landing** | [https://pavlovic-bojan.github.io/Student-Management-System/](https://pavlovic-bojan.github.io/Student-Management-System/) |
| **Allure** (Playwright API + E2E) | [allure/](https://pavlovic-bojan.github.io/Student-Management-System/allure/) |
| **k6 Load Test** | [load/](https://pavlovic-bojan.github.io/Student-Management-System/load/) |

Deployed after each Playwright run (main) and each Performance workflow run. Enable **Settings → Pages → Deploy from branch** → `gh-pages`.

## Live app

| Component | URL |
|-----------|-----|
| **Frontend** (Vercel) | [https://student-management-system-frontend-topaz.vercel.app/](https://student-management-system-frontend-topaz.vercel.app/) |
| **Backend API** | [https://student-management-system-backend-gwy8.onrender.com](https://student-management-system-backend-gwy8.onrender.com) |
| **Swagger UI** | [https://student-management-system-backend-gwy8.onrender.com/api-docs/](https://student-management-system-backend-gwy8.onrender.com/api-docs/) |

API base path: `/api` (e.g. `/api/health`, `/api/auth/login`, `/api/tenants`).

## Quick start

| Area | README | Commands |
|------|--------|----------|
| **Backend** | [backend/README.md](backend/README.md) | `npm run backend:dev` |
| **Frontend** | [frontend/README.md](frontend/README.md) | `npm run frontend:dev` |
| **Tests** | [tests/README.md](tests/README.md) | `npm run tests:api`, `npm run tests:e2e`, `npm run tests:performance` |

**Docker** – for **local development only** (PostgreSQL + backend + frontend). Production runs on Render (backend) and Vercel (frontend). See [docker-compose.yml](docker-compose.yml) and [tests/README.md](tests/README.md#docker) for details.

## Seed users

After `npm run prisma:seed` in [backend/](backend/) (see [backend/README.md](backend/README.md)):

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

**Tests:** Unit tests (`npm run backend:test:unit`, `npm run frontend:test`) run without a database. Full `npm run test:all` (including integration, API, E2E, performance) requires PostgreSQL. See [tests/README.md](tests/README.md) and [tests/e2e/README.md](tests/e2e/README.md), [tests/performance/README.md](tests/performance/README.md); for DB setup see LOCAL_SETUP.md.

## GitHub Actions (CI)

Workflows: backend deploy (Render), frontend deploy (Vercel), [Playwright tests](.github/workflows/playwright.yml), [performance tests](.github/workflows/performance.yml).

Secrets (set in **Settings → Secrets and variables → Actions**):

| Secret | Used by | Example value |
|--------|---------|---------------|
| `BACKEND_URL` | backend-deploy, playwright, performance | `https://student-management-system-backend-gwy8.onrender.com` |
| `FRONTEND_URL` | playwright | `https://student-management-system-frontend-topaz.vercel.app` |
| `TEST_USER_EMAIL` | playwright | `platform-admin@sms.edu` |
| `TEST_USER_PASSWORD` | playwright | `seed-platform-admin-change-me` |
| `DATABASE_URL` | backend-deploy | PostgreSQL connection string |
| `TEST_DATABASE_URL` | backend-deploy | Test DB for integration tests |
| `JWT_SECRET` | backend-deploy | Random string |
| `SESSION_SECRET` | backend-deploy | Random string |
| `RENDER_DEPLOY_HOOK` | backend-deploy | Render webhook URL |
| `PERF_AUTH_TOKEN` | performance (optional) | JWT for auth endpoints |

- **Backend health check** uses `$BACKEND_URL/api/health`
- **Frontend build** uses `VITE_API_URL=$BACKEND_URL/api`
- **Playwright API** uses `API_BASE_URL=$BACKEND_URL` and paths `api/health`, `api/auth/login`, etc.
- **Performance (k6)** uses `BASE_URL=$BACKEND_URL`; endpoints are `$BASE_URL/api/health`, etc.

**Test reports:** Both Playwright (Allure) and Performance (k6) deploy to `gh-pages` in subfolders `/allure/` and `/load/`. Landing page at root. Enable **Settings → Pages → Source: Deploy from branch** → `gh-pages`.

## Repository structure

| Folder | Description | README |
|--------|-------------|--------|
| **backend/** | Express + TypeScript + Prisma (PostgreSQL) | [backend/README.md](backend/README.md) |
| **frontend/** | Vue 3 + Vite + Quasar | [frontend/README.md](frontend/README.md) |
| **tests/** | Playwright (API + E2E) + k6 (performance) | [tests/README.md](tests/README.md) |
| **tests/e2e/** | Playwright specs and POM | [tests/e2e/README.md](tests/e2e/README.md) |
| **tests/performance/** | k6 load tests | [tests/performance/README.md](tests/performance/README.md) |
| **project-doc/** | BRD, MVP checklist, and other project docs | — |
