# Student Management System — Backend

Backend for the multi-tenant Student Management System (SMS). Built with **Express**, **TypeScript**, **Prisma**, and **PostgreSQL**. It exposes REST APIs for tenants, students, programs, courses, exams, finance, and records.

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

---

## Tech stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript (strict)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: express-validator
- **Auth**: JWT (jsonwebtoken), optional test bypass via headers
- **Testing**: Vitest, Supertest
- **Logging**: Winston

---

## Project structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema and models
│   └── seed.ts          # Seed script (tenants, students, etc.)
├── src/
│   ├── config/          # Environment and app config
│   ├── middleware/      # tenantContext, authenticate, errorHandler
│   ├── modules/         # Feature modules (per domain)
│   │   ├── health/      # Health check
│   │   ├── tenant/      # Tenants CRUD
│   │   ├── students/    # Students CRUD
│   │   ├── programs/    # Programs CRUD
│   │   ├── courses/     # Courses CRUD
│   │   ├── exams/       # Exam periods & terms
│   │   ├── finance/     # Tuitions & payments
│   │   └── records/     # Transcripts
│   ├── prisma/          # Prisma client singleton
│   ├── utils/           # Logger, etc.
│   ├── server.ts        # Express app (no listen — for tests)
│   ├── index.ts         # Entry point (listens on PORT)
│   └── __tests__/
│       ├── helpers/      # mockRequest, mockResponse, mockNext
│       ├── unit/        # Unit tests (services, use cases, middleware)
│       └── integration/  # Integration tests (HTTP + DB)
├── vitest.config.ts
├── vitest.setup.ts      # NODE_ENV=test, SKIP_AUTH_FOR_TESTS, DATABASE_URL
├── .env.example
└── package.json
```

Each feature module typically has: **routes**, **controller**, **service**, **repository** (interface + Prisma impl), **DTOs**, **model**, and optionally **use-cases** and **factory** for dependency injection.

---

## Environment variables

Copy `.env.example` to `.env` and set values locally (never commit `.env`).

| Variable         | Required | Description |
|------------------|----------|-------------|
| `DATABASE_URL`   | Yes      | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/sms_db`) |
| `DIRECT_URL`     | No       | Direct DB URL for migrations (can equal `DATABASE_URL`) |
| `JWT_SECRET`     | Yes      | Secret for signing/verifying JWT (min 32 chars) |
| `SESSION_SECRET`| Yes      | Session secret (min 32 chars) |
| `PORT`           | No       | Server port (default `4000`) |
| `NODE_ENV`       | No       | `development` \| `test` \| `production` |

Optional OAuth placeholders (e.g. `GOOGLE_CLIENT_ID`) are in `.env.example`; leave empty if unused.

---

## Setup and run

From the **backend** directory:

```bash
# Install dependencies (or from repo root: npm install)
npm install

# Copy env template and edit .env
cp .env.example .env

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed

# Development (with tsx)
npm run dev

# Production build and start
npm run build
npm start
```

The API is served at `http://localhost:4000` (or your `PORT`). Base path for all domain APIs is `/api` (e.g. `/api/health`, `/api/tenants`, `/api/students`).

---

## Database (Prisma)

- **Schema**: `prisma/schema.prisma` — defines Tenant, User, Student, Program, Course, CourseOffering, Enrollment, ExamPeriod, ExamTerm, ExamRegistration, Tuition, Payment, Transcript, etc.
- **Migrations**: `npm run prisma:migrate` applies migrations and keeps the DB in sync.
- **Seed**: `npm run prisma:seed` (or `npx prisma db seed`) runs `prisma/seed.ts`. It **clears existing data** then creates a large dataset (e.g. many tenants, students per tenant, programs, courses, enrollments, payments, exam data, transcripts). Use only on dev/test DBs.

---

## API overview

| Area     | Base path      | Main endpoints (all under `/api`) |
|----------|----------------|------------------------------------|
| Health   | `/api/health`   | `GET /` → `{ status: 'ok' }` |
| Tenants  | `/api/tenants`  | `GET /`, `POST /` (name, code) |
| Students | `/api/students` | `GET /`, `POST /` (indexNumber, firstName, lastName, optional programId) |
| Programs | `/api/programs` | `GET /`, `POST /` (name, code) |
| Courses  | `/api/courses`  | `GET /`, `POST /` (name, code, optional programId) |
| Exams    | `/api/exams`    | `GET/POST /periods`, `GET/POST /terms` |
| Finance  | `/api/finance`  | `GET/POST /tuitions`, `GET/POST /payments` |
| Records  | `/api/records`  | `GET/POST /transcripts` |

Protected routes require either a valid **JWT** in `Authorization: Bearer <token>` or, in test mode, the special headers described below.

---

## Authentication and multi-tenancy

