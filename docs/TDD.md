# Student Management System (SMS)
## Technical Design Document (TDD)

---

## 1. Document Purpose

This document defines the **technical design** of the Multi-Tenant Student Management System platform. The TDD serves as:

- Technical blueprint for implementation
- Reference for API and domain model
- Basis for test strategy
- Input for OpenAPI / API-first development

It is aligned with [BRD.md](./BRD.md) and [HLD.md](./HLD.md).

---

## 2. System Overview

The system provides:

- Multi-tenant management of educational institutions (tenants)
- CRUD for users, students, programs, courses, exams, finances, transcripts
- Bug reporting (tickets) and notifications (ticket + user-action)
- Vue 3 + Quasar SPA with drawer-based UX

---

## 3. Architecture

### 3.1 Architectural Style

- **Modular monolith** (single backend application, domain modules)
- Stateless REST API
- Multi-tenant architecture (shared schema, tenant_id)
- Prepared for future extraction into microservices

### 3.2 Logical Components

- API Layer (Express routes, middleware)
- Service Layer (business logic)
- Repository Layer (data access, Prisma)
- Auth & RBAC middleware
- Tenant context middleware
- Error handling middleware

---

## 4. Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, TypeScript |
| **API** | REST, OpenAPI 3 |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **Validation** | express-validator |
| **Frontend** | Vue 3, Quasar 2, Pinia, Vue Router, Vite |
| **i18n** | vue-i18n (en, sr-lat, sr-cyr) |
| **Testing** | Vitest, @vue/test-utils |
| **Migrations** | Prisma Migrate |
| **Deployment** | Docker, Vercel (frontend) |

---

## 5. Multi-Tenancy Strategy

- **Tenant ID** in JWT (`tenantId` claim)
- **x-tenant-id** header for Platform Admin tenant switcher
- Middleware `tenantContext` sets `req.tenantId`
- All tenant-scoped queries filter by `tenantId`
- Repository/Services receive `tenantId` explicitly where needed

---

## 6. Domain Model (Prisma)

### 6.1 Core Entities

#### User
- id, email, password, firstName, lastName, role (UserRole), tenantId, suspended
- Relations: tenant, userTenants (UserTenant), tickets, notifications

#### Tenant
- id, name, code (unique), isActive, createdAt, updatedAt
- Relations: users, programs, courses, tickets, etc.

#### UserTenant
- userId, tenantId (professor at multiple institutions)

#### Student
- id, firstName, lastName, status (ACTIVE, GRADUATED, DROPPED, SUSPENDED)
- Relations: studentTenants, enrollments, transcripts, payments

#### StudentTenant (enrollment)
- id, studentId, tenantId, indexNumber, programId
- Unique: (tenantId, indexNumber)

#### Program
- id, name, code, tenantId, version, isActive
- Unique: (tenantId, code, version)

#### Course
- id, name, code, tenantId, programId, professorId
- Unique: (tenantId, code)

#### CourseOffering
- id, courseId, term, year
- Unique: (courseId, term, year)

#### Enrollment
- studentId, courseOfferingId
- Unique: (studentId, courseOfferingId)

#### ExamPeriod, ExamTerm, ExamRegistration
#### Tuition, Payment, Transcript
#### Ticket, Notification

---

## 7. API Design

### 7.1 Base Path

- `/api` (e.g. `http://localhost:4000/api`)

### 7.2 Authentication

- **Bearer JWT** in `Authorization` header
- JWT contains: `sub` (userId), `tenantId`, `role`
- Unprotected routes: `/auth/login`, `/auth/forgot-password`, `/api/health`
- Other routes require `authenticate` middleware

### 7.3 Authorization Middleware

| Middleware | Purpose |
|------------|---------|
| `authenticate` | Validates JWT, sets req.user |
| `tenantContext` | Validates tenant context (Platform Admin must have x-tenant-id for some routes) |
| `requirePlatformAdmin` | PLATFORM_ADMIN only |
| `requireAdminOrSchoolAdmin` | PLATFORM_ADMIN or SCHOOL_ADMIN |
| `requireCanCreateUser` | Platform Admin, School Admin, or Professor |

