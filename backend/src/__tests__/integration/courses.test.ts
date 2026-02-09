import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

describe('Courses API (integration)', () => {
  let tenantId: string;
  const code = `COURSE-${Date.now()}`;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Courses Test Tenant',
        code: `COURSE-TEST-${Date.now()}`,
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.course.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/courses without auth should return 401', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(401);
  });

  it('GET /api/courses with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/courses with valid body should create course and return 201', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name: 'Algebra', code });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Algebra', code });
    expect(res.body.data.id).toBeDefined();
  });
});
