import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

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
    await prisma.studentTenant.deleteMany({ where: { tenantId } }).catch(() => {});
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
    expect(res.body.data.enrollmentId).toBeDefined();
    expect(res.body.data.studentId).toBeDefined();
    expect(res.body.data.tenantName).toBeDefined();
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
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('POST /api/students without tenant context should return 401', async () => {
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

  it('PATCH /api/students/{studentId} with valid body should update student and return 200', async () => {
    const student = await prisma.student.create({
      data: {
        firstName: 'Before',
        lastName: 'Update',
      },
    });
    await prisma.studentTenant.create({
      data: {
        studentId: student.id,
        tenantId,
        indexNumber: `PATCH-${Date.now()}`,
      },
    });
    const res = await request(app)
      .patch(`/api/students/${student.id}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ firstName: 'After', lastName: 'Update' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: student.id,
      firstName: 'After',
      lastName: 'Update',
    });
    await prisma.studentTenant.deleteMany({ where: { studentId: student.id } });
    await prisma.student.delete({ where: { id: student.id } });
  });

  it('PATCH /api/students/{studentId} for non-existent id should return 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .patch(`/api/students/${fakeId}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ firstName: 'X' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/students/enrollments/{enrollmentId} should remove enrollment and return 204', async () => {
    const student = await prisma.student.create({
      data: {
        firstName: 'ToDelete',
        lastName: 'Enrollment',
      },
    });
    const enrollment = await prisma.studentTenant.create({
      data: {
        studentId: student.id,
        tenantId,
        indexNumber: `DEL-${Date.now()}`,
      },
    });
    const res = await request(app)
      .delete(`/api/students/enrollments/${enrollment.id}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(204);
    const found = await prisma.studentTenant.findUnique({ where: { id: enrollment.id } });
    expect(found).toBeNull();
    await prisma.student.delete({ where: { id: student.id } });
  });

  it('DELETE /api/students/enrollments/{enrollmentId} for non-existent id should return 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .delete(`/api/students/enrollments/${fakeId}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(404);
  });
});
