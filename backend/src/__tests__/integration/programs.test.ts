import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

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

  it('PATCH /api/programs/{id} with valid body should update program and return 200', async () => {
    const program = await prisma.program.create({
      data: { tenantId, name: 'Before Update', code: `PATCH-${Date.now()}` },
    });
    const res = await request(app)
      .patch(`/api/programs/${program.id}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name: 'After Update' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: program.id,
      name: 'After Update',
    });
    await prisma.program.delete({ where: { id: program.id } }).catch(() => {});
  });

  it('PATCH /api/programs/{id} for non-existent id should return 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .patch(`/api/programs/${fakeId}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user')
      .send({ name: 'X' });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/programs/{id} should delete program and return 204', async () => {
    const program = await prisma.program.create({
      data: { tenantId, name: 'To Delete', code: `DEL-${Date.now()}` },
    });
    const res = await request(app)
      .delete(`/api/programs/${program.id}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(204);
    const found = await prisma.program.findUnique({ where: { id: program.id } });
    expect(found).toBeNull();
  });

  it('DELETE /api/programs/{id} for non-existent id should return 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await request(app)
      .delete(`/api/programs/${fakeId}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'test-user');
    expect(res.status).toBe(404);
  });
});
