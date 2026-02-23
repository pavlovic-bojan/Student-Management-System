# Student Management System (SMS)
## Product Requirements Document (PRD)

---

## 1. Purpose

This PRD defines **functional requirements** and **user flows** for the Multi-Tenant Student Management System (SMS). It is aligned with [BRD.md](./BRD.md) and the current implementation.

Objectives:
- centralize management of student and administrative data across multiple educational institutions
- enable role-based access (Platform Admin, School Admin, Professor, Student)
- provide an intuitive web UI (Vue 3 + Quasar) with a drawer pattern for CRUD

---

## 2. Actors

| Actor | Description |
|-------|-------------|
| **Platform Admin** | Manages tenants, creates and manages users in any tenant, sees all tickets |
| **School Admin** | Manages students, programs, courses, exams, finances in their tenant; sees tenant tickets |
| **Professor** | Creates students, manages courses and exams in tenants they belong to; receives notifications about changes to their account |
| **Student** | Views their enrollments, exams, transcripts, finances; reports bugs |

---

## 3. Multi-Tenancy

- Each **institution** (university, faculty, school) is a **tenant**.
- Tenant has: `name`, `code` (unique), `isActive`.
- All data is isolated by `tenantId`.
- Platform Admin can switch tenant context (tenant switcher in header).
- School Admin, Professor, Student use their `tenantId` from JWT.

---

## 4. Tenant Management (BRD §7.0)

### 4.1 Rules

- Only **Platform Admin** can create, update, or deactivate tenants.
- School Admin, Professor, and Student have no access to tenant CRUD.

### 4.2 UI

- **Navigation**: "Tenants" item only for Platform Admin.
- **List**: QTable with columns name, code, isActive, actions.
- **Create / Edit**: right drawer with form (name, code; for edit also isActive checkbox).
- **Deactivation**: via isActive = false (no hard delete).

### 4.3 API

- `GET /api/tenants` – list all tenants (Platform Admin only)
- `POST /api/tenants` – create (name, code)
- `PATCH /api/tenants/:id` – update (name, code, isActive)

---

## 5. User Creation and Management (BRD §7.1)

### 5.1 Who Can Create Whom

| Creator | Can Create | Tenant Scope |
|---------|------------|--------------|
| Platform Admin | any role | any tenant |
| School Admin | School Admin, Professor, Student | own tenant only |
| Professor | Student | only tenant(s) where they are a professor |
| Student | — | — |

### 5.2 UI

- **Platform Admin**: Users page, tenant selector, "Platform Admin users" option, drawer for create user.
- **School Admin**: Users page for their tenant, drawer for create user.
- **Professor**: only "Create student" in menu (no user list).
- **Student**: no user creation.

### 5.3 Rules

- No public registration.
- Platform Admin when creating PLATFORM_ADMIN users does not select tenant (set automatically).
- Suspend = blocked account; suspended users receive 403 on login.
- Self-deletion of own account is not allowed.

### 5.4 API

- `POST /auth/register` – create user (auth required)
- `GET /users?tenantId=` – list users of tenant
- `GET /users/platform-admins` – list Platform Admin users (Platform Admin only)
- `PATCH /users/:id` – update (firstName, lastName, role, suspended)
- `DELETE /users/:id` – delete user

---

## 6. Bug Reporting and Tickets (BRD §7.2)

### 6.1 Fields

- Subject / Title (required, 5–200 chars)
- Description (required, 10–2000 chars)
- Page, Steps, Expected vs actual (optional, with min/max)

### 6.2 Rules

- Any authenticated user can report a bug for the current tenant.
- Rate limit: cooldown between submissions (e.g. 60s).
- Tickets have status (NEW, IN_PROGRESS, RESOLVED) and isPriority.

### 6.3 Visibility

- **Platform Admin**: sees all tickets, including platform-scoped (created by Platform Admin).
- **School Admin**: sees only tickets of their tenant, **excluding** tickets created by Platform Admin.
- **Professor / Student**: does not see ticket list (can only submit).

### 6.4 API

- `POST /api/tickets` – create ticket
- `GET /api/tickets` – list (Platform/School admin; filters: status, priorityOnly)
- `PATCH /api/tickets/:id` – update status/priority

---

## 7. Notifications (BRD §7.3)

### 7.1 Ticket Notifications

- Frontend polls for new tickets (status NEW).
- Platform Admin sees platform tickets; School Admin sees tenant tickets (excluding those from Platform Admin).
- Professor and Student do not receive ticket notifications.

### 7.2 User-Action Notifications

- **Platform Admin** creates/updates/deletes user → all **School Admins** of that tenant receive notification.
- **School Admin** updates user → **that user** receives notification (e.g. "Your account was updated by School Admin").
- Professor and Student see only notifications **concerning them personally** (e.g. changes to their account).

### 7.3 UI

- Bell icon in header with badge (unread count).
- "Notifications" page – list of ticket + user-action notifications.
- "Mark all as read" – clears locally and marks via API.

### 7.4 API

- `GET /api/notifications?unreadOnly=` – list notifications for current user
- `POST /api/notifications/mark-read` – mark as read (body: `{ ids: [...] }`)

---

## 8. Students

- Student = person; enrollment = student in tenant (StudentTenant).
- One student can be enrolled in multiple institutions.
- Status: ACTIVE, GRADUATED, DROPPED, SUSPENDED.
- Platform Admin must pass `tenantId` when creating; School Admin uses their tenant.

---

## 9. Programs, Courses, Exams, Finance, Records

- **Programs**: CRUD, versioning, linking with courses.
- **Courses**: CRUD, course offerings (term, year), professor assignment, enrollments.
- **Exams**: Periods, Terms, Registrations, grading.
- **Finance**: Tuitions, Payments.
- **Records**: Transcripts, GPA.

All operations are tenant-scoped. Frontend uses drawer pattern for CRUD forms.

---

## 10. API & Integration Requirements

- RESTful, JSON
- JWT Bearer authentication
- `x-tenant-id` header for Platform Admin tenant switcher
- Input validation (express-validator)
- Standard HTTP status codes

---

## 11. Non-Functional Requirements

- Responsive UI (desktop/tablet/mobile)
- i18n: en, sr-lat, sr-cyr
- Accessibility (WCAG 2.1 AA where possible)
- Performance: API response <200ms P95 (target)

---

## 12. Success Criteria

- Platform Admin can manage tenants and users.
- School Admin can manage students, programs, courses, exams, finances.
- Professor can create students and manage courses/exams.
- Student sees their data and can report bugs.
- Notifications are correctly filtered by role (ticket + user-action).
- Multi-tenancy is successfully isolated.