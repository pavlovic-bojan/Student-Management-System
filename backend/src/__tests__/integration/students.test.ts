import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../server';
import { prisma } from '../../../prisma/client';

describe('Students API (integration)', () => {
  let tenantId: string;
  const indexNumber = `IDX-${Date.now()}`;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Students Test Tenant',
        code: `STU-TEST-${Date.now()}`,
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.student.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/students without auth should return 401', async () => {
    const res = await request(app).get('/api/students');
    expect(res.status).toBe(401);
  });

  it('GET /api/students with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/students with valid body should create student and return 201', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({
        indexNumber,
        firstName: 'Integration',
        lastName: 'Student',
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      indexNumber,
      firstName: 'Integration',
      lastName: 'Student',
    });
    expect(res.body.data.id).toBeDefined();
  });

  it('POST /api/students with duplicate index in same tenant should return 409', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({
        indexNumber,
        firstName: 'Other',
        lastName: 'Student',
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already exists');
  });

  it('POST /api/students without tenant context should return 400', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('x-test-user-id', 'test-user')
      .send({
        indexNumber: 'OTHER-001',
        firstName: 'A',
        lastName: 'B',
      });
    expect(res.status).toBe(401);
  });
});
