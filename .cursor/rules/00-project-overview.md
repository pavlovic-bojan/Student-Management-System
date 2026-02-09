# Project Overview

> **⚠️ CRITICAL RULE**: See [01-development-workflow.md](./01-development-workflow.md) for the **MANDATORY 100% Best Practices** rule that applies to ALL work.

## Project Overview

- **Type**: Monorepo with npm workspaces
- **Structure**: Backend (Express + TypeScript + Prisma + PostgreSQL), Frontend (Vue 3 + Quasar + TypeScript), Tests (Playwright for E2E/API/DB + TypeScript, k6 for performance + TypeScript)
- **Language**: All code and documentation in English
- **License**: MIT (public open-source, see LICENSE file)

## Monorepo Structure

- Root uses **npm workspaces** - always use `npm install` from root to install all dependencies
- Workspaces: `backend`, `frontend`, `tests`, `tests/e2e`, `tests/e2e/api`, `tests/e2e/db`, `tests/performance`
- When running commands, prefer root scripts: `npm run backend:dev`, `npm run frontend:dev`, etc.
- For Quasar CLI, always use `npx quasar` commands (not just `quasar`) due to npm workspaces compatibility

## Code Style & Conventions

### TypeScript

- Use strict TypeScript mode
- All files must have proper types
- Prefer interfaces over types for object shapes
- Use `const` assertions where appropriate

### Naming Conventions

- **Files**: kebab-case for components, camelCase for utilities
- **Components**: PascalCase (e.g., `UserProfile.vue`)
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database models**: PascalCase (Prisma schema)

## File Organization

### Backend Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules (auth, buildings, tickets, etc.)
│   │   ├── {feature}/
│   │   │   ├── {feature}.controller.ts
│   │   │   ├── {feature}.routes.ts
│   │   │   └── {feature}.service.ts
│   ├── middleware/       # Express middleware
│   ├── config/          # Configuration files
│   └── utils/           # Utility functions
└── prisma/
    └── schema.prisma    # Database schema
```

See [02-backend-rules.md](./02-backend-rules.md) for detailed backend rules.

### Frontend Structure

```
frontend/
├── src/
│   ├── pages/          # Page components (route components)
│   ├── components/     # Reusable components
│   │   └── common/     # Common/shared components
│   ├── composables/    # Vue composables
│   ├── api/            # API service layer
│   ├── router/         # Vue Router configuration
│   └── locales/          # i18n translation files
└── public/             # Static assets
```

See [03-frontend-rules.md](./03-frontend-rules.md) for detailed frontend rules.

## Environment Variables

### Important Rules

- **`.env` files**: NEVER commit to git (they contain real secrets). These are for local development only.
- **`.env.example` files**: ALWAYS commit to git. These serve as templates for new developers, showing:
  - All required environment variables
  - Example values (not real secrets)
  - Documentation/comments explaining each variable
  - Which variables are required vs optional

### Backend Environment Variables

**Local Development** (`.env` - not committed):
- Required: `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`
- Optional: OAuth credentials (Google, LinkedIn, Facebook)
- These are loaded from `.env` file at runtime

**Template** (`.env.example` - committed to git):
- Must include all variables with example values
- Example: `JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"`
- Include comments explaining what each variable does
- Never include real secrets or production values

See [02-backend-rules.md](./02-backend-rules.md) for backend-specific environment variable details.

### Frontend Environment Variables

**Local Development** (`.env` - not committed):
- Required: `VITE_API_URL`
- Optional: `VITE_ROUTER_MODE`, `VITE_ROUTER_BASE`
- These are loaded from `.env` file at build/runtime

**Template** (`.env.example` - committed to git):
- Must include all variables with example values
- Example: `VITE_API_URL=http://localhost:4000`
- Include comments explaining what each variable does

See [03-frontend-rules.md](./03-frontend-rules.md) for frontend-specific environment variable details.

### Workflow for New Developers

1. Clone repository
2. Copy `.env.example` to `.env` in each workspace (backend, frontend)
3. Fill in `.env` with actual values (secrets, database URLs, etc.)
4. `.env` files are automatically ignored by git (via `.gitignore`)

## Git & Version Control

### Commit Messages

- Use conventional commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(backend): add ticket assignment endpoint`

### Branching

- `main` - production-ready code
- `develop` - development branch
- `staging` - pre-production testing
- `test` - test environment
- Feature branches: `feature/description`

## Important Notes

- **CRITICAL**: **Always apply 100% best practices** for everything - analysis, coding, testing, documentation (see [01-development-workflow.md](./01-development-workflow.md))
- **Never** commit `.env` files (they contain secrets - already in `.gitignore`)
- **Always** commit `.env.example` files (templates for new developers with example values, not real secrets)
- **Always** use `npx quasar` commands for Quasar CLI
- **Always** run `npm install` from root for workspace dependencies
- **Always** document API endpoints with Swagger
- **Always** provide translations for all three languages
- **Always** test changes locally before committing
- **Always** follow best practices for security, performance, accessibility, and code quality

## Questions to Ask

When implementing new features, consider:

1. Does this follow existing patterns?
2. Are there similar features I can reference?
3. Do I need to update documentation? (See [06-documentation-rules.md](./06-documentation-rules.md))
4. Do I need to add/update tests? (See [04-testing-rules.md](./04-testing-rules.md))
5. Do I need to add translations? (See [03-frontend-rules.md](./03-frontend-rules.md))
6. Does this affect multiple workspaces?
7. Are there security implications? (See [02-backend-rules.md](./02-backend-rules.md))

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - Development workflow and best practices
- [02-backend-rules.md](./02-backend-rules.md) - Backend-specific rules
- [03-frontend-rules.md](./03-frontend-rules.md) - Frontend-specific rules
- [04-testing-rules.md](./04-testing-rules.md) - Testing rules
- [05-database-rules.md](./05-database-rules.md) - Database rules
- [06-documentation-rules.md](./06-documentation-rules.md) - Documentation rules
- [07-deployment-rules.md](./07-deployment-rules.md) - Deployment rules