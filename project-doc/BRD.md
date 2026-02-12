# Business Requirements Document (BRD)

**Multi-Tenant Student Management System (SMS) - Enterprise SaaS**  
**Architecture with UI Wireframes and Detailed Epics**  
**Date: February 4, 2026**

---

## 1. Executive Summary

The Student Management System (SMS) is a multi-tenant, enterprise-grade SaaS platform for managing administrative and academic student data across universities, colleges, and schools.

The platform is:
- **Microservices-ready and cloud-ready**, with independent scaling per domain.
- Built around a **Vue 3 + Quasar** frontend with drawer-based UX.
- Designed for **large, distributed teams** with clear service boundaries, observability, and CI/CD.

Key goals:
- Secure multi-tenancy and tenant isolation.
- Robust CRUD operations for core domains (students, programs, courses, exams, finance, records).
- High-quality UX with Quasar components and responsive design.
- Strong testing strategy (unit, integration, E2E with Playwright, performance with k6).

Success metrics:
- **Availability**: 99.9% uptime.
- **Performance**: \<200ms P95 API response time.
- **Quality**: E2E test coverage \>90% for critical flows.

---

## 2. Purpose and Objectives

The SMS exists to centralize and streamline academic and administrative processes for multiple educational institutions in a single SaaS platform.

**Objectives:**
- Provide a **multi-tenant** platform where each institution (tenant) manages its own data securely.
- Support end-to-end workflows: student lifecycle, programs, courses, exams, finance, and records.
- Expose **well-documented REST APIs** for integration with external systems.
- Offer an **intuitive web UI** (Vue 3 + Quasar) with consistent drawer-based patterns for navigation and CRUD.
- Enable **independent development and deployment** of each functional domain (microservices).

---

## 3. Stakeholders

| Role           | Responsibilities                                   |
|----------------|----------------------------------------------------|
| Platform Admin | Tenant management, system oversight                |
| School Admin   | CRUD for students, programs, courses, finance      |
| Professor      | Exam grading, course assignments, attendance       |
| Student        | Enrollment, exam registration, transcript access   |
| QA Lead        | Test strategy, Playwright and k6 suites            |

---

## 4. Scope

**In Scope:**
- Multi-tenant backend microservices:
  - Auth, Students, Programs, Courses, Exams, Finance, Records
- API Gateway with:
  - Auth, routing, logging, tenant propagation, rate limiting
- Frontend:
  - Vue 3 + Quasar SPA with drawer-based navigation and CRUD
- Monorepo structure for apps and shared packages
- Testing:
  - Unit, integration, DB tests
  - E2E tests with Playwright
  - Performance/load tests with k6
- Observability:
  - Centralized logging, metrics, dashboards

**Out of Scope:**
- HR/payroll modules
- Native mobile apps
- On-premise installations (initially cloud-first)

---

## 5. Technology Stack & Architecture Constraints

### Frontend
- **Vue 3 + Quasar** (TypeScript)
- Component-based architecture
- **Quasar components used throughout**:
  - Tables, Cards, Forms, Drawers, Buttons, Alerts, Banners
- **Drawers instead of popups/modals** for navigation and CRUD forms
- State management: Pinia (or Vuex if required)
- Full i18n-ready design

### Backend Microservices
- **Node.js + Express** per service
- **TypeScript** everywhere
- **Prisma ORM** with PostgreSQL:
  - Per-service schema or DB (depending on deployment model)
- RESTful APIs
- Optional event-driven communication (RabbitMQ / Kafka) between services

### Architecture Style
- Microservices-based backend with API Gateway
- Domain-driven design:
  - Each bounded context = independent service (Auth, Students, Programs, etc.)
- Multi-tenant awareness at all layers (middleware, services, DB)
- Monorepo structure for development convenience
- Event-driven architecture for decoupled communication and eventual consistency

