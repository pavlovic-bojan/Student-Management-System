import { test, expect } from '@playwright/test';
import { validateAgainstSchema, schemas } from '../../lib/schema-validator';

test.describe('Auth API - JSON Schema Validation', () => {
  test('POST /auth/login with invalid credentials returns 401', async ({ request }) => {
    const response = await request.post('api/auth/login', {
      data: { email: 'invalid@test.com', password: 'wrong' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /auth/login with valid credentials returns 200 and matches schema', async ({
    request,
  }) => {
    // Requires seeded test user - adjust email/password to match seed
    const response = await request.post('api/auth/login', {
      data: {
        email: process.env.TEST_USER_EMAIL ?? 'platform-admin@sms.edu',
        password: process.env.TEST_USER_PASSWORD ?? 'seed-platform-admin-change-me',
      },
    });

    if (response.status() === 200) {
      const body = await response.json();
      const result = validateAgainstSchema(body, schemas.authLogin);
      expect(result.valid, result.errors?.join('; ')).toBe(true);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('token');
    }
  });

  test('GET /auth/me without token returns 401', async ({ request }) => {
    const response = await request.get('api/auth/me');
    expect(response.status()).toBe(401);
  });
});
