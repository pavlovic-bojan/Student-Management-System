# Student Management System — Frontend

Frontend for the multi-tenant Student Management System (SMS). Built with **Vue 3**, **Quasar**, **TypeScript**, **Pinia**, and **Vite**. It provides a SPA with drawer-based CRUD flows, role-based access, and full i18n (English, Serbian Latin, Serbian Cyrillic).

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Setup and run](#setup-and-run)
- [API layer](#api-layer)
- [State management (Pinia)](#state-management-pinia)
- [Routing and guards](#routing-and-guards)
- [Internationalization (i18n)](#internationalization-i18n)
- [Unit and component tests](#unit-and-component-tests)
- [Test coverage summary](#test-coverage-summary)
- [Scripts reference](#scripts-reference)
- [Build and deploy](#build-and-deploy)

---

## Tech stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **UI**: Quasar 2 (components, icons, dark mode)
- **Language**: TypeScript (strict)
- **Build**: Vite 5
- **State**: Pinia
- **Router**: Vue Router 4
- **HTTP**: Axios (shared client with JWT and tenant headers)
- **i18n**: vue-i18n (en, sr-lat, sr-cyr)
- **Testing**: Vitest, @vue/test-utils, jsdom
- **Styling**: Quasar SASS variables, Tailwind CSS, app.scss

---

## Project structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── api/                # API client and per-domain API modules
│   │   ├── client.ts       # Axios instance (baseURL, JWT + x-tenant-id interceptors)
│   │   ├── auth.api.ts
│   │   ├── users.api.ts
│   │   ├── tenants.api.ts
│   │   ├── students.api.ts
│   │   ├── programs.api.ts
│   │   ├── courses.api.ts
│   │   ├── exams.api.ts
│   │   ├── finance.api.ts
│   │   ├── records.api.ts
│   │   ├── tickets.api.ts
│   │   ├── notifications.api.ts
│   │   └── health.api.ts
│   ├── components/
│   │   └── common/         # Reusable components (e.g. DarkModeToggle)
│   ├── layouts/
│   │   ├── AuthLayout.vue  # Auth pages (login, forgot-password)
│   │   └── MainLayout.vue  # App shell (drawer, header, router-view)
│   ├── pages/              # Route-level components
│   │   ├── auth/           # LoginPage, ForgotPasswordPage, RegisterPage
│   │   ├── users/          # UsersPage (list, create, edit, delete)
│   │   ├── StudentsPage.vue
│   │   ├── ProgramsPage.vue
│   │   ├── CoursesPage.vue
│   │   ├── ExamsPage.vue
│   │   ├── FinancePage.vue
│   │   ├── RecordsPage.vue
│   │   ├── TicketsPage.vue
│   │   ├── BugReportPage.vue
│   │   ├── NotificationsPage.vue
│   │   └── ProfilePage.vue
│   ├── router/
│   │   ├── index.ts        # Routes and lazy-loaded components
│   │   └── guards.ts       # requireAuth, guestOnly, requireAdminOrSchoolAdmin, requireCanCreateUser
│   ├── stores/             # Pinia stores (auth, tenants, students, programs, courses, exams, finance, records, notifications, ui)
│   ├── locales/            # i18n messages (en, sr-lat, sr-cyr)
│   ├── css/
│   ├── i18n.ts
│   ├── main.ts
│   ├── App.vue
│   └── __tests__/
│       ├── unit/           # Store and router guard tests (Vitest + mocks)
│       └── components/    # Component tests (Vue Test Utils + Quasar + i18n)
├── index.html
├── vite.config.ts          # Vue, Quasar, path alias, Vitest config
├── .env.example
└── package.json
```

All user-facing text is via i18n keys; interactive elements use `data-test` attributes for E2E and debugging.

---

## Environment variables

Copy `.env.example` to `.env` and set values locally (never commit `.env`).

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `VITE_API_URL`  | Yes      | Backend API base URL (e.g. `http://localhost:4000/api`). No trailing slash. |

Used at build time and by the API client in `src/api/client.ts`.

---

## Setup and run

From the **frontend** directory (or repo root with `npm run frontend:dev`):

```bash
# Install dependencies (or from repo root: npm install)
npm install

# Copy env template and set VITE_API_URL
cp .env.example .env

# Development server (hot reload)
npm run dev
```

The app is served at `http://localhost:5173` (or the port shown in the terminal). Ensure the backend is running and `VITE_API_URL` points to it (e.g. `http://localhost:4000/api`).

For full monorepo setup (backend, DB, seed), see the root **[LOCAL_SETUP.md](../LOCAL_SETUP.md)**.

---

## API layer

- **Client**: `src/api/client.ts` creates an Axios instance with `baseURL` from `VITE_API_URL`. Request interceptor adds `Authorization: Bearer <token>` (from `localStorage.jwt_token`) and `x-tenant-id` (from `localStorage.user.tenantId`). Response interceptor on 401 clears auth and redirects to login.
- **Modules**: Each domain (auth, users, tenants, students, programs, courses, exams, finance, records, tickets, notifications) has an `*.api.ts` file that uses this client and exports typed functions (e.g. `studentsApi.list(tenantId?)`, `studentsApi.create(data)`, `studentsApi.update(studentId, data)`, `studentsApi.deleteEnrollment(enrollmentId)`).
- **Stores** call these API modules and hold loading/error state and list data; pages use stores and handle UI (drawers, tables, forms).

---

## State management (Pinia)

| Store           | Purpose |
|-----------------|--------|
| `auth`          | User, token, login/logout/register, `tenantId`, `isAuthenticated`, `initAuth`, `setCredentials`, `clearCredentials` |
| `tenants`       | List of tenants, `fetchTenants`, `createTenant` (used for tenant dropdown by Platform Admin) |
| `students`      | List of students (enrollments), `fetchStudents(tenantId?)`, `createStudent`, `updateStudent`, `deleteEnrollment`, `clearStudents` |
| `programs`      | Programs list and CRUD |
| `courses`       | Courses list and CRUD |
| `exams`         | Exam periods/terms and related data |
| `finance`       | Tuitions and payments |
| `records`       | Transcripts |
| `notifications` | Unread ticket and user-action notifications, polling, `markRead` |
| `ui`            | UI state (e.g. drawer, theme) if needed |

Stores that depend on tenant context (e.g. students, programs) use `useAuthStore()` to resolve `tenantId` (Platform Admin passes tenant from dropdown; School Admin / Professor use `auth.tenantId`).

---

## Routing and guards

- **Routes**: Defined in `src/router/index.ts`. Lazy-loaded with `import('@/pages/...')`. Base path `/` uses `MainLayout`; `/auth` uses `AuthLayout`.
- **Guards** (in `src/router/guards.ts`):
  - `requireAuth`: Allows access if authenticated; otherwise redirects to `login` with `redirect` query.
  - `guestOnly`: For auth pages; redirects to `redirect` query or `/` if already authenticated.
  - `requireAdminOrSchoolAdmin`: Only Platform Admin or School Admin; others redirect to `tickets`.
  - `requireCanCreateUser`: Platform Admin, School Admin, or Professor; others redirect to `tickets`.
- **Users page** uses `requireAdminOrSchoolAdmin`; other main routes use `requireAuth` only.

---

## Internationalization (i18n)

- **Locales**: `src/locales/{en,sr-lat,sr-cyr}/` with JSON files (e.g. `common.json`, `pages/auth.json`, `dashboard.json`). All UI strings use the `t()` function (or `$t`) with keys; no hardcoded user-facing text.
- **Languages**: English (en), Serbian Latin (sr-lat), Serbian Cyrillic (sr-cyr). Language can be switched from the UI where implemented (e.g. profile or header).

---

## Unit and component tests

Tests live under `src/__tests__/` and are run with **Vitest**. Config is in `vite.config.ts` (`test.globals`, `test.environment: 'jsdom'`, `test.include: ['src/__tests__/**/*.test.ts']`).

### Unit tests (`src/__tests__/unit/`)

- **auth.store.test.ts**: `setCredentials`, `clearCredentials`, `initAuth` (localStorage and state).
- **tenants.store.test.ts**: `fetchTenants` (success and error), `createTenant` (prepends and returns). API is mocked with `vi.mock('@/api/tenants.api')`.
- **students.store.test.ts**: `canFetch`, `fetchStudents` (success, Platform Admin no tenant), `createStudent` (no tenant throws), `clearStudents`. API mocked; Pinia auth store set for role/tenant.
- **router-guards.test.ts**: `requireAuth` (allowed vs redirect to login), `guestOnly` (not authenticated vs redirect), `requireAdminOrSchoolAdmin` (PLATFORM_ADMIN/SCHOOL_ADMIN allowed, PROFESSOR redirect), `requireCanCreateUser` (PROFESSOR allowed, STUDENT redirect). Uses real Pinia and guards; `next` is a mock.

Unit tests **do not** hit the real backend; they use mocks and in-memory state.

### Component tests (`src/__tests__/components/`)

- **DarkModeToggle.test.ts**: Mounts `DarkModeToggle` with Quasar and i18n; asserts toggle updates `localStorage.darkMode` (true/false).

Component tests that need Quasar or router use the same `global.plugins` (Quasar, i18n) where required.

### Running tests

From the **frontend** directory:

```bash
npm run test
# or
npx vitest run
```

No backend or environment variables are required for the current test suite.

---

## Test coverage summary

| Area              | Unit tests | Component tests |
|-------------------|------------|-----------------|
| Auth store        | ✅ setCredentials, clearCredentials, initAuth | — |
| Tenants store     | ✅ fetchTenants, createTenant (mocked API) | — |
| Students store    | ✅ canFetch, fetchStudents, createStudent, clearStudents (mocked API) | — |
| Programs store    | ✅ fetchPrograms, createProgram, updateProgram, deleteProgram, clearPrograms | — |
| Courses store     | ✅ fetchCourses, createCourse, updateCourse, deleteCourse, clearCourses | — |
| Exams store       | ✅ fetchPeriods, fetchTerms, fetchAll, createPeriod, clearExams | — |
| Finance store     | ✅ fetchTuitions, fetchPayments, fetchAll, createTuition, createPayment, clearFinance | — |
| Records store     | ✅ fetchTranscripts, generateTranscript, clearRecords | — |
| Notifications store | ✅ unreadCount, pollTickets, pollUserNotifications, markAllRead | — |
| UI store          | ✅ toggleLeftDrawer, closeLeftDrawer, submit/createUser drawers | — |
| Router guards     | ✅ requireAuth, guestOnly, requireAdminOrSchoolAdmin, requireCanCreateUser | — |
| DarkModeToggle    | — | ✅ toggle and localStorage |
| AuthLayout        | — | ✅ smoke mount |
| MainLayout        | — | ✅ smoke mount (sidebar) |
| LoginPage         | — | ✅ smoke mount (login form) |
| ForgotPasswordPage | — | ✅ smoke mount |
| RegisterPage      | — | ✅ smoke mount |
| StudentsPage      | — | ✅ smoke mount |
| UsersPage         | — | ✅ smoke mount |
| ProgramsPage      | — | ✅ smoke mount |
| CoursesPage       | — | ✅ smoke mount |
| ExamsPage         | — | ✅ smoke mount |
| FinancePage       | — | ✅ smoke mount |
| RecordsPage       | — | ✅ smoke mount |
| TicketsPage       | — | ✅ smoke mount |
| NotificationsPage | — | ✅ smoke mount |
| BugReportPage     | — | ✅ smoke mount |
| ProfilePage       | — | ✅ smoke mount |

All stores are covered by unit tests (with mocked APIs and Pinia). All pages and layouts are covered by component (smoke) tests (Quasar, i18n, Pinia, Vue Router).

---

## Scripts reference

| Script    | Description |
|-----------|-------------|
| `dev`     | Start Vite dev server (hot reload). |
| `build`   | Production build (`vite build`); output in `dist/`. |
| `preview` | Serve the production build locally (`vite preview`). |
| `test`    | Run Vitest once (`vitest run`). |

From the **repo root**: `npm run frontend:dev`, `npm run frontend:test`, etc.

---

## Build and deploy

- **Build**: `npm run build` produces a static output in `dist/` (or `dist/spa/` depending on Quasar/Vite config). Ensure `VITE_API_URL` is set at build time to the production API URL (e.g. `https://your-api.example.com/api`).
- **Deploy**: Serve the contents of `dist/` with any static host (e.g. Vercel, Netlify, nginx). For SPA routing, configure the server to fallback to `index.html` for all routes.
- **Docker**: A frontend Dockerfile in the repo root (or frontend folder) can build with a build-arg for `VITE_API_URL` and serve the result with nginx; see root **docker-compose.yml** and **[LOCAL_SETUP.md](../LOCAL_SETUP.md)**.

---

This README describes the frontend application, structure, configuration, API usage, state, routing, i18n, tests, and deployment.
