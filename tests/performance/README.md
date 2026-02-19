# Student Management System – Performance Tests (k6)

Performance tests for the SMS backend API. All tests are configured for **minimum** load (1–2 VUs, short duration) for fast validation in CI/CD.

→ See [tests/README.md](../README.md) for overview and Docker.

## Test Scenarios

| Test       | Description                | VUs | Duration      | CI |
|-----------|----------------------------|-----|---------------|-----|
| **smoke** | Health check (+ auth/me)   | 1   | 3 iterations  | ✅ |
| **baseline** | Steady load              | 2   | 1 min         | |
| **load**  | Ramp 0→2 VUs              | 2   | ~2 min        | |
| **stress**| Ramp 2→4 VUs              | 4   | ~2 min        | |
| **spike** | Spike 2→4→2 VUs           | 4   | ~1 min        | |
| **breakpoint** | Ramp 2→4 VUs          | 4   | ~1.5 min      | |
| **soak**  | 2 req/s, 1 min            | 2–4 | 1 min         | |

## Prerequisites

- **k6** – standalone binary (not an npm package)
  - macOS: `brew install k6`
  - Linux: [k6 docs](https://k6.io/docs/getting-started/installation/)

## Configuration

### Required Variables

- `BASE_URL` – Backend URL (e.g. `http://localhost:4000`), no trailing slash

### Optional

- `AUTH_TOKEN` – JWT for protected endpoints (`/api/auth/me`, `/api/tenants`). If not set, only the health check is run.

### Example

```bash
# Health only (no token)
BASE_URL=http://localhost:4000 npm run smoke

# With token
BASE_URL=http://localhost:4000 AUTH_TOKEN=eyJ... npm run smoke
```

## Running

### NPM Scripts (from `tests/performance/`)

```bash
cd tests/performance
npm run test      # smoke (default for CI)
npm run smoke
npm run baseline
npm run load
npm run stress
npm run spike
npm run breakpoint
npm run soak
npm run all       # smoke + baseline + load
```

### Run Script

```bash
cd tests/performance
chmod +x run.sh
BASE_URL=http://localhost:4000 ./run.sh smoke
./run.sh all
```

### From Project Root

```bash
BASE_URL=http://localhost:4000 npm run tests:performance
```

## CI/CD Integration

### GitHub Actions

1. **Backend deploy workflow** – After the health check, it automatically runs the **smoke test** (if the backend is on Render, it uses `BACKEND_URL`).

2. **Performance workflow** (`.github/workflows/performance.yml`):
   - Automatically on push to `tests/performance/`
   - Manual: *Run workflow* → choose test type (smoke, baseline, load, …)
   - Uses `BACKEND_URL` from secrets (or input `base_url`)

### Required Secrets

- `BACKEND_URL` – Production URL (e.g. `https://sms-api.onrender.com`)
- `PERF_AUTH_TOKEN` (optional) – JWT for auth endpoints

## Structure

```
tests/performance/
├── lib/
│   ├── config.js    # BASE_URL, thresholds
│   ├── auth.js      # JWT headers
│   ├── api.js       # getHealth, getMe, getTenants
│   ├── scenarios.js # VU/iteration config (minimum)
│   └── utils.js
├── smoke/           # Smoke test
├── baseline/        # Baseline test
├── load/
├── stress/
├── spike/
├── breakpoint/
├── soak/
├── data/
├── run.sh
├── .env.example
├── package.json
└── README.md
```

## Endpoints

- `GET /api/health` – No auth required, always tested
- `GET /api/auth/me` – With JWT (when `AUTH_TOKEN` is set)

See [root README](../../README.md) for live URLs. CI uses `BACKEND_URL` secret (origin); k6 builds `$BASE_URL/api/health`, etc.