### Observability & Production Readiness
- Centralized logging (e.g., ELK stack)
- Metrics collection and monitoring (Prometheus + Grafana)
- Centralized error reporting
- CI/CD pipelines per service with:
  - Blue/green or rolling deployments
  - Feature flag support

### Testing
- Unit, integration, and database tests per service
- E2E tests with **Playwright**
- Performance and load tests with **k6**

---

## 6. Monorepo Structure

High-level example monorepo layout:

```text
/apps
  /api-gateway       → Aggregates microservices, handles auth, routing, tenant context, logging
  /auth-service      → Authentication, tenant management, JWT issuance, RBAC
  /students-service  → Student CRUD, status, history
  /programs-service  → Academic programs and course metadata
  /courses-service   → Course offerings, enrollments
  /exams-service     → Exam periods, registrations, grading
  /finance-service   → Tuition, payments, balances
  /records-service   → Transcripts, certificates
  /frontend          → Vue 3 + Quasar SPA, wireframes, drawers for forms and menus

/packages
  /shared-types      → Shared TypeScript types (DTOs, enums)
  /shared-utils      → Common utilities, validators, middleware
  /eslint-config     → Shared lint rules
  /tsconfig          → Shared TS config
  /e2e-tests         → Playwright end-to-end test suite
```

Concrete structure in the repository can differ (e.g., `backend`, `frontend`, `tests`), but this BRD assumes equivalent responsibilities per area.

---

## 7. Multi-Tenancy Model

- Tenant-aware middleware in API Gateway propagates `tenant_id` to all microservices.
- Each microservice enforces tenant scoping in all database queries.
- Tenant isolation models:
  - Schema-per-tenant, or
  - Shared schema with `tenant_id` column + row-level filtering.
- Platform Admin manages tenants:
  - Create, update, deactivate, manage metadata (name, address, billing).
- All audit and logs include `tenant_id` for traceability.

### 7.1 User Creation and Account Management

There is **no public user registration**. Only authenticated users with the appropriate role can create other users. Who can create whom, and when, is defined as follows.

#### Who can create users

| Creator role      | Can create roles                    | Tenant scope                    | When / UI |
|-------------------|-------------------------------------|---------------------------------|-----------|
| **Platform Admin**| Any role (Platform Admin, School Admin, Professor, Student) | Any tenant (creator chooses in UI) | Menu: "Users" (list users) + "Create user" drawer on the right. |
| **School Admin**  | School Admin, Professor, Student only (cannot create Platform Admin) | Own tenant only                 | Menu: "Users" + "Create user" drawer. |
| **Professor**     | Student only                        | Only tenants the professor belongs to (if 2+ institutions, professor must choose which tenant the student belongs to) | Menu: only "Create student" drawer (no user list). |
| **Student**       | —                                   | —                               | Cannot create users. |

#### Rules in short

- **Platform Admin:**
  - Can create any user in any tenant.
  - In the UI sees the `Users` page with:
    - A **tenant select** plus a special option **"Platform Admin users"** that shows all Platform Admin accounts (not tied to a single tenant).
    - A **QTable** with users (full name, email, role, suspended).
    - A **right-side drawer** for creating users (no separate create page).
  - When choosing the `PLATFORM_ADMIN` role for a new user:
    - The UI **does not require** selecting an institution (tenant); the tenant is automatically set to the current Platform Admin's tenant.
**School Admin:**
  - Can create only School Admin, Professor and Student, and only within their own tenant.
  - Cannot assign the Platform Admin role.
  - Sees the `Users` page for their tenant, with a drawer for creating users.
**Professor:**
  - Can create **only students**, and only for tenants they belong to.
  - If a professor is linked to multiple institutions (`UserTenant`), the form requires choosing the tenant for the new student.
  - Has no user list; only sees the “Create student” drawer.
**Student:** Cannot create users.

#### User management (list, edit, suspend, delete)

