# Development Workflow & Best Practices

> **⚠️ CRITICAL RULE: 100% Best Practices ALWAYS**

**MANDATORY**: For EVERY task you work on - from analysis, planning, coding (backend, frontend), testing (all types), documentation, deployment - you MUST apply **100% best practices** at all times. This is non-negotiable.

- **Analysis**: Follow best practices for requirement analysis, architecture planning
- **Backend Development**: Follow all backend best practices (security, validation, error handling, patterns) - see [02-backend-rules.md](./02-backend-rules.md)
- **Frontend Development**: Follow all frontend best practices (components, state management, accessibility, i18n) - see [03-frontend-rules.md](./03-frontend-rules.md)
- **Testing**: Follow all testing best practices (coverage, patterns, organization) - see [04-testing-rules.md](./04-testing-rules.md)
- **Documentation**: Follow all documentation best practices (completeness, clarity, translations) - see [06-documentation-rules.md](./06-documentation-rules.md)
- **Code Quality**: Follow all code quality best practices (TypeScript, linting, formatting, patterns)

**Never compromise on best practices. Always aim for 100%.**

---

## When Implementing New Features OR Updating Existing Features

**Important**: This workflow applies to BOTH:
- **New Features**: Implementing completely new functionality
- **Existing Features**: Updating, modifying, refactoring, or extending existing functionality

**When you see "implementation" in this document, it means BOTH new features AND updates to existing features.**

**Best Practices Requirement (100% MANDATORY)**:
- ✅ **Analysis & Planning**: Best practices for requirement analysis, architecture planning, design patterns
- ✅ **Backend Development**: Best practices for security, validation, error handling, code patterns, Prisma usage
- ✅ **Frontend Development**: Best practices for components, state management, accessibility, i18n, Vue 3 patterns
- ✅ **All Types of Testing**: Best practices for unit tests, integration tests, E2E tests, API tests, DB tests, performance tests
- ✅ **Documentation**: Best practices for completeness, clarity, translations (all 3 languages)
- ✅ **Code Quality**: Best practices for TypeScript, linting, formatting, code organization

Follow this order to ensure consistency, completeness, and **100% best practices**:

### 1. Planning & Analysis

- Review `project-doc/BRD.md` for requirements
- Review `analiza.md` for project status and implementation details
- Check existing similar features for patterns
- Review `learning/backend.md`, `learning/frontend.md`, or `learning/qa.md` if needed
- Identify affected workspaces (backend, frontend, tests)
- Plan database schema changes (if needed) - see [05-database-rules.md](./05-database-rules.md)
- **Apply 100% best practices** - follow all project conventions, security rules, and coding standards

### 2. Database Changes (if needed)

- Update `prisma/schema.prisma`
- Create migration: `npx prisma migrate dev --name feature-name`
- Generate Prisma client: `npx prisma generate`
- Test migration on development database

See [05-database-rules.md](./05-database-rules.md) for detailed database rules.

### 3. Backend Implementation