- **Tenant context**: Middleware reads `x-tenant-id` from the request and sets `req.tenantId`. Authenticated routes also resolve tenant from JWT when not in test mode.
- **Protected routes**: Use the `authenticate` middleware. It expects:
  - **Normal mode**: `Authorization: Bearer <JWT>`. JWT is verified with `JWT_SECRET`; `req.tenantId` and `req.user` are set from the token.
  - **Test mode**: When `NODE_ENV=test` and `SKIP_AUTH_FOR_TESTS=1`, authentication can be bypassed by sending:
    - `x-test-tenant-id`: tenant ID (required for bypass)
    - `x-test-user-id`: optional user ID (defaults to `test-user`)
  No JWT is needed in that case. This is used only by the test suite.

All tenant-scoped APIs filter data by `tenantId` (from JWT or test headers).

---

## Unit tests

Unit tests live under `src/__tests__/unit/`. They **do not** hit the real server or database. They use mocks (e.g. Vitest `vi.fn()`) for repositories and dependencies.

**What is tested:**

- **Use cases**: e.g. `CreateTenantUseCase`, `CreateStudentUseCase` — business rules, repository calls, and error cases (e.g. duplicate code → 409).
- **Services**: Tenant, Students, Programs, Courses, Exams, Finance, Records — list/create logic with mocked repositories.
- **Middleware**:
  - `tenantContext`: sets `req.tenantId` from `x-tenant-id`.
  - `authenticate`: 401 when no/invalid token; in test mode, bypass when `x-test-tenant-id` is set.
  - `errorHandler`: maps `ApiError` to status codes and JSON body.

**Helpers:** `src/__tests__/helpers/testHelpers.ts` provides `mockRequest`, `mockResponse`, and `mockNext()` for controller/middleware tests.

**Run unit tests only:**

```bash
npm run test:unit
# or
npx vitest run --testPathPattern=unit
```

---

## Integration tests

Integration tests live under `src/__tests__/integration/`. They send **real HTTP requests** to the Express app (via Supertest) and use a **real PostgreSQL database** (the one pointed to by `DATABASE_URL` in test, often a separate `sms_test` DB).

**What is tested:**

- **Health**: `GET /api/health` returns 200 and `{ status: 'ok' }`.
- **Tenants**: `GET /api/tenants`, `POST /api/tenants`; duplicate code returns 409.
- **Students**: 401 without auth; with `x-test-tenant-id` + `x-test-user-id`, GET list and POST create; duplicate index in same tenant returns 409; 400 when tenant context is missing.
- **Programs, Courses, Exams, Finance, Records**: For each, create a tenant (and any required entities) in `beforeAll`, then call GET/POST with test headers; assert status codes and response shape; cleanup in `afterAll`.

**Test auth:** Integration tests do **not** use a real JWT. They set:

- `x-test-tenant-id`: tenant ID (e.g. created in `beforeAll`)
- `x-test-user-id`: e.g. `'test-user'`

So the app must be run with `NODE_ENV=test` and `SKIP_AUTH_FOR_TESTS=1`. These are set in `vitest.setup.ts`, so when you run Vitest, the test env is applied automatically.

**Database:** Use a dedicated test database (e.g. `sms_test`). Set `DATABASE_URL` in `.env` or in `vitest.setup.ts` (default there is `postgresql://test:test@localhost:5432/sms_test`). Run migrations on that DB before integration tests. Tests create/delete data (tenants, students, etc.) and should leave the DB in a clean state (cleanup in `afterAll`).

**Run integration tests only:**

```bash
npm run test:integration
# or
npx vitest run --testPathPattern=integration
```

---

## Running tests

From the **backend** directory:

```bash
# All tests (unit + integration)
npm test
# or
npx vitest run

# Unit only
npm run test:unit

# Integration only (requires running PostgreSQL and migrated test DB)
npm run test:integration
```

Ensure PostgreSQL is running and that the test database exists and is migrated. If you use a different test DB URL, set `DATABASE_URL` (and optionally `JWT_SECRET`, `SESSION_SECRET`) so that `vitest.setup.ts` or your env leaves the app in test mode with the correct DB.

---

## Scripts reference

| Script              | Command                      | Description |
|---------------------|------------------------------|-------------|
| `dev`               | `tsx src/server.ts`          | Run app in development (no build). |
| `build`             | `tsc -p tsconfig.json`       | Compile TypeScript to `dist/`. |
| `start`             | `node dist/server.js`        | Run production build. |
| `test`              | `npx vitest run`             | Run all tests. |
| `test:unit`         | `npx vitest run --testPathPattern=unit` | Run unit tests only. |
| `test:integration`  | `npx vitest run --testPathPattern=integration` | Run integration tests only. |
| `lint`              | `eslint "src/**/*.ts"`       | Lint TypeScript sources. |
| `prisma:migrate`    | `prisma migrate dev`         | Apply migrations (interactive). |
| `prisma:generate`   | `prisma generate`           | Generate Prisma client. |
| `prisma:seed`       | `tsx prisma/seed.ts`         | Run seed script (clears and repopulates DB). |

From the **repository root** (npm workspaces), you can use root-level scripts such as `npm run backend:dev`, `npm run backend:test`, `npm run backend:test:unit`, `npm run backend:test:integration`, etc., if defined in the root `package.json`.

---

This README describes the backend application, its layout, configuration, APIs, auth and multi-tenancy, and how unit and integration tests are structured and run.