- **Platform Admin:**
  - Can list users per tenant (tenant selector).
  - Can edit, suspend and delete **any user** in the selected tenant, except themselves (self‑deletion is forbidden).
  - Can open a special “Platform Admin users” view (QSelect option) that lists all Platform Admin accounts, regardless of tenant.
  - Uses a **narrow right-side drawer** for editing users, never a modal.
- **School Admin:**
  - Can list, edit, suspend and delete only users of **their own** tenant (School Admin, Professor, Student).
  - Cannot edit or delete Platform Admin accounts; cannot delete their own account.
  - Suspend = account lock (suspended users cannot log in).
  - Edit also uses a drawer (not a modal); delete confirmation is done via a **confirmation modal** (QDialog).
- **Professor:** No access to the user list or user management; only uses the “Create student” drawer.
- **Student:** No user management.

#### Suspended accounts

- A user can be marked as **suspended** (locked). Suspended users receive an error (e.g. 403 "Account is suspended") on login and cannot use the system until an admin unsuspends them.

---

### 7.2 Bug Reporting and Tickets

The system includes a centralized module for **bug reporting** and ticket lifecycle, implemented as a `Ticket` entity.

#### Who can submit a bug

- **Any authenticated user** (Platform Admin, School Admin, Professor, Student) can submit a bug report / ticket for the current tenant.

#### Fields on the bug report form

- **Subject / Title** – short summary of the problem (required, min/max length).
- **Description / Additional details** – general description of the problem (required, min/max length).
- **Page / Location** – where the bug occurred (page or module, max 255 characters).
- **Steps to reproduce** – steps to reproduce the bug.
- **Expected vs actual behavior** – what the user expected vs. what actually happened.

The form is implemented as a dedicated `Report bug` page in the central content area, accessible from the user avatar menu (avatar → “Report bug”).

#### Server-side rules and anti-spam

- Each ticket is linked to:
  - `tenantId` (institution for which the report is submitted),
  - `createdById` (user who submitted the ticket),
  - `status` (`NEW`, `IN_PROGRESS`, `RESOLVED`),
  - `isPriority` (boolean).
- There is a **rate limit / cooldown per user**:
  - After a successful bug submission, the user cannot immediately submit another ticket of the same type (server returns 429; the UI shows a cooldown message).

#### Ticket listing and management

- The **“Tickets”** page shows a table of bug reports:
  - Columns: subject, reporter name, institution/tenant, created at, status, priority.
  - Filtering:
    - by status (`NEW`, `IN_PROGRESS`, `RESOLVED`);
    - “priority only” (isPriority = true).
  - Clicking a row opens a **right-side drawer** with ticket details:
    - Admin can change status and toggle priority (star icon / toggle).
- **Visibility rules:**
  - **Platform Admin:** sees tickets that are scoped to the platform (e.g. tickets created by Platform Admin users) and/or global platform‑level tickets as defined in this BRD.
  - **School Admin:** sees tickets only for their own tenant.
- **Priority tickets:** Platform Admin can mark a ticket as priority (`isPriority = true`); the UI shows a star indicator and allows filtering to priority tickets only.

---

### 7.3 Notifications (Tickets & User Actions)

The system uses two kinds of notifications:

1. **Ticket notifications** – for new bug reports.
2. **User‑action notifications** – for actions performed on users (create / update / delete).

All notifications are available via:

- The bell icon in the header (badge with count of unread items).
- The **“Notifications”** page, which lists both ticket and user‑action notifications.

#### 7.3.1 Ticket notifications

- The backend periodically (or on demand) fetches tickets with status `NEW`.
- The frontend (Pinia store `notifications`) uses polling:
  - **Platform Admin**:
    - receives notifications for new tickets relevant to the platform (for example, tickets created by Platform Admin users).
  - **School Admin**:
    - receives notifications for new tickets for **their own tenant**.
- Notifications are displayed as a list on the “Notifications” page with:
  - ticket subject,
  - reporter name,
  - institution marker (or “Platform” for platform‑scoped tickets),
  - status badge (`NEW`, `IN_PROGRESS`, `RESOLVED`),
  - created at timestamp.
