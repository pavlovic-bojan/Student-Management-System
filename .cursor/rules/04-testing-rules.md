# Testing Rules

> **⚠️ CRITICAL**: Always apply **100% testing best practices** - see [01-development-workflow.md](./01-development-workflow.md)

## Testing Rules

- **E2E**: Playwright with Page Object Model pattern
- **API Tests**: Playwright test runner (HTTP API tests)
- **DB Tests**: Playwright test runner + Prisma
- **Performance**: k6
- All tests must generate Allure reports
- Test files: `*.test.ts` or `*.spec.ts`
- Use descriptive test names: `describe('Feature', () => { it('should do something', ...) })`

## Test Coverage

- Aim for >80% code coverage
- Test critical paths and edge cases
- Mock external dependencies
- Use fixtures for test data

## E2E Tests

**⚠️ CRITICAL: E2E tests MUST ALWAYS use Page Object Model (POM) pattern. This is MANDATORY and non-negotiable.**

### Why POM is Mandatory

- **Maintainability**: UI changes require updates in one place (Page Object), not in every test
- **Reusability**: Page methods can be reused across multiple tests
- **Readability**: Tests are cleaner and more readable
- **Best Practice**: Industry standard for E2E testing
- **Consistency**: All E2E tests follow the same pattern

### POM Requirements

- **MUST** create a Page Object class for every page/component tested
- **MUST** extend `BasePage` from `tests/e2e/pages/BasePage.ts`
- **MUST** define all selectors as readonly properties in the Page Object
- **MUST** implement `verifyPageLoaded()` method
- **MUST** create reusable methods for user actions (click, fill, submit, etc.)
- **MUST** export Page Objects from `tests/e2e/pages/index.ts`
- **MUST** use Page Objects in all E2E test files
- **NEVER** use direct `page.locator()` or `page.fill()` in test files - always use Page Object methods
- **NEVER** hardcode selectors in test files - always use Page Object selectors

### E2E Test Rules

- Test user flows, not implementation details
- **MANDATORY**: Use `data-test` attributes for all selectors (defined in Page Objects)
- **MANDATORY**: All UI elements must have `data-test` attributes (see [03-frontend-rules.md](./03-frontend-rules.md))
- Clean up test data after tests
- Use descriptive test names
- Group related tests in describe blocks

**⚠️ CRITICAL**: E2E tests MUST use `data-test` attributes for selectors. If a UI element is missing `data-test`, add it to the component first, then update the Page Object and tests.

### E2E Test Structure (POM Pattern - MANDATORY)

