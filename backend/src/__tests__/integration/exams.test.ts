import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

describe('Exams API (integration)', () => {
  let tenantId: string;
  const periodName = `EXAM-PERIOD-${Date.now()}`;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Exams Test Tenant',
        code: `EXAM-TEST-${Date.now()}`,
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.examTerm.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.examPeriod.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/exams/periods without auth should return 401', async () => {
    const res = await request(app).get('/api/exams/periods');
    expect(res.status).toBe(401);
  });

  it('GET /api/exams/periods with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/exams/periods')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/exams/periods with valid body should create period and return 201', async () => {
    const res = await request(app)
      .post('/api/exams/periods')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name: periodName, term: 'WINTER', year: 2025 });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: periodName,
      term: 'WINTER',
      year: 2025,
    });
    expect(res.body.data.id).toBeDefined();
  });

  it('GET /api/exams/terms with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/exams/terms')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