- The “Mark all as read” action advances the internal “last seen” cursor and clears the local list of unread tickets.

#### 7.3.2 User‑action notifications (users)

In addition to tickets, the system creates a **Notification** entity whenever certain actions are performed on users:

- When a **Platform Admin** creates, updates or deletes a user in a tenant:
  - All **School Admins of that tenant** receive a notification:
    - `type`: `USER_ACTION`,
    - `action`: `CREATED`, `UPDATED` or `DELETED`,
    - `targetEmail`: email of the affected user,
    - `actorRole`: `PLATFORM_ADMIN`,
    - `tenantName`: name of the institution.
- When a **School Admin** updates a user in their tenant:
  - **That user** receives a notification:
    - `type`: `USER_ACTION`, `action: UPDATED`,
    - `actorRole`: `SCHOOL_ADMIN`,
    - `changedFields`: list of fields that were changed (first name, last name, role, suspended).
- When a **School Admin** creates or deletes a user:
  - Platform Admin does **not** receive additional notifications (by design).

The frontend uses a dedicated section on the “Notifications” page for these user‑action notifications:

- For School Admins:
  - messages like “Platform Admin created/updated/deleted user {email}.” with the institution name.
- For end users (when a School Admin updates their account):
  - message like “Your account was updated by a School Admin.” with the list of changed fields.

The badge on the bell icon in the header shows the sum of:

- unread ticket notifications, and
- unread user‑action notifications.

---

## 8. Frontend UI / Wireframes Requirements

- **Navigation:**
  - Drawer component for main menu and **tenant switcher**.
- **Forms:**
  - Use drawers instead of popups/modals for CRUD forms:
    - Student
    - Program
    - Course
    - Exam
    - Payment / Invoice
- **Tables & Lists:**
  - Quasar `QTable` with:
    - Sorting
    - Filtering
    - Pagination
    - Server-side queries where needed
- **Cards:**
  - For summary dashboards (student overview, academic status, financial summary).
- **Alerts/Notifications:**
  - Quasar `QBanner`, `QNotify`, and alert components.
- **Responsive Design:**
  - Drawer collapses on small screens
  - Tables and forms adapt to mobile
- **Wireframes:**
  - Cover Admin, Professor, and Student areas, all built using Quasar components.
- **UX Pattern:**
  - Use **drawers consistently** for all CRUD actions instead of popups.

---

## 9. Microservices Domain Breakdown

- **API Gateway**
  - Aggregates all services
  - Handles tenant context, authentication, logging, rate limiting
- **Auth Service**
  - User management, tenant management
  - User creation rules per role (Platform Admin / School Admin / Professor); see §7.1
  - User list, edit, suspend (lock account), delete (Platform Admin, School Admin; School Admin scoped to own tenant)
  - JWT issuance, refresh tokens
  - RBAC (roles & permissions)
  - Login rejects suspended accounts
  - Audit logging for logins and admin actions
- **Students Service**
  - Student CRUD
  - Status tracking (active, graduated, dropped, etc.)
  - History (status changes, important events)
  - Tenant-scoped searches
- **Programs Service**
  - Academic program CRUD
  - Associations between programs and courses
  - Versioning of program definitions
- **Courses Service**
  - Courses and course offerings
  - Enrollment endpoints
  - Professor assignment
- **Exams Service**
  - Exam periods and terms
  - Registrations
  - Grading logic
  - GPA calculation
  - Notifications on grade changes
- **Finance Service**
  - Tuition definitions
  - Payments and invoices
  - Balance and overdue calculations
  - Notifications for overdue balances
- **Records Service**
  - Transcripts and certificates
  - Passed exams and academic history

---

## 10. Security Requirements

- JWT authentication with tenant context embedded.
- Role-based access control per service.
- Tenant isolation enforced at:
  - API Gateway
  - Service layer
  - Database queries