**Step 1: Create Page Object** (if it doesn't exist)

```typescript
// tests/e2e/pages/FeaturePage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FeaturePage extends BasePage {
  // All selectors as readonly properties
  readonly nameInput = '[data-test="input-feature-name"]';
  readonly submitButton = '[data-test="button-submit"]';
  readonly successMessage = '[data-test="success-message"]';
  readonly errorMessage = '[data-test="error-message"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto('/feature');
    await this.verifyPageLoaded();
  }

  async verifyPageLoaded(): Promise<void> {
    await this.waitForVisible(this.nameInput);
  }

  // Reusable methods for user actions
  async createFeature(name: string): Promise<void> {
    await this.fill(this.nameInput, name);
    await this.click(this.submitButton);
    await this.waitForLoad();
  }

  async hasSuccessMessage(): Promise<boolean> {
    return await this.isVisible(this.successMessage);
  }
}
```

**Step 2: Export Page Object**

```typescript
// tests/e2e/pages/index.ts
export { FeaturePage } from './FeaturePage';
```

**Step 3: Write E2E Test using Page Object**

```typescript
// tests/e2e/tests/feature.spec.ts
import { test, expect } from '@playwright/test';
import { FeaturePage } from '../pages'; // Import from index.ts

test.describe('Feature E2E Tests', () => {
  test('should create new feature', async ({ page }) => {
    // ALWAYS use Page Object - NEVER use page.locator() directly
    const featurePage = new FeaturePage(page);
    await featurePage.goto();
    await featurePage.createFeature('Test Feature');
    
    // Use Page Object methods for assertions
    expect(await featurePage.hasSuccessMessage()).toBe(true);
  });
});
```

### ❌ WRONG - Direct Selectors (DO NOT DO THIS)

```typescript
// ❌ NEVER write tests like this
test('should create feature', async ({ page }) => {
  await page.goto('/feature');
  await page.fill('[data-test="input-name"]', 'Test'); // ❌ Direct selector
  await page.click('[data-test="button-submit"]'); // ❌ Direct selector
});
```

### ✅ CORRECT - Page Object Model (ALWAYS DO THIS)

```typescript
// ✅ ALWAYS write tests using Page Objects
test('should create feature', async ({ page }) => {
  const featurePage = new FeaturePage(page);
  await featurePage.goto();
  await featurePage.createFeature('Test'); // ✅ Use Page Object method
});
```

## API Tests

- Test all endpoints using Playwright test runner
- Test authentication and authorization
- Test validation errors
- Test error handling

### API Test Structure (Playwright)

```typescript
// tests/e2e/api/tests/feature.test.ts
import { test, expect } from '@playwright/test';

test.describe('Feature API', () => {
  test('should return 200 for valid request', async ({ request }) => {
    const response = await request.get('/api/features', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
  });
});
```

## Backend Tests

### Unit Tests

- Location: `backend/src/__tests__/unit/`
- Test service functions, utilities, middleware
- Mock external dependencies
- Test edge cases and error scenarios

### Integration Tests

- Location: `backend/src/__tests__/integration/`
- Test API endpoints with database
- Use test database
- Clean up test data after tests

## Frontend Tests

### Unit Tests

- Location: `frontend/src/__tests__/`
- Test composables, utils, helpers
- Mock API calls
- Test edge cases

### Component Tests

- Location: `frontend/src/__tests__/components/`
- Test Vue components
- Use Vue Test Utils
- Test user interactions

### Component Test Structure

```typescript
// frontend/src/__tests__/components/FeatureComponent.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FeatureComponent from 'src/components/FeatureComponent.vue';

describe('FeatureComponent', () => {
  it('should render feature name', () => {
    const wrapper = mount(FeatureComponent, {
      props: { name: 'Test Feature' },
    });
    
    expect(wrapper.text()).toContain('Test Feature');
  });
});
```

## DB Tests

- Location: `tests/e2e/db/tests/`
- Test schema, migrations, relations
- Test database constraints
- Test data integrity

## Performance Tests

- Location: `tests/performance/tests/`
- Test endpoint performance with k6
- Test load, stress, and spike scenarios
- Monitor response times and error rates

## E2E Test Checklist

Before writing E2E tests, ensure:

- [ ] Page Object class exists in `tests/e2e/pages/` (create if needed)
- [ ] Page Object extends `BasePage`
- [ ] All selectors are defined as readonly properties
- [ ] `verifyPageLoaded()` method is implemented
- [ ] Reusable methods exist for user actions
- [ ] Page Object is exported from `tests/e2e/pages/index.ts`
- [ ] Test file imports Page Object from `tests/e2e/pages/index.ts`
- [ ] Test uses Page Object methods, not direct `page.locator()` or `page.fill()`
- [ ] Test has descriptive name
- [ ] Test cleans up test data after execution

## E2E Test Examples

### Example 1: Simple Page Object

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput = '[data-test="input-login-email"]';
  readonly passwordInput = '[data-test="input-login-password"]';
  readonly submitButton = '[data-test="button-login-submit"]';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await super.goto('/auth/login');
    await this.verifyPageLoaded();
  }

  async verifyPageLoaded(): Promise<void> {
    await this.waitForVisible(this.emailInput);
  }

  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.submitButton);
    await this.waitForLoad();
  }
}
```

### Example 2: Using Page Object in Test

```typescript
// tests/e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages'; // ✅ Import from index.ts

test.describe('Login E2E Tests', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page); // ✅ Use Page Object
    await loginPage.goto();
    await loginPage.login('test@example.com', 'Password123!'); // ✅ Use Page Object method
    
    await loginPage.waitForLoginSuccess(); // ✅ Use Page Object method
    expect(page.url()).toMatch(/\/(dashboard|home)/);
  });
});
```

---

**Related Rules**:
- [01-development-workflow.md](./01-development-workflow.md) - When to write tests (includes POM requirements)
- [02-backend-rules.md](./02-backend-rules.md) - Backend rules
- [03-frontend-rules.md](./03-frontend-rules.md) - Frontend rules