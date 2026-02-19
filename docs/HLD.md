# Student Management System (SMS)
## High-Level Design (HLD)

---

## 1. Purpose of This Document

This document describes the **High-Level Design (HLD)** of the **Multi-Tenant Student Management System (SMS)**. The purpose is to:

- Define the system architecture of the SaaS
- Describe how the system scales, integrates, and enforces multi-tenancy
- Set clear domain and module boundaries
- Enable future evolution (e.g., microservice extraction)

This document is:

- Above TDD
- Below PRD / BRD
- Aligned with BRD (§1–15) and current implementation

---

## 2. System Overview

The Student Management System is a **multi-tenant, enterprise-grade SaaS** for managing administrative and academic student data across universities, colleges, and schools.

The system enables:

- **Platform Admins** to manage tenants (institutions) and users across all tenants
- **School Admins** to manage students, programs, courses, exams, finance, and records for their institution
- **Professors** to manage courses, exam grading, and create students within their tenant(s)
- **Students** to view enrollments, exam registrations, transcripts, and financial data

The UI is a **Vue 3 + Quasar SPA** with drawer-based navigation and CRUD. The backend is a **Node.js + Express** REST API with Prisma ORM and PostgreSQL.

---

## 3. Architectural Principles

- Multi-tenant first (tenant isolation at all layers)
- RESTful API-first
- Domain-driven module boundaries
- Stateless API layer
- JWT authentication with tenant context
- Role-based access control (RBAC)
- Drawer-based UX pattern (no modals for CRUD)
- Cloud-ready (Docker, Vercel, etc.)

---

## 4. System Context

### 4.1 External Actors & Systems

| Actor | Role |
|-------|------|
| **Platform Admin** | Tenant management, user management across tenants, platform oversight |
| **School Admin** | CRUD for students, programs, courses, exams, finance, records within own tenant |
| **Professor** | Exam grading, course assignments, create students in own tenant(s) |
| **Student** | View enrollments, exams, transcripts, payments |
| **External Integrations** | (Future) LMS, payment gateways, SSO |

---

## 5. High-Level Architecture

### 5.1 Architectural Style

- **Modular monolith** (single backend app, domain-based modules)
- Prepared for future microservice extraction
- Stateless API layer
- Shared PostgreSQL database with tenant-scoped queries

### 5.2 Logical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Vue 3 + Quasar)                     │
│  SPA | Pinia | Vue Router | i18n (en, sr-lat, sr-cyr)           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express)                      │
│  authenticate | tenantContext | requirePlatformAdmin | etc.      │
├─────────────────────────────────────────────────────────────────┤
│  Auth  │ Tenants │ Users │ Students │ Programs │ Courses         │
│  Exams │ Finance │ Records │ Tickets │ Notifications             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Prisma ORM)                       │
│  Shared schema, tenant_id on all tenant-scoped entities          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Core Domains & Responsibilities

| Domain | Responsibility |
|--------|----------------|
| **Auth** | Login, JWT, user creation rules (BRD §7.1), list/edit/suspend/delete users |
| **Tenants** | Tenant CRUD (Platform Admin only, BRD §7.0) |
| **Students** | Student CRUD, enrollments (StudentTenant), status, multi-tenant enrollments |
| **Programs** | Academic program CRUD, versioning |
| **Courses** | Course CRUD, course offerings, professor assignment, enrollments |
| **Exams** | Exam periods, exam terms, registrations, grading |
| **Finance** | Tuitions, payments |
| **Records** | Transcripts, GPA |
| **Tickets** | Bug reports (submit, list, update status/priority), rate limiting |
| **Notifications** | User-action notifications, ticket notifications (polling on frontend) |

---

## 7. Multi-Tenancy Architecture

### 7.1 Tenant Model

- **Tenant** = educational institution (university, college, school)
- Fields: `id`, `name`, `code` (unique), `isActive`, `createdAt`, `updatedAt`
- Only **Platform Admin** can create, update, or deactivate tenants (BRD §7.0)

### 7.2 Tenant Context Propagation

- JWT contains `sub` (userId), `tenantId`, `role`
- Request header `x-tenant-id` used for Platform Admin tenant switcher
- Middleware `tenantContext` resolves tenant per request
- All tenant-scoped queries filter by `tenantId`

