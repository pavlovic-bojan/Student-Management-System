import { test, expect } from '@playwright/test';
import { LoginPage, TicketsPage } from '../../pages';

test.describe('Auth E2E Tests', () => {
  test('should show login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');

    await expect(page.locator(loginPage.errorMessage)).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully and redirect to tickets', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? 'platform-admin@sms.edu';
    const password = process.env.TEST_USER_PASSWORD ?? 'seed-platform-admin-change-me';

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    await expect(page).toHaveURL(/\/(tickets)?$/);
    const ticketsPage = new TicketsPage(page);
    await ticketsPage.verifyPageLoaded();
  });
});