- Secure password storage (e.g., bcrypt).
- Audit logging for all critical operations (create/update/delete, logins, tenant changes).
- Rate limiting and optional WAF protections at the edge/API gateway.

---

## 11. Audit and Logging

- Each service logs critical actions with:
  - `tenant_id`
  - `user_id`
  - timestamp
  - action
  - affected entity/ID
- API Gateway aggregates logs for:
  - centralized viewing
  - anomaly detection
- Observability:
  - Metrics with Prometheus
  - Dashboards with Grafana
  - Centralized logs via ELK (or similar)

---

## 12. Non-Functional Requirements (NFRs)

| Category    | Requirement            | Metric                    |
|------------|------------------------|---------------------------|
| Performance| API response time      | \<200ms P95               |
| Scalability| Horizontal scaling     | Auto-scale to 1000 req/s |
| Availability| Uptime                | 99.9% SLA                 |
| Security   | Data isolation         | Tenant-scoped queries, JWT/RBAC |
| Usability  | Accessibility          | WCAG 2.1 AA, responsive drawers |
| Compliance | Data privacy           | GDPR-ready audit logs     |

---

## 13. Testing Strategy

- **Backend Microservices**
  - Unit tests for business logic
  - Integration tests for REST endpoints (with DB)
  - DB-backed API tests
- **Frontend**
  - Unit tests for composables and utilities
  - Component tests for Vue + Quasar components
- **E2E**
  - Playwright test suite:
    - Multi-service flows across tenants
    - Page Object Model pattern
- **Performance**
  - k6 load and stress tests for critical endpoints
- **CI/CD**
  - Automated test runs
  - Linting and type-checking
  - Blocking of deployments on failing tests

---

## 14. Assumptions, Risks, and Dependencies

### Assumptions
- PostgreSQL supports tenant volume (\>10k students per tenant).
- Cloud infrastructure (e.g., Render/NeonDB or similar) is available.
- Third-party payment provider (e.g., Stripe) can be integrated later.

### Risks and Mitigations

| Risk                 | Likelihood | Mitigation                                   |
|----------------------|-----------|----------------------------------------------|
| Tenant data leakage  | Medium    | Mandatory tenant filters + QA audits         |
| Scaling bottlenecks  | High      | k6 performance testing + auto-scaling        |
| Event integration lag| Medium    | Fallback REST APIs + phased rollout strategy |

### Dependencies
- Cloud hosting for microservices and DB.
- Docker for packaging and environment parity.
- Monitoring and logging stack (Prometheus/Grafana/ELK).

---

## 15. Product Backlog (Epics & Tasks) with Detailed Functional Descriptions

### EPIC 1 – Microservices Architecture & API Gateway
- **Goal:** Establish microservices-ready architecture with secure, tenant-aware API Gateway.
- **Implementation Order / Todo:**
  1. Define service boundaries per domain.
  2. Setup monorepo structure with Docker configuration for each service.
  3. Implement API Gateway routing.
  4. Add tenant-aware middleware to propagate `tenant_id`.
  5. Implement JWT validation and RBAC in gateway.
  6. Add request validation (Zod/Joi schemas).
  7. Implement logging and metrics collection.
  8. (Optional) Integrate event-driven communication (RabbitMQ/Kafka).
- **Use Cases:** Request routing, tenant context propagation, auth validation, logging, error handling.

### EPIC 2 – Auth Service
- **Goal:** Secure authentication, tenant management, and RBAC.
- **Implementation Order / Todo:**
  1. Create User and Tenant database models.
  2. Implement JWT authentication.
  3. User registration/login flows (no public registration; see §7.1).
  4. Tenant CRUD endpoints.
  5. Implement RBAC middleware.
  6. User creation and management (list, edit, suspend, delete) per §7.1.
  7. Audit logging.
  8. Unit and integration tests.
- **Use Cases:** Platform Admin / School Admin / Professor create users per §7.1; user login (including reject if suspended); list/edit/suspend/delete users (Platform Admin, School Admin); unauthorized access handling.

