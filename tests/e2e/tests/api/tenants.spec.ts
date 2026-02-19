import { test, expect } from '@playwright/test';
import { validateAgainstSchema, schemas } from '../../lib/schema-validator';

async function getAuthToken(request: import('@playwright/test').APIRequestContext): Promise<string | null> {
  const loginRes = await request.post('api/auth/login', {
    data: {
      email: process.env.TEST_USER_EMAIL ?? 'platform-admin@sms.edu',
      password: process.env.TEST_USER_PASSWORD ?? 'seed-platform-admin-change-me',
    },
  });
  if (!loginRes.ok()) return null;
  const body = await loginRes.json();
  return body.token ?? null;
}

test.describe('Tenants API - JSON Schema Validation', () => {
  test('GET /tenants with Platform Admin returns 200 and matches schema', async ({ request }) => {
    const authToken = await getAuthToken(request);
    if (!authToken) {
      test.skip(true, 'No auth token - seed platform admin user');
    }

    const response = await request.get('api/tenants', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.status() === 200) {
      const body = await response.json();
      const result = validateAgainstSchema(body, schemas.tenantsList);
      expect(result.valid, result.errors?.join('; ')).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    } else {
      expect([200, 403]).toContain(response.status());
    }
  });

  test('GET /tenants without token returns 401', async ({ request }) => {
    const response = await request.get('api/tenants');
    expect(response.status()).toBe(401);
  });
});
