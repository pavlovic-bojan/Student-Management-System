import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../server';
import { prisma } from '../../../prisma/client';

describe('Tenants API (integration)', () => {
  const code = `TEST-TENANT-${Date.now()}`;

  afterAll(async () => {
    await prisma.tenant.deleteMany({ where: { code } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/tenants should return 200 and array', async () => {
    const res = await request(app).get('/api/tenants');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/tenants should create tenant and return 201', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .send({ name: 'Test Tenant', code })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Test Tenant', code });
    expect(res.body.data.id).toBeDefined();
  });

  it('POST /api/tenants with duplicate code should return 409', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .send({ name: 'Other', code })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already exists');
  });
});