### 7.3 Tenant Isolation

- Shared schema with `tenantId` column on all tenant-scoped entities
- Query-level enforcement (Prisma `where: { tenantId }`)
- Platform Admin: can switch tenant via `x-tenant-id`
- School Admin / Professor / Student: use own `tenantId` from JWT
- User creation rules enforce tenant scope (BRD §7.1)

---

## 8. Data Architecture

### 8.1 Database Strategy

- Single PostgreSQL database
- Shared schema, tenant-aware tables
- Prisma ORM with migrations
- Strong indexing on `tenantId` and frequently queried fields

### 8.2 Key Entities

- **User**, **Tenant**, **UserTenant** (professor multi-tenant)
- **Student**, **StudentTenant** (enrollment = student in tenant)
- **Program**, **Course**, **CourseOffering**, **Enrollment**
- **ExamPeriod**, **ExamTerm**, **ExamRegistration**
- **Tuition**, **Payment**, **Transcript**
- **Ticket** (bug reports), **Notification** (user actions)

---

## 9. Integration Architecture

### 9.1 API Strategy

- RESTful API, OpenAPI 3 documented
- Base path `/api`
- JSON payloads
- JWT Bearer authentication
- Standard HTTP status codes (400, 401, 403, 404, 409, 429, 500)

### 9.2 Frontend-Backend Integration

- Axios client with `Authorization: Bearer <token>` and `x-tenant-id`
- Pinia stores per domain (auth, tenants, students, programs, etc.)
- 401 triggers logout and redirect to login

---

## 10. Deployment Architecture

### 10.1 Runtime Environment

- **Frontend**: Static SPA (Vite build), deployable to Vercel / Netlify / nginx
- **Backend**: Node.js process, deployable to Render / Railway / Docker
- **Database**: PostgreSQL (e.g., Neon, Supabase, or self-hosted)

### 10.2 Scalability

- Stateless API (horizontal scaling)
- Database connection pooling
- Optional read replicas for DB
- Future: extract domains into microservices

---

## 11. Security Architecture

### 11.1 Authentication & Authorization

- **JWT** with `sub`, `tenantId`, `role`
- **RBAC**: PLATFORM_ADMIN, SCHOOL_ADMIN, PROFESSOR, STUDENT
- Guards: `requireAuth`, `requirePlatformAdmin`, `requireAdminOrSchoolAdmin`, `requireCanCreateUser`
- Suspended users receive 403 on login

### 11.2 Security Controls

- bcrypt for password hashing
- Input validation (express-validator)
- Tenant isolation enforced at service layer
- No hard delete for tenants (deactivate only)

---

## 12. Observability

### 12.1 Logging

- Structured logging
- Error handling middleware
- Request/response logging (optional)

### 12.2 Health

- `GET /api/health` returns `{ status: "ok" }`

### 12.3 Future

- Prometheus metrics
- Centralized logging (ELK)
- Distributed tracing

---

## 13. Notifications Architecture

### 13.1 Ticket Notifications (Bug Reports)

- Frontend polls `GET /tickets?status=NEW` (admins only)
- **Platform Admin**: sees all platform-level tickets (created by Platform Admin)
- **School Admin**: sees only own tenant's tickets, excluding Platform Admin-created ones
- **Professor / Student**: no ticket notifications

### 13.2 User-Action Notifications

- Backend creates `Notification` records on user create/update/delete
- **Platform Admin** actions → School Admins of target tenant notified
- **School Admin** update → target user notified
- Frontend polls `GET /notifications` for current user
- Badge shows unread count; "Mark all as read" clears local state and marks via API

---

## 14. Non-Goals (Current Phase)

- Native mobile apps
- Event-driven messaging (RabbitMQ/Kafka)
- HR/payroll modules
- Public user registration
- Payment gateway integration (Stripe, etc.)

---

## 15. Summary

This HLD defines:

- Multi-tenant, RESTful Student Management System
- Modular monolith backend (Node.js + Express + Prisma)
- Vue 3 + Quasar SPA with drawer-based UX
- Clear domain boundaries and RBAC
- Tenant isolation and notification rules per BRD §7

The document is aligned with BRD and the implemented codebase.