- Create/update service layer (`{feature}.service.ts`)
- Create/update controller (`{feature}.controller.ts`)
- Create/update routes (`{feature}.routes.ts`)
- Add validation with express-validator
- **MANDATORY: Add Swagger/OpenAPI documentation for EVERY endpoint** - see [02-backend-rules.md](./02-backend-rules.md#swagger-documentation-rules)
  - **CRITICAL**: Every `router.get()`, `router.post()`, `router.put()`, `router.patch()`, `router.delete()` MUST have a `@swagger` comment above it
  - Documentation must be added IMMEDIATELY when creating or modifying endpoints
  - No endpoint can be committed without Swagger documentation
- Add error handling
- Test endpoints manually (Postman/curl)

See [02-backend-rules.md](./02-backend-rules.md) for detailed backend rules and patterns.

### 4. Backend Tests (in `backend/` folder) - IMMEDIATELY after implementation

**CRITICAL**: Write backend tests IMMEDIATELY after implementing backend functionality, before moving to frontend.

- **Unit Tests** (`backend/src/__tests__/unit/`): Test service functions, utilities, middleware
  - For new features: Write new tests
  - For updated features: Update existing tests + add tests for new behavior
- **Integration Tests** (`backend/src/__tests__/integration/`): Test API endpoints with database
  - For new features: Write new tests
  - For updated features: Update existing tests + add tests for new behavior
- Run backend tests: `npm run backend:test`
- Verify all backend tests pass before proceeding

See [04-testing-rules.md](./04-testing-rules.md) for detailed testing rules.

### 5. Frontend Implementation

- Create/update API service (`src/api/{feature}.api.ts`)
- Create/update page components (`src/pages/{feature}/`)
- Create/update reusable components (if needed)
- Add routing (`src/router/routes.ts`)
- **NEVER hardcode UI text** - always use i18n translations
- **IMMEDIATELY add/update i18n translations** for ALL user-facing text (new OR changed):
  - **For new features**: Add new translation keys to all three languages
  - **For updated features**: Update existing translation keys in all three languages + add new keys if text changed
  - Add/update in `frontend/src/locales/en/` (English)
  - Add/update in `frontend/src/locales/sr-lat/` (Serbian Latin)
  - Add/update in `frontend/src/locales/sr-cyr/` (Serbian Cyrillic)
  - Use translation keys in components: `{{ t('pages.feature.title') }}`
- **MANDATORY: Add `data-test` attributes** to ALL interactive UI elements:
  - **For new features**: Add `data-test` to all new interactive elements
  - **For updated features**: Add `data-test` to all new or modified interactive elements
  - Use kebab-case naming: `data-test="button-submit"`, `data-test="input-email"`
  - For dynamic elements: `:data-test="\`card-item-${item.id}\`"`
  - See [03-frontend-rules.md](./03-frontend-rules.md) for detailed `data-test` requirements
- Add error handling
- Test UI manually

See [03-frontend-rules.md](./03-frontend-rules.md) for detailed frontend rules and patterns.

### 6. Frontend Tests (in `frontend/` folder) - IMMEDIATELY after implementation

**CRITICAL**: Write frontend tests IMMEDIATELY after implementing frontend functionality, before updating tests in `tests/` folder.

- **Unit Tests** (`frontend/src/__tests__/`): Test composables, utils, helpers
  - For new features: Write new tests
  - For updated features: Update existing tests + add tests for new behavior
- **Component Tests** (`frontend/src/__tests__/components/`): Test Vue components
  - For new features: Write new component tests
  - For updated features: Update existing component tests + add tests for new behavior
- Run frontend tests: `npm run frontend:test`
- Verify all frontend tests pass before proceeding

See [04-testing-rules.md](./04-testing-rules.md) for detailed testing rules.

### 7. Test Suite Updates (in `tests/` folder) - AFTER backend and frontend tests

**CRITICAL**: Update tests in `tests/` folder ONLY after backend and frontend tests in their respective folders are complete and passing.

- **API Tests** (`tests/e2e/api/tests/`): Add/update tests for all endpoints with schema validation
  - For new features: Write new test files
  - For updated features: Update existing test files + add tests for new endpoints/changes
  - Run: `npm run tests:api`
- **DB Tests** (`tests/e2e/db/tests/`): Add/update tests for schema, migrations, relations (if schema changed)
  - For new features: Write new tests if schema changed
  - For updated features: Update tests if schema changed
  - Run: `npm run tests:db`
- **E2E Tests** (`tests/e2e/tests/`): Add/update tests for complete user flows
  - **⚠️ MANDATORY**: **MUST ALWAYS use Page Object Model (POM) pattern** - see [04-testing-rules.md](./04-testing-rules.md)
  - **Step 1**: Create/update Page Object classes in `tests/e2e/pages/` (if needed)
  - **Step 2**: Write E2E tests using Page Objects (NEVER use direct `page.locator()` or `page.fill()`)
  - For new features: Write new E2E tests for new user flows
  - For updated features: Update existing E2E tests + add tests for new/changed flows
  - Test all user interactions and flows
  - Run: `npm run tests:e2e`
- **Performance Tests** (`tests/performance/tests/`): Add/update tests for endpoint performance with k6
  - For new features: Add performance tests for new endpoints
  - For updated features: Update performance tests if endpoints changed
  - Run: `npm run tests:performance`

See [04-testing-rules.md](./04-testing-rules.md) for detailed testing rules.

### 8. Documentation Updates (MANDATORY for new AND updated features)

- **User Manual**: Update `user-manual/` folder:
  - **For new features**: Add new sections in all three languages
  - **For updated features**: Update existing sections in all three languages
  - Update `user-manual/en/` (English)
  - Update `user-manual/sr-lat/` (Serbian Latin)
  - Update `user-manual/sr-cyr/` (Serbian Cyrillic)
- **README Files**: Update relevant README.md files:
  - `backend/README.md` (if backend changed - new or updated)
  - `frontend/README.md` (if frontend changed - new or updated)
  - `tests/README.md` (if tests changed - new or updated)
  - Root `README.md` (if major feature added or significantly changed)
- **Setup Documentation**: Update `LOCAL_SETUP.md` if:
  - Dependencies changed
  - Setup process changed
  - New environment variables added
  - Database setup changed
- **Swagger Documentation**: Update API docs (if API changed - new endpoints or updated existing)
- **BRD.md**: Update `project-doc/BRD.md` if requirements changed or new requirements added
- **Project Analysis**: Update `analiza.md` if major features added or project status changed

See [06-documentation-rules.md](./06-documentation-rules.md) for detailed documentation rules.

### 9. Run All Tests & Verify

- Run backend tests: `npm run backend:test`
- Run frontend tests: `npm run frontend:test`
- Run API tests: `npm run tests:api`
- Run DB tests: `npm run tests:db` (if schema changed)
- Run E2E tests: `npm run tests:e2e`
- Run performance tests: `npm run tests:performance` (if new endpoints)
- Run all tests: `npm run test:all`
- Verify test coverage meets >80% threshold

See [04-testing-rules.md](./04-testing-rules.md) for detailed testing rules.

### 10. Code Review & Cleanup

- Run linter: `npm run lint` (backend and frontend)
- Fix any linting errors
- Ensure TypeScript compiles without errors
- Verify `.env.example` files are updated (if new env vars added)
- Check code review checklist (see below)
- Verify all i18n translations are complete (all 3 languages)
- Verify no hardcoded strings in UI components

## Code Review Checklist

Before submitting code, ensure:

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Code follows project conventions
- [ ] Documentation is updated (see [06-documentation-rules.md](./06-documentation-rules.md))
- [ ] `.env.example` files exist and are up-to-date with all variables documented
- [ ] No secrets or sensitive data in code
- [ ] Error handling is implemented
- [ ] i18n translations are provided (if user-facing) - see [03-frontend-rules.md](./03-frontend-rules.md)
- [ ] All interactive UI elements have `data-test` attributes - see [03-frontend-rules.md](./03-frontend-rules.md)
- [ ] Accessibility requirements are met
- [ ] Security best practices followed - see [02-backend-rules.md](./02-backend-rules.md)

### 11. Implementation Summary (MANDATORY)

**CRITICAL**: After completing all implementation, testing, and documentation, provide a comprehensive summary of what was done.

Create a summary that includes:

1. **Backend Changes**:
   - New/updated services, controllers, routes
   - New/updated database models/schema
   - New/updated validations
   - New/updated API endpoints
   - Environment variables added/changed

2. **Frontend Changes**:
   - New/updated pages/components
   - New/updated API services
   - New/updated composables
   - New/updated routes
   - i18n translations added/updated (list all languages)

3. **Testing Updates**:
   - Backend tests (unit, integration) - location and what was tested
   - Frontend tests (unit, component) - location and what was tested
   - API tests in `tests/e2e/api/` - what endpoints were tested
   - DB tests in `tests/e2e/db/` - what schema/migrations were tested
   - E2E tests in `tests/e2e/` - what user flows were tested
   - Performance tests in `tests/performance/` - what endpoints were tested

4. **Documentation Updates**:
   - README files updated
   - User manual updated (list languages)
   - API documentation (Swagger) updated
   - Setup documentation updated
   - BRD.md updated (if requirements changed)

5. **Files Created/Modified**:
   - List all files that were created
   - List all files that were modified
   - Group by workspace (backend, frontend, tests)

6. **Next Steps** (if any):
   - What needs to be done next
   - Any dependencies or prerequisites
   - Any known issues or limitations

**Format**: Use clear sections with bullet points. Be specific about file paths and what was changed in each file.

**Example Summary Structure**:
```markdown
## Implementation Summary

### Backend Changes
- Created `backend/src/modules/auth/auth.service.ts` - email/password authentication service
- Updated `backend/src/modules/auth/auth.controller.ts` - added register, login, forgotPassword, resetPassword, changePassword methods
- Updated `backend/src/modules/auth/auth.routes.ts` - added new routes for email/password auth
- Created `backend/src/utils/email.ts` - SMTP email service for password reset
- Updated `backend/prisma/schema.prisma` - added passwordHash, emailVerified to User model, created PasswordResetToken model
- Updated `backend/src/config/env.ts` - added SMTP environment variables
- Updated `backend/.env.example` - added SMTP configuration template

### Frontend Changes
- Created `frontend/src/pages/auth/RegisterPage.vue` - registration page with email/password
- Updated `frontend/src/pages/auth/LoginPage.vue` - added email/password login form
- Created `frontend/src/pages/auth/ForgotPasswordPage.vue` - forgot password page
- Created `frontend/src/pages/auth/ResetPasswordPage.vue` - reset password page
- Updated `frontend/src/pages/profile/ProfilePage.vue` - added change password section
- Updated `frontend/src/api/auth.api.ts` - added register, login, forgotPassword, resetPassword, changePassword methods
- Updated `frontend/src/composables/useAuth.ts` - added email/password auth methods
- Updated `frontend/src/router/routes.ts` - added new auth routes

### i18n Translations
- Updated `frontend/src/locales/en/pages/auth.json` - added register, forgotPassword, resetPassword translations
- Updated `frontend/src/locales/sr-lat/pages/auth.json` - added Serbian Latin translations
- Updated `frontend/src/locales/sr-cyr/pages/auth.json` - added Serbian Cyrillic translations
- Updated `frontend/src/locales/en/validation.json` - added password validation messages
- Updated `frontend/src/locales/en/errors.json` - added auth error messages
- (Similar updates for sr-lat and sr-cyr)

### Testing Updates
- Backend: Created unit tests in `backend/src/__tests__/unit/auth.service.test.ts`
- Backend: Created integration tests in `backend/src/__tests__/integration/auth.test.ts`
- Frontend: Created component tests in `frontend/src/__tests__/components/auth/`
- Tests: Updated `tests/api/tests/auth.test.ts` - added tests for new endpoints
- Tests: Updated `tests/e2e/tests/auth.spec.ts` - added E2E tests for registration and password reset flows

### Documentation Updates
- Updated `backend/README.md` - added email/password authentication section
- Updated `frontend/README.md` - added new auth pages section
- Updated `LOCAL_SETUP.md` - added SMTP configuration instructions
- Updated `project-doc/BRD.md` - marked email/password auth as implemented

### Files Created
- backend/src/modules/auth/auth.service.ts
- backend/src/utils/email.ts
- frontend/src/pages/auth/RegisterPage.vue
- frontend/src/pages/auth/ForgotPasswordPage.vue
- frontend/src/pages/auth/ResetPasswordPage.vue

### Files Modified
- backend/prisma/schema.prisma
- backend/src/modules/auth/auth.controller.ts
- backend/src/modules/auth/auth.routes.ts
- backend/src/config/env.ts
- backend/.env.example
- frontend/src/pages/auth/LoginPage.vue
- frontend/src/pages/profile/ProfilePage.vue
- frontend/src/api/auth.api.ts
- frontend/src/composables/useAuth.ts
- frontend/src/router/routes.ts
- (All i18n translation files)
```

---

## When Writing Tests

**CRITICAL**: Apply **100% testing best practices** - proper coverage, patterns, organization, and quality.

Follow this order and **write tests IMMEDIATELY** after implementing functionality:

### 1. Understand Requirements

- Review feature/endpoint to be tested
- Identify test scenarios (happy path, error cases, edge cases)
- Identify which test types are needed (unit, integration, E2E, API, DB, performance)

### 2. Setup Test Environment

- Ensure test database is configured
- Set up test fixtures/data
- Configure test helpers if needed

### 3. Write Tests (IMMEDIATELY after implementation)

**Note**: "Implementation" means BOTH:
- **New functionality**: Creating new features from scratch
- **Updating existing functionality**: Modifying, refactoring, or extending existing features

**IMPORTANT**: Test writing order follows implementation order:

1. **Backend Implementation** → **Backend Tests** (in `backend/` folder) → **API/DB/Performance Tests** (in `tests/` folder)
2. **Frontend Implementation** → **Frontend Tests** (in `frontend/` folder) → **E2E Tests** (in `tests/` folder)

**For Backend Features (new OR updated):**
- **Step 1 - Backend Tests** (in `backend/` folder - write IMMEDIATELY after backend implementation):
  - **Unit Tests** (`backend/src/__tests__/unit/`): Test service functions, utilities, middleware
    - For new features: Write new tests
    - For updated features: Update existing tests + add tests for new behavior
  - **Integration Tests** (`backend/src/__tests__/integration/`): Test API endpoints with database
    - For new features: Write new tests
    - For updated features: Update existing tests + add tests for new behavior
  - Run: `npm run backend:test`
  - Verify all tests pass before proceeding

- **Step 2 - Test Suite** (in `tests/` folder - write AFTER backend tests pass):
- **API Tests** (`tests/e2e/api/tests/`): Test all endpoints with schema validation
    - For new features: Write new test files
    - For updated features: Update existing test files + add tests for new endpoints/changes
- **DB Tests** (`tests/e2e/db/tests/`): Test schema, migrations, relations (if schema changed)
    - For new features: Write new tests if schema changed
    - For updated features: Update tests if schema changed
  - **Performance Tests** (`tests/performance/tests/`): Test endpoint performance with k6
    - For new features: Add performance tests for new endpoints
    - For updated features: Update performance tests if endpoints changed

**For Frontend Features (new OR updated):**
- **Step 1 - Frontend Tests** (in `frontend/` folder - write IMMEDIATELY after frontend implementation):
  - **Unit Tests** (`frontend/src/__tests__/`): Test composables, utils, helpers
    - For new features: Write new tests
    - For updated features: Update existing tests + add tests for new behavior
  - **Component Tests** (`frontend/src/__tests__/components/`): Test Vue components
    - For new features: Write new component tests
    - For updated features: Update existing component tests + add tests for new behavior
  - Run: `npm run frontend:test`
  - Verify all tests pass before proceeding

- **Step 2 - E2E Tests** (in `tests/` folder - write AFTER frontend tests pass):
  - **⚠️ MANDATORY**: **E2E tests MUST ALWAYS use Page Object Model (POM) pattern**
  - **Step 2a - Create/Update Page Objects** (`tests/e2e/pages/`):
    - For new features: Create new Page Object classes for new pages
    - For updated features: Update existing Page Object classes if selectors changed
    - **MUST** extend `BasePage` from `tests/e2e/pages/BasePage.ts`
    - **MUST** define all selectors as readonly properties
    - **MUST** implement `verifyPageLoaded()` method
    - **MUST** create reusable methods for user actions
    - **MUST** export from `tests/e2e/pages/index.ts`
  - **Step 2b - Write E2E Tests** (`tests/e2e/tests/`):
    - For new features: Write new E2E tests for new user flows
    - For updated features: Update existing E2E tests + add tests for new/changed flows
    - **MUST** use Page Objects - NEVER use direct `page.locator()` or `page.fill()`
    - **MUST** import Page Objects from `tests/e2e/pages/index.ts`

### 4. Test Structure

- Start with happy path (successful scenarios)
- Add error cases (validation errors, 404, 401, 403)
- Add edge cases (boundary conditions, empty data)
- Use descriptive test names: `describe('Feature', () => { it('should do something', ...) })`
- Follow existing test patterns in the project

### 5. Run & Verify

- Run tests: `npm test` (in respective workspace)
- Verify all tests pass
- Check test coverage (aim for >80%)
- Generate Allure reports if needed
- Fix any failing tests before proceeding

See [04-testing-rules.md](./04-testing-rules.md) for detailed testing rules and patterns.

---

## When Making Changes

1. **Always check existing patterns** - Look at similar code in the project
2. **Update documentation** - If you change API, update Swagger docs (see [06-documentation-rules.md](./06-documentation-rules.md))
3. **Update tests** - Add/update tests for new/changed functionality (see [04-testing-rules.md](./04-testing-rules.md))
4. **Check i18n** - If adding user-facing text, add translations (see [03-frontend-rules.md](./03-frontend-rules.md))
5. **Test locally** - Ensure everything works before committing
6. **Follow monorepo structure** - Keep workspace boundaries clear (see [00-project-overview.md](./00-project-overview.md))

---

**Related Rules**:
- [00-project-overview.md](./00-project-overview.md) - Project structure and conventions
- [02-backend-rules.md](./02-backend-rules.md) - Backend-specific rules and patterns
- [03-frontend-rules.md](./03-frontend-rules.md) - Frontend-specific rules and patterns
- [04-testing-rules.md](./04-testing-rules.md) - Testing rules and patterns
- [05-database-rules.md](./05-database-rules.md) - Database rules
- [06-documentation-rules.md](./06-documentation-rules.md) - Documentation rules