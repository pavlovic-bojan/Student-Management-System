# SMS Tests

Test suites for Student Management System: **Playwright** (API + E2E) and **k6** (performance).

## Overview

| Suite | Location | Description |
|-------|----------|-------------|
| **API** | [e2e/tests/api/](e2e/) | Playwright API tests, JSON schema validation |
| **E2E** | [e2e/tests/e2e/](e2e/) | Playwright E2E tests, Page Object Model |
| **Performance** | [performance/](performance/) | k6 load tests (smoke, baseline, load, …) |

## Quick Start

```bash
# From project root
npm run tests:api         # API tests (backend required)
npm run tests:e2e         # E2E tests (backend + frontend required)
npm run tests:performance # k6 smoke (backend required)
npm run test:all          # All tests (backend, frontend, unit, integration, api, e2e, perf)
```

## Subfolders

- **[e2e/](e2e/)** – Playwright (API + E2E), Allure reports
- **[performance/](performance/)** – k6 performance tests

## Docker

### Standalone image

Build and run from **project root**:

```bash
docker build -f tests/Dockerfile -t sms-tests .

docker run --rm -e API_BASE_URL=https://your-backend.onrender.com sms-tests api
docker run --rm -e BASE_URL=https://your-frontend.vercel.app -e API_BASE_URL=https://your-backend.onrender.com sms-tests e2e
docker run --rm -e BASE_URL=https://your-backend.onrender.com sms-tests performance
```

### Docker Compose (local stack)

With `docker compose up` running (postgres + backend + frontend), run tests:

```bash
docker compose --profile test run --rm tests api
docker compose --profile test run --rm tests e2e
docker compose --profile test run --rm tests performance
```

Requires backend seed (`npm run prisma:seed` in backend) for auth tests.

See [e2e/README.md](e2e/README.md) and [performance/README.md](performance/README.md) for env vars and setup.