### 7.4 Error Model

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Forbidden (role/tenant) |
| 404 | Entity not found |
| 409 | Conflict (duplicate code, email, etc.) |
| 429 | Rate limit (e.g. ticket cooldown) |
| 500 | Internal server error |

---

## 8. Service Layer Design

### 8.1 Auth Service
- Login, register (create user), getMe, forgotPassword
- createUserActionNotificationsForPlatformAdmins
- createUserEditedNotificationForUserBySchoolAdmin
- List users, update user, delete user

### 8.2 Tenant Service
- listTenants, createTenant, updateTenant (Platform Admin only)

### 8.3 Students Service
- listStudents, createStudent, addStudentToTenant, deleteEnrollment, updateStudent

### 8.4 Programs, Courses, Exams, Finance, Records
- CRUD operations per domain, tenant-scoped

### 8.5 Tickets Service
- createTicket (rate limit), listTickets (filter for School Admin: exclude Platform Admin tickets), updateTicket

### 8.6 Notifications Service
- listNotificationsForUser, markNotificationsRead

---

## 9. Frontend Architecture

### 9.1 Structure

```
frontend/src/
  api/          # API clients (axios), per-domain (auth, tenants, students, ...)
  components/   # Reusable components (DarkModeToggle, ...)
  layouts/      # AuthLayout, MainLayout
  pages/        # Route components (LoginPage, TenantsPage, StudentsPage, ...)
  router/       # Vue Router, guards (requireAuth, requirePlatformAdmin, ...)
  stores/       # Pinia stores (auth, tenants, students, ...)
  locales/      # i18n (en, sr-lat, sr-cyr)
```

### 9.2 Router Guards

- `requireAuth` – for protected routes
- `guestOnly` – for login/register
- `requirePlatformAdmin` – for /tenants
- `requireAdminOrSchoolAdmin` – for /users
- `requireCanCreateUser` – for create user/student

### 9.3 UX Pattern

- **Drawers** for all CRUD forms (not modals)
- **QTable** for lists with sorting, filters, pagination
- **Tenant switcher** in header for Platform Admin
- **i18n** – all strings via `t('key')`

---

## 10. Concurrency & Consistency

- ACID transactions (Prisma)
- Unique constraints in DB (code, email, indexNumber within tenant)
- Optimistic UI updates where possible
- Ticket cooldown per user (60s)

---

## 11. Test Strategy

### 11.1 Backend Unit Tests
- Service logic (auth, tenants, students, tickets, etc.)
- Middleware (authenticate, requirePlatformAdmin, tenantContext)

### 11.2 Backend Integration Tests
- REST endpoints with test DB (SKIP_AUTH_FOR_TESTS, x-test-user-id, x-test-tenant-id, x-test-role)

### 11.3 Frontend Unit Tests
- Store logic (auth, tenants, students, etc.)
- Router guards

### 11.4 Frontend Component Tests
- Smoke tests for pages (mount with Quasar, i18n, Pinia)
- DarkModeToggle, MainLayout, etc.

### 11.5 E2E & Performance
- Playwright (implemented)
- k6 load tests (implemented)

---

## 12. Security Considerations

- bcrypt for passwords (SALT_ROUNDS=10)
- JWT expiration (7d)
- Input validation (express-validator)
- Tenant isolation in all queries
- Suspended users: 403 on login
- Self-delete forbidden

---

## 13. Observability

- Health check: `GET /api/health` → `{ status: "ok" }`
- Error handling middleware (centralized)
- Swagger/OpenAPI documentation in `backend/openapi.yaml`
- Future: structured logging, metrics, tracing

---

## 14. Deployment & Operations

- **Backend**: Docker image, env: DATABASE_URL, JWT_SECRET
- **Frontend**: Vite build → static files, Vercel rewrites for SPA
- **Database**: Prisma migrate deploy

---

## 15. Future Extensions

- Event-driven messaging (RabbitMQ/Kafka) for decoupling
- Domain extraction into microservices
- Payment gateway integration
- SSO / OAuth2 providers

---

## 16. Appendix: OpenAPI

Full API specification is in [docs/OpenAPI.yaml](./OpenAPI.yaml) and `backend/openapi.yaml`.