### EPIC 3 – Students Service
- **Goal:** Manage student records per tenant.
- **Implementation Order / Todo:**
  1. Define Student model.
  2. CRUD endpoints.
  3. Status tracking and history.
  4. Search/filter endpoints per tenant.
  5. Audit logging.
  6. Unit and integration tests.
- **Use Cases:** Create/update student, tenant-scoped fetch, status changes.

### EPIC 4 – Programs Service
- **Goal:** Manage academic programs per tenant.
- **Implementation Order / Todo:**
  1. Define Program model.
  2. CRUD endpoints.
  3. Program-course associations.
  4. Versioning for program changes.
  5. Unit and integration tests.
- **Use Cases:** Admin manages programs, associate courses, view version history.

### EPIC 5 – Courses Service
- **Goal:** Manage courses and enrollments.
- **Implementation Order / Todo:**
  1. Define Course and CourseOffering models.
  2. CRUD endpoints.
  3. Assign professors.
  4. Implement enrollment endpoints.
  5. Unit and integration tests.
- **Use Cases:** Enroll students, assign professors, list courses per tenant.

### EPIC 6 – Exams Service
- **Goal:** Manage exams, registrations, and grading.
- **Implementation Order / Todo:**
  1. Define ExamPeriod and ExamTerm models.
  2. CRUD endpoints and registrations.
  3. Grading logic and GPA calculation.
  4. Event-driven notifications on grade changes.
  5. Unit and integration tests.
- **Use Cases:** Exam registration, grade updates, transcript notifications.

### EPIC 7 – Finance Service
- **Goal:** Track tuition, payments, balances.
- **Implementation Order / Todo:**
  1. Define Tuition and Payment models.
  2. CRUD endpoints.
  3. Balance calculations.
  4. Event-driven notifications for overdue payments.
  5. Unit and integration tests.
- **Use Cases:** Payment recording, balance checking, overdue alerts.

### EPIC 8 – Records Service
- **Goal:** Generate transcripts, certificates, passed exams reports.
- **Implementation Order / Todo:**
  1. Define Transcript and Certificate models.
  2. Implement endpoints.
  3. Unit and integration tests.
- **Use Cases:** Generate transcripts, issue certificates, retrieve exam results.

### EPIC 9 – Frontend with Wireframes
- **Goal:** Implement Quasar frontend with drawers for CRUD forms.
- **Implementation Order / Todo:**
  1. Setup Quasar project in `/frontend`.
  2. Implement drawer-based navigation menu.
  3. Implement CRUD forms as drawers for core domains.
  4. Implement dashboard cards and tables.
  5. Implement responsive design (desktop/tablet/mobile).
  6. Unit and component tests.
- **Use Cases:** Admin, Professor, Student UI interactions.

### EPIC 10 – Backend Testing
- **Goal:** Ensure microservices are thoroughly tested.
- **Implementation Order / Todo:**
  1. Unit tests for service logic.
  2. Integration tests for endpoints.
  3. DB-backed API tests.
  4. CI pipeline integration.

### EPIC 11 – E2E & Performance Testing
- **Goal:** Validate full system flows and scalability.
- **Implementation Order / Todo:**
  1. Playwright setup (e.g., `/tests/e2e` or `/packages/e2e-tests`).
  2. Implement multi-service E2E tests.
  3. Implement k6 load tests.
  4. Integrate tests into CI/CD.

### EPIC 12 – Production Hardening
- **Goal:** Make the system enterprise-ready.
- **Implementation Order / Todo:**
  1. Global error handling across services.
  2. Centralized logging and monitoring dashboards.
  3. Dockerization per service.
  4. Swagger/OpenAPI documentation.
  5. Feature flags for controlled rollout.
  6. Observability with Prometheus/Grafana + ELK.

---

## 16. Approval

**Prepared by:** Bojan Pavlovic  
**Version:** 2.1 (added §7.1 User Creation and Account Management; EPIC 2 and Auth Service updated)

