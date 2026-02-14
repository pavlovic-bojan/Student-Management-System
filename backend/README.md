# Student Management System — Backend

Backend for the multi-tenant Student Management System (SMS). Built with **Express**, **TypeScript**, **Prisma**, and **PostgreSQL**. It exposes REST APIs for auth/users, tenants, students, programs, courses, exams, finance, records, tickets (bug reports), and notifications.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Setup and run](#setup-and-run)
- [Database (Prisma)](#database-prisma)
- [API overview](#api-overview)
- [Authentication and multi-tenancy](#authentication-and-multi-tenancy)
- [Unit tests](#unit-tests)
- [Integration tests](#integration-tests)
- [Running tests](#running-tests)
- [Scripts reference](#scripts-reference)
- [Swagger / OpenAPI](#swagger--openapi)
- [Docker](#docker)
- [Deploy (e.g. Render)](#deploy-eg-render)

---

## Tech stack

- **Runtime**: Node.js (≥20)
- **Framework**: Express
- **Language**: TypeScript (strict)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: express-validator
- **Auth**: JWT (jsonwebtoken); optional test bypass via headers
- **Testing**: Vitest, Supertest
- **Logging**: Winston

---

## Project structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema (Tenant, User, Student, StudentTenant, Program, Course, …)
│   ├── migrations/     # Migration SQL files
│   └── seed.ts         # Seed (tenants, users, students + enrollments, programs, courses, etc.)
├── src/
│   ├── config/         # Environment and app config
│   ├── middleware/     # tenantContext, authenticate, errorHandler
│   ├── modules/        # Feature modules (per domain)
│   │   ├── health/     # Health check
│   │   ├── auth/       # Auth (login, register, me, forgot-password, logout) + Users (list, PATCH, DELETE)
│   │   ├── tenant/     # Tenants CRUD
│   │   ├── students/   # Students CRUD + enrollments (Student–Tenant many-to-many)
│   │   ├── programs/   # Programs CRUD
│   │   ├── courses/    # Courses CRUD
│   │   ├── exams/      # Exam periods & terms
│   │   ├── finance/    # Tuitions & payments
│   │   ├── records/    # Transcripts
│   │   ├── tickets/    # Bug reports (submit, list, PATCH status/priority)
│   │   └── notifications/ # User-action & ticket notifications (list, mark-read)
│   ├── prisma/         # Prisma client singleton
│   ├── server.ts       # Express app (no listen — for tests)
│   ├── index.ts        # Entry point (listens on PORT)
│   └── __tests__/
│       ├── helpers/    # mockRequest, mockResponse, mockNext
│       ├── unit/       # Unit tests (services, use cases, middleware)
│       └── integration/# Integration tests (HTTP + DB)
├── openapi.yaml        # OpenAPI 3.0 spec (Swagger UI at /api-docs)
├── Dockerfile          # Multi-stage build for production
├── .dockerignore
├── vitest.config.ts
├── vitest.setup.ts     # NODE_ENV=test, SKIP_AUTH_FOR_TESTS
├── .env.example
└── package.json
```

Each feature module typically has: **routes**, **controller**, **service**, **repository** (interface + Prisma impl), **DTOs**, **models**, and optionally **use-cases** and **factory** for dependency injection.

---

## Environment variables

Copy `.env.example` to `.env` and set values locally (never commit `.env`).

| Variable         | Required | Description |
|------------------|----------|-------------|
| `DATABASE_URL`   | Yes      | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/sms_db`) |
| `DIRECT_URL`     | No       | Direct DB URL for migrations (can equal `DATABASE_URL`) |
| `JWT_SECRET`     | Yes      | Secret for signing/verifying JWT (min 32 chars) |
| `SESSION_SECRET` | Yes      | Session secret (min 32 chars) |
| `PORT`           | No       | Server port (default `4000`) |
| `NODE_ENV`       | No       | `development` \| `test` \| `production` |
| `CORS_ORIGIN`    | No       | Allowed origin for CORS (e.g. frontend URL); if unset, allows all (`*`) |

Optional OAuth placeholders (e.g. `GOOGLE_CLIENT_ID`) are in `.env.example`; leave empty if unused.

---

## Setup and run

From the **backend** directory (or repo root with `npm run backend:dev`):

```bash
# Install dependencies (or from repo root: npm install)
npm install

# Copy env template and edit .env
cp .env.example .env

# Generate Prisma client and run migrations
npm run prisma:generate
npx prisma migrate deploy   # or: npm run prisma:migrate (interactive)

# (Optional) Seed database with sample data
npm run prisma:seed

# Development (with tsx)
npm run dev

# Production build and start (build runs prisma generate + tsc)
npm run build
npm start
```

The API is served at `http://localhost:4000` (or your `PORT`). Base path for all domain APIs is **`/api`** (e.g. `/api/health`, `/api/tenants`, `/api/students`). Interactive API docs (Swagger UI) are at **`/api-docs`**.

For full setup (including frontend and Docker), see the root **[LOCAL_SETUP.md](../LOCAL_SETUP.md)**.

---

## Database (Prisma)

- **Schema**: `prisma/schema.prisma` — defines Tenant, User, UserTenant, **Student** (person), **StudentTenant** (enrollment: student-in-tenant with indexNumber, programId), Program, Course, CourseOffering, Enrollment, ExamPeriod, ExamTerm, ExamRegistration, Tuition, Payment, Transcript, **Ticket**, **Notification**, etc.
- **Students model**: One **Student** (person) can have many **StudentTenant** enrollments (many-to-many with Tenant). List students = list enrollments for a tenant; create student = create person + one enrollment; delete = remove enrollment (or delete enrollment by ID).
- **Migrations**: `npx prisma migrate deploy` applies pending migrations. Use `npm run prisma:migrate` for interactive dev.
- **Seed**: `npm run prisma:seed` (or `npx prisma db seed`) runs `prisma/seed.ts`. It **clears existing data** then creates tenants, users (Platform Admin, School Admins, Professors), students + enrollments, programs, courses, exams, finance, records. Use only on dev/test DBs.

---

## API overview

| Area          | Base path           | Main endpoints (all under `/api`) |
|---------------|---------------------|------------------------------------|
| Health        | `/api/health`       | `GET /` → `{ status: 'ok' }` |
| **Auth**      | `/api`              | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/logout` |
| **Users**     | `/api/users`        | `GET /` (list by tenant), `GET /platform-admins`, `PATCH /:id`, `DELETE /:id` |
| Tenants       | `/api/tenants`      | `GET /`, `POST /` |
| **Students**  | `/api/students`     | `GET /` (list enrollments), `POST /` (create person + enrollment), `POST /:studentId/tenants` (add to tenant), `DELETE /enrollments/:enrollmentId`, `PATCH /:studentId` (person data) |
| Programs      | `/api/programs`     | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| Courses       | `/api/courses`      | `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| Exams         | `/api/exams`        | `GET/POST /periods`, `GET/POST /terms` |
| Finance       | `/api/finance`      | `GET/POST /tuitions`, `GET/POST /payments` |
| Records       | `/api/records`      | `GET/POST /transcripts` |
| **Tickets**   | `/api/tickets`      | `POST /` (submit bug report), `GET /` (list, filters), `PATCH /:id` (status, priority) |
| **Notifications** | `/api/notifications` | `GET /` (list for current user), `POST /mark-read` |

**Auth & Users (BRD §7.1):** No public registration. Only Platform Admin, School Admin, or Professor can create users (Professor only students, in own tenant(s)). List/edit/suspend/delete: Platform Admin or School Admin (School Admin scoped to own tenant). Suspended accounts cannot log in (403).

Protected routes require a valid **JWT** in `Authorization: Bearer <token>`, or in test mode the headers described below.

---

## Authentication and multi-tenancy

- **Tenant context**: Middleware reads `x-tenant-id`; authenticated routes also resolve tenant from JWT.
- **Protected routes**: Use the `authenticate` middleware:
  - **Normal mode**: `Authorization: Bearer <JWT>`. JWT is verified with `JWT_SECRET`; `req.tenantId` and `req.user` are set from the token.
  - **Test mode**: When `NODE_ENV=test` and `SKIP_AUTH_FOR_TESTS=1`, authentication can be bypassed with:
    - `x-test-tenant-id`: tenant ID (required for bypass)
    - `x-test-user-id`: optional user ID (default `test-user`)
    - `x-test-role`: optional role (default `SCHOOL_ADMIN`; use `PLATFORM_ADMIN`, `PROFESSOR`, etc.)
  No JWT is needed in test mode. Used only by the test suite.

Tenant-scoped APIs filter data by `tenantId` (from JWT or test headers).

---

## Unit tests

Unit tests live under `src/__tests__/unit/`. They **do not** hit the real server or database; they use mocks (e.g. Vitest `vi.fn()`) for repositories and dependencies.

**Coverage:**

- **Services**: Auth, Tenant, Students, Programs, Courses, Exams, Finance, Records, Tickets, Notifications — with mocked repositories.
- **Use cases**: e.g. `CreateTenantUseCase`; student creation logic is in `StudentsService` (duplicate index → 409).
- **Auth service**: register (409, 404, 201), login (401, 403, 200), listUsers, updateUser, deleteUser.
- **Middleware**: tenantContext, authenticate (401, test bypass), requireAdminOrSchoolAdmin, errorHandler.

**Run unit tests only (no DB required):**

```bash
npm run test:unit
```

---

## Integration tests

Integration tests live under `src/__tests__/integration/`. They send **real HTTP requests** to the Express app (Supertest) and use a **real PostgreSQL database** (`DATABASE_URL`).

**Coverage:**

- **Health**: `GET /api/health` → 200.
- **Auth & Users**: login, register, list users, platform-admins, PATCH, DELETE, suspend.
- **Tenants**: GET, POST; duplicate code → 409.
- **Students**: GET list, POST create (person + enrollment), duplicate index → 409, PATCH (person), DELETE enrollment, 404.
- **Programs, Courses, Exams, Finance, Records**: GET/POST (and PATCH/DELETE where applicable) with test tenant and headers.
- **Tickets**: POST create, validation, GET list, PATCH status/priority.
- **Notifications**: GET list (401 without auth, 200 with test user), mark-read (204, 401).

Tests use `x-test-tenant-id` and `x-test-user-id` (no real JWT). `vitest.setup.ts` sets `NODE_ENV=test` and `SKIP_AUTH_FOR_TESTS=1`.

**Run integration tests only (requires PostgreSQL and migrated DB):**

```bash
npm run test:integration
```

---

## Running tests

From the **backend** directory:

```bash
# All tests (unit + integration)
npm test

# Unit only (no database — mocks only)
npm run test:unit

# Integration only (requires PostgreSQL + migrated test DB)
npm run test:integration
```

- **Unit tests**: No database; they pass if the code and mocks are correct.
- **Integration tests**: Require a running PostgreSQL and `DATABASE_URL` pointing to a migrated database (e.g. test DB). If the DB is not available, run only `npm run test:unit`.

A detailed coverage table (which module has unit/integration tests and Swagger) is in **[project-doc/BACKEND_TEST_SWAGGER_COVERAGE.md](../project-doc/BACKEND_TEST_SWAGGER_COVERAGE.md)**.

---

## Scripts reference

| Script              | Description |
|---------------------|-------------|
| `dev`               | Run app in development (`tsx src/index.ts`). |
| `build`             | `prisma generate` + `tsc` → `dist/`. |
| `start`             | Run production build (`node dist/index.js`). |
| `test`              | Run all tests (unit + integration). |
| `test:unit`         | Unit tests only (no DB). |
| `test:integration`  | Integration tests only (requires DB). |
| `lint`              | ESLint on `src/**/*.ts`. |
| `prisma:migrate`    | `prisma migrate dev` (interactive). |
| `prisma:generate`   | Generate Prisma client. |
| `prisma:seed`       | Run seed script (clears and repopulates). |

From the **repo root**: `npm run backend:dev`, `npm run backend:test`, `npm run backend:test:unit`, etc.

---

## Swagger / OpenAPI

- **Spec**: `openapi.yaml` in the backend root describes all endpoints (Health, Auth, Users, Tenants, Students, Programs, Courses, Exams, Finance, Records, Tickets, Notifications), including request/response schemas and bearer JWT security. Paths are relative to base path `/api`.
- **Swagger UI**: Served at **`/api-docs`**. The app loads `openapi.yaml` and serves it via `swagger-ui-express`. Local: `http://localhost:4000/api-docs`.

Route files also use `@swagger` JSDoc comments for reference; the single source of truth for the docs is `openapi.yaml`.

---

## Docker

A **Dockerfile** in the backend root builds a production image:

- Multi-stage: build (npm ci, prisma generate, tsc) → runner (node, dist + prisma + node_modules).
- **CMD**: `npx prisma migrate deploy && node dist/index.js` (migrations run on container start; set `DATABASE_URL` at runtime).

From the **repo root**, `docker compose up --build` runs PostgreSQL + backend + frontend. See **[LOCAL_SETUP.md](../LOCAL_SETUP.md)** and root **docker-compose.yml**.

---

## Deploy (e.g. Render)

- **Build**: `npm install && npm run build` (build includes `prisma generate`).
- **Start**: `npm start` (`node dist/index.js`). On Render you can run migrations in a release phase: `npx prisma migrate deploy`.
- **Root directory**: Set to `backend` if the repo root is the project root.
- **Environment**: Set `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`. Optionally `CORS_ORIGIN` (frontend URL). Do not commit `.env`; use the platform’s env config.

---

This README describes the backend application, structure, configuration, APIs, auth, tests, OpenAPI, Docker, and deployment.
