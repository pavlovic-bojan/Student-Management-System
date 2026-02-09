import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../server';
import { prisma } from '../../../prisma/client';

describe('Programs API (integration)', () => {
  let tenantId: string;
  const code = `PROG-${Date.now()}`;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Programs Test Tenant',
        code: `PROG-TEST-${Date.now()}`,
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.program.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/programs without auth should return 401', async () => {
    const res = await request(app).get('/api/programs');
    expect(res.status).toBe(401);
  });

  it('GET /api/programs with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/programs')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/programs with valid body should create program and return 201', async () => {
    const res = await request(app)
      .post('/api/programs')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name: 'Computer Science', code });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Computer Science', code });
    expect(res.body.data.id).toBeDefined();
  });
});
