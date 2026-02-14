import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

describe('Records API (integration)', () => {
  let tenantId: string;
  let studentId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Records Test Tenant',
        code: `REC-TEST-${Date.now()}`,
      },
    });
    tenantId = tenant.id;
    const student = await prisma.student.create({
      data: {
        firstName: 'Records',
        lastName: 'Student',
      },
    });
    await prisma.studentTenant.create({
      data: {
        studentId: student.id,
        tenantId,
        indexNumber: `REC-STU-${Date.now()}`,
      },
    });
    studentId = student.id;
  });

  afterAll(async () => {
    await prisma.transcript.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.studentTenant.deleteMany({ where: { tenantId } }).catch(() => {});
    if (studentId) await prisma.student.delete({ where: { id: studentId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/records/transcripts without auth should return 401', async () => {
    const res = await request(app).get('/api/records/transcripts');
    expect(res.status).toBe(401);
  });

  it('GET /api/records/transcripts with x-test-tenant-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/records/transcripts')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/records/transcripts with valid body should create transcript and return 201', async () => {
    const res = await request(app)
      .post('/api/records/transcripts')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ studentId });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ studentId });
    expect(res.body.data.id).toBeDefined();
  });
});
