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

  it('PATCH /api/courses/{id} with valid body should update course and return 200', async () => {
    const course = await prisma.course.create({
      data: { tenantId, name: 'Before Update', code: `PATCH-${Date.now()}` },
    });
    const res = await request(app)
      .patch(`/api/courses/${course.id}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name: 'After Update' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: course.id,
      name: 'After Update',
    });
    await prisma.course.delete({ where: { id: course.id } }).catch(() => {});
  });

  it('PATCH /api/courses/{id} for non-existent id should return 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .patch(`/api/courses/${fakeId}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/courses/{id} should delete course and return 204', async () => {
    const course = await prisma.course.create({
      data: { tenantId, name: 'To Delete', code: `DEL-${Date.now()}` },
    });
    const res = await request(app)
      .delete(`/api/courses/${course.id}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(204);
    const found = await prisma.course.findUnique({ where: { id: course.id } });
    expect(found).toBeNull();
  });

  it('DELETE /api/courses/{id} for non-existent id should return 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .delete(`/api/courses/${fakeId}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(404);
  });
});
