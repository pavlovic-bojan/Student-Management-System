# Student Management System (SMS)
## Technical Design Document (TDD)

---

## 1. Document Purpose

Ovaj dokument definiše **tehnički dizajn** Multi-Tenant Student Management System platforme. TDD služi kao:

- Tehnički blueprint za implementaciju
- Referenca za API i domain model
- Osnova za test strategiju
- Ulaz za OpenAPI / API-first development

Usaglašen je sa [BRD.md](./BRD.md) i [HLD.md](./HLD.md).

---

## 2. System Overview

Sistem omogućava:

- Multi-tenant upravljanje obrazovnim institucijama (tenanti)
- CRUD za korisnike, studente, programe, kurseve, ispite, finansije, transkripte
- Bug reporting (tiketi) i obaveštenja (ticket + user-action)
- Vue 3 + Quasar SPA sa drawer-based UX

---

## 3. Architecture

### 3.1 Architectural Style

- **Modular monolith** (jedna backend aplikacija, domain moduli)
- Stateless REST API
- Multi-tenant architecture (shared schema, tenant_id)
- Pripremljen za buduću ekstrakciju u mikroservise

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

- **Tenant ID** u JWT (`tenantId` claim)
- **x-tenant-id** header za Platform Admin tenant switcher
- Middleware `tenantContext` postavlja `req.tenantId`
- Svi tenant-scoped upiti filtriraju po `tenantId`
- Repository/Services primaju `tenantId` eksplicitno gde je potrebno

---

## 6. Domain Model (Prisma)

### 6.1 Core Entities

#### User
- id, email, password, firstName, lastName, role (UserRole), tenantId, suspended
- Relacije: tenant, userTenants (UserTenant), tickets, notifications

#### Tenant
- id, name, code (unique), isActive, createdAt, updatedAt
- Relacije: users, programs, courses, tickets, itd.

#### UserTenant
- userId, tenantId (professor na više institucija)

#### Student
- id, firstName, lastName, status (ACTIVE, GRADUATED, DROPPED, SUSPENDED)
- Relacije: studentTenants, enrollments, transcripts, payments

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

- `/api` (npr. `http://localhost:4000/api`)

### 7.2 Authentication

- **Bearer JWT** u `Authorization` header-u
- JWT sadrži: `sub` (userId), `tenantId`, `role`
- Nezaštićene rute: `/auth/login`, `/auth/forgot-password`, `/api/health`
- Ostale rute zahtevaju `authenticate` middleware

### 7.3 Authorization Middleware

| Middleware | Svrha |
|------------|-------|
| `authenticate` | Proverava JWT, postavlja req.user |
| `tenantContext` | Proverava tenant kontekst (Platform Admin mora imati x-tenant-id za neke rute) |
| `requirePlatformAdmin` | Samo PLATFORM_ADMIN |
| `requireAdminOrSchoolAdmin` | PLATFORM_ADMIN ili SCHOOL_ADMIN |
| `requireCanCreateUser` | Platform Admin, School Admin ili Professor |

### 7.4 Error Model

| Code | Značenje |
|------|----------|
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Forbidden (role/tenant) |
| 404 | Entity not found |
| 409 | Conflict (duplicate code, email, itd.) |
| 429 | Rate limit (npr. ticket cooldown) |
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
- CRUD operacije po domenu, tenant-scoped

### 8.5 Tickets Service
- createTicket (rate limit), listTickets (filter za School Admin: exclude Platform Admin tickets), updateTicket

### 8.6 Notifications Service
- listNotificationsForUser, markNotificationsRead

---

## 9. Frontend Architecture

### 9.1 Structure

```
frontend/src/
  api/          # API clienti (axios), per-domain (auth, tenants, students, ...)
  components/   # Reusable components (DarkModeToggle, ...)
  layouts/      # AuthLayout, MainLayout
  pages/        # Route components (LoginPage, TenantsPage, StudentsPage, ...)
  router/       # Vue Router, guards (requireAuth, requirePlatformAdmin, ...)
  stores/       # Pinia stores (auth, tenants, students, ...)
  locales/      # i18n (en, sr-lat, sr-cyr)
```

### 9.2 Router Guards

- `requireAuth` – za zaštićene rute
- `guestOnly` – za login/register
- `requirePlatformAdmin` – za /tenants
- `requireAdminOrSchoolAdmin` – za /users
- `requireCanCreateUser` – za create user/student

### 9.3 UX Pattern

- **Drawers** za sve CRUD forme (ne modali)
- **QTable** za liste sa sortiranjem, filterima, paginacijom
- **Tenant switcher** u header-u za Platform Admin
- **i18n** – svi stringovi preko `t('key')`

---

## 10. Concurrency & Consistency

- ACID transakcije (Prisma)
- Unique constraints u DB (code, email, indexNumber u tenantu)
- Optimistic UI ažuriranja gde je moguće
- Ticket cooldown per user (60s)

---

## 11. Test Strategy

### 11.1 Backend Unit Tests
- Service logic (auth, tenants, students, tickets, itd.)
- Middleware (authenticate, requirePlatformAdmin, tenantContext)

### 11.2 Backend Integration Tests
- REST endpoints sa test DB (SKIP_AUTH_FOR_TESTS, x-test-user-id, x-test-tenant-id, x-test-role)

### 11.3 Frontend Unit Tests
- Store logika (auth, tenants, students, itd.)
- Router guards

### 11.4 Frontend Component Tests
- Smoke testovi za stranice (mount sa Quasar, i18n, Pinia)
- DarkModeToggle, MainLayout, itd.

### 11.5 E2E & Performance
- Playwright (future)
- k6 load tests (future)

---

## 12. Security Considerations

- bcrypt za lozinke (SALT_ROUNDS=10)
- JWT expiration (7d)
- Input validation (express-validator)
- Tenant isolation u svim query-ima
- Suspendirani korisnici: 403 na login
- Self-delete zabranjen

---

## 13. Observability

- Health check: `GET /api/health` → `{ status: "ok" }`
- Error handling middleware (centralized)
- Swagger/OpenAPI dokumentacija u `backend/openapi.yaml`
- Future: structured logging, metrics, tracing

---

## 14. Deployment & Operations

- **Backend**: Docker image, env: DATABASE_URL, JWT_SECRET
- **Frontend**: Vite build → static files, Vercel rewrites za SPA
- **Database**: Prisma migrate deploy

---

## 15. Future Extensions

- Event-driven messaging (RabbitMQ/Kafka) za decoupling
- Ekstrakcija domena u mikroservise
- E2E testovi (Playwright)
- k6 performance testovi
- Payment gateway integracija
- SSO / OAuth2 providers

---

## 16. Appendix: OpenAPI

Puna API specifikacija je u [docs/OpenAPI.yaml](./OpenAPI.yaml) i `backend/openapi.yaml`.
