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
- [Swagger / OpenAPI](#swagger--openapi)
- [Deploy (e.g. Render)](#deploy-eg-render)

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
│   │   ├── auth/        # Auth (login, register, me) + Users (list, PATCH, DELETE)
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
│       ├── helpers/     # mockRequest, mockResponse, mockNext
│       ├── unit/        # Unit tests (services, use cases, middleware)
│       └── integration/ # Integration tests (HTTP + DB)
├── openapi.yaml         # OpenAPI 3.0 spec (served as Swagger UI at /api-docs)
├── vitest.config.ts
├── vitest.setup.ts      # NODE_ENV=test, SKIP_AUTH_FOR_TESTS, DATABASE_URL
├── .env.example
└── package.json
```

**Build note:** Production build excludes test files (`src/__tests__`, `**/*.test.ts`, `**/*.spec.ts`) via `tsconfig.json`. Tests run only when executing the test suite.

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

# Production build and start (build runs prisma generate + tsc)
npm run build
npm start
```

The API is served at `http://localhost:4000` (or your `PORT`). Base path for all domain APIs is `/api` (e.g. `/api/health`, `/api/tenants`, `/api/students`). Interactive API docs (Swagger UI) are at **`/api-docs`**.

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
| **Auth** | `/api/auth`     | `POST /login`, `POST /register`, `GET /me`, `POST /forgot-password`, `POST /logout` |
| **Users**| `/api/users`   | `GET /` (list by tenant), `PATCH /:id` (edit, suspend), `DELETE /:id` |
| Tenants  | `/api/tenants`  | `GET /`, `POST /` (name, code) |
| Students | `/api/students` | `GET /`, `POST /` (indexNumber, firstName, lastName, optional programId) |
| Programs | `/api/programs` | `GET /`, `POST /` (name, code) |
| Courses  | `/api/courses`  | `GET /`, `POST /` (name, code, optional programId) |
| Exams    | `/api/exams`    | `GET/POST /periods`, `GET/POST /terms` |
| Finance  | `/api/finance`  | `GET/POST /tuitions`, `GET/POST /payments` |
| Records  | `/api/records`  | `GET/POST /transcripts` |

**Auth & Users rules (BRD §7.1):** No public registration. Only Platform Admin, School Admin, or Professor can create users (Professor only students, in own tenant(s)). List/edit/suspend/delete users: Platform Admin or School Admin only (School Admin scoped to own tenant). Suspended accounts cannot log in (403).

Protected routes require either a valid **JWT** in `Authorization: Bearer <token>` or, in test mode, the special headers described below.

---

## Authentication and multi-tenancy

- **Tenant context**: Middleware reads `x-tenant-id` from the request and sets `req.tenantId`. Authenticated routes also resolve tenant from JWT when not in test mode.
- **Protected routes**: Use the `authenticate` middleware. It expects:
  - **Normal mode**: `Authorization: Bearer <JWT>`. JWT is verified with `JWT_SECRET`; `req.tenantId` and `req.user` are set from the token.
  - **Test mode**: When `NODE_ENV=test` and `SKIP_AUTH_FOR_TESTS=1`, authentication can be bypassed by sending:
    - `x-test-tenant-id`: tenant ID (required for bypass)
    - `x-test-user-id`: optional user ID (defaults to `test-user`)
    - `x-test-role`: optional role (defaults to `SCHOOL_ADMIN`; use `PLATFORM_ADMIN`, `PROFESSOR`, etc. for role-specific tests)
  No JWT is needed in that case. This is used only by the test suite.

All tenant-scoped APIs filter data by `tenantId` (from JWT or test headers).

---

## Unit tests

Unit tests live under `src/__tests__/unit/`. They **do not** hit the real server or database. They use mocks (e.g. Vitest `vi.fn()`) for repositories and dependencies.

**What is tested:**

- **Use cases**: e.g. `CreateTenantUseCase`, `CreateStudentUseCase` — business rules, repository calls, and error cases (e.g. duplicate code → 409).
- **Services**: Tenant, Students, Programs, Courses, Exams, Finance, Records — list/create logic with mocked repositories.
- **Auth service**: `register` (409 duplicate email, 404 tenant not found, 201 success), `login` (401 invalid, 403 suspended, 200 success), `listUsers`, `updateUser` (404, 403 cross-tenant, 200), `deleteUser` (400 delete self, 404, 403, 204).
- **Middleware**:
  - `tenantContext`: sets `req.tenantId` from `x-tenant-id`.
  - `authenticate`: 401 when no/invalid token; in test mode, bypass when `x-test-tenant-id` is set; optional `x-test-role`.
  - `requireAdminOrSchoolAdmin` / `requireCanCreateUser`: 403 when role not allowed.
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
- **Auth & Users**: `auth.test.ts` — login (200, 401 invalid, 403 suspended), register (201 Platform Admin, 403 School Admin creating PLATFORM_ADMIN, 403 Professor creating non-STUDENT), GET /api/users (401, 403 Professor, 200 Platform/School Admin), PATCH /api/users/:id (200 edit, suspend), DELETE /api/users/:id (400 delete self, 204). Uses test bypass with `x-test-role` and real DB (tenant + users created in `beforeAll`).
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

# Unit only (no database needed — always passes if code is OK)
npm run test:unit

# Integration only (requires running PostgreSQL and migrated test DB)
npm run test:integration
```

**Will tests pass?**

- **Unit tests** (`npm run test:unit`): Do **not** use a real database. They use mocks and run in isolation. They will pass as long as the code compiles and the tests are up to date.
- **Integration tests** (`npm run test:integration`): Send real HTTP requests and use a **real PostgreSQL database**. They need:
  - PostgreSQL running locally (or a reachable DB).
  - A dedicated test database (e.g. `sms_test`) created and migrated.
  - `DATABASE_URL` set to that DB (e.g. in `.env` or in `vitest.setup.ts`; default in setup is `postgresql://test:test@localhost:5432/sms_test`).

If you don’t have a test DB locally, run only **`npm run test:unit`**; integration tests will still run (and pass) on CI when `TEST_DATABASE_URL` is set in GitHub Actions (or your CI) and the DB is migrated.

---

## Scripts reference

| Script              | Command                                      | Description |
|---------------------|----------------------------------------------|-------------|
| `dev`               | `tsx src/index.ts`                           | Run app in development (no build). |
| `build`             | `prisma generate && tsc -p tsconfig.json`    | Generate Prisma client and compile TypeScript to `dist/`. |
| `start`             | `node dist/index.js`                         | Run production build. |
| `test`              | `npx vitest run`                             | Run all tests (unit + integration). |
| `test:unit`         | `npx vitest run unit`                        | Run unit tests only (no DB required). |
| `test:integration`  | `npx vitest run integration`                 | Run integration tests only (requires test DB). |
| `lint`              | `eslint "src/**/*.ts"`                        | Lint TypeScript sources. |
| `prisma:migrate`    | `prisma migrate dev`                         | Apply migrations (interactive). |
| `prisma:generate`   | `prisma generate`                            | Generate Prisma client. |
| `prisma:seed`       | `tsx prisma/seed.ts`                         | Run seed script (clears and repopulates DB). |

From the **repository root** (npm workspaces), you can use root-level scripts such as `npm run backend:dev`, `npm run backend:test`, etc., if defined in the root `package.json`.

---

## Swagger / OpenAPI

- **OpenAPI spec**: `openapi.yaml` in the backend root describes all endpoints (Health, Auth, Users, Tenants, Students, Programs, Courses, Exams, Finance, Records), including request/response schemas and security (bearer JWT). Paths are relative to base path `/api`.
- **Swagger UI**: Served at **`/api-docs`**. The app loads `openapi.yaml` and serves it via `swagger-ui-express`. Locally: `http://localhost:4000/api-docs`. In production: `https://<your-backend-url>/api-docs`.
- **JSDoc in code**: Route files use `@swagger` JSDoc comments for the same endpoints; these can be used with `swagger-jsdoc` to generate the spec at runtime if you switch to a code-driven spec later.

---

## Deploy (e.g. Render)

- **Build command**: `npm install && npm run build` (build already includes `prisma generate`).
- **Start command**: `npm start` (runs `node dist/index.js`).
- **Root directory**: Set to `backend` if the repo root is the project root.
- **Environment variables**: Set `DATABASE_URL`, `JWT_SECRET`, and `SESSION_SECRET` in the service dashboard. Do not commit `.env`; use the platform’s env config.
- **Migrations**: Run Prisma migrations against the production DB before or as part of deploy (e.g. in CI: `npx prisma migrate deploy`), or via a release phase if the platform supports it.

---

This README describes the backend application, its layout, configuration, APIs, auth and multi-tenancy, tests, OpenAPI documentation, and deployment.
