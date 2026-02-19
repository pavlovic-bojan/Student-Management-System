# Playwright Tests (API + E2E)

Single Playwright instance with API tests (JSON schema validation) and E2E tests (POM).

→ See [tests/README.md](../README.md) for overview and Docker.

## Setup

```bash
cd tests/e2e
npm install
cp .env.example .env   # optional
```

## Running

```bash
# All tests (API + E2E)
npm run test

# API only (backend required)
npm run test:api

# E2E only (backend + frontend required)
npm run test:e2e

# From project root
npm run tests:api      # API tests
npm run tests:e2e      # E2E tests
```

## Allure Report

```bash
npm run report
```

## Structure

```
tests/e2e/
├── playwright.config.ts   # api + e2e projects
├── tests/
│   ├── api/               # API tests (JSON schema validation)
│   │   ├── health.spec.ts
│   │   ├── auth.spec.ts
│   │   └── tenants.spec.ts
│   └── e2e/               # E2E tests (POM)
│       └── auth.spec.ts
├── pages/                 # Page Objects for E2E
├── lib/
│   └── schema-validator.ts  # JSON schemas for API validation
└── package.json
```

## Environment

| Variable | Description |
|----------|-------------|
| `BASE_URL` | Frontend URL (default: `http://localhost:5173`) |
| `API_BASE_URL` | Backend origin (default: `http://localhost:4000`). Paths include `api/` (e.g. `api/health`). |
| `TEST_USER_EMAIL` | Test user (seed: `platform-admin@sms.edu`) |
| `TEST_USER_PASSWORD` | Test user password (seed: `seed-platform-admin-change-me`) |

See [root README](../../README.md) for live URLs and CI secrets.

## POM Rules (E2E)

- Each page has a Page Object class extending `BasePage`
- Selectors are readonly properties in the Page Object
- Tests use Page Object methods, not `page.locator()` directly
- All UI elements use `data-test` attributes
