import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

describe('Finance API (integration)', () => {
  let tenantId: string;
  let studentId: string;
  let tuitionId: string;
  const tuitionName = `TUITION-${Date.now()}`;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Finance Test Tenant',
        code: `FIN-TEST-${Date.now()}`,
      },
    });
    tenantId = tenant.id;
    const student = await prisma.student.create({
      data: {
        indexNumber: `FIN-STU-${Date.now()}`,
        firstName: 'Finance',
        lastName: 'Student',
        tenantId,
      },
    });
    studentId = student.id;
    const tuition = await prisma.tuition.create({
      data: {
        tenantId,
        name: tuitionName,
        amount: 1000,
      },
    });
    tuitionId = tuition.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tuition.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.student.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/finance/tuitions without auth should return 401', async () => {
    const res = await request(app).get('/api/finance/tuitions');
    expect(res.status).toBe(401);
  });

  it('GET /api/finance/tuitions with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/finance/tuitions')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/finance/tuitions with valid body should create tuition and return 201', async () => {
    const name = `New-Tuition-${Date.now()}`;
    const res = await request(app)
      .post('/api/finance/tuitions')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name, amount: 500 });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name, amount: 500 });
    expect(res.body.data.id).toBeDefined();
  });

  it('GET /api/finance/payments with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/finance/payments')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/finance/payments with valid body should create payment and return 201', async () => {
    const res = await request(app)
      .post('/api/finance/payments')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({
        studentId,
        tuitionId,
        amount: 500,
        paidAt: new Date().toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ studentId, tuitionId, amount: 500 });
    expect(res.body.data.id).toBeDefined();
  });
});
