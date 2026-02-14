import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

const platformAdminHeaders = () =>
  ({
    'Content-Type': 'application/json',
    'x-test-tenant-id': '00000000-0000-0000-0000-000000000001',
    'x-test-user-id': 'platform-admin-tenant-test',
    'x-test-role': 'PLATFORM_ADMIN',
  }) as const;

describe('Tenants API (integration)', () => {
  const code = `TEST-TENANT-${Date.now()}`;
  let createdTenantId: string;

  afterAll(async () => {
    await prisma.tenant.deleteMany({ where: { code } }).catch(() => {});
    if (createdTenantId) await prisma.tenant.deleteMany({ where: { id: createdTenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/tenants without auth should return 401', async () => {
    const res = await request(app).get('/api/tenants');
    expect(res.status).toBe(401);
  });

  it('GET /api/tenants with SCHOOL_ADMIN should return 403', async () => {
    const res = await request(app)
      .get('/api/tenants')
      .set('x-test-tenant-id', 't1')
      .set('x-test-user-id', 'school-admin')
      .set('x-test-role', 'SCHOOL_ADMIN');
    expect(res.status).toBe(403);
  });

  it('GET /api/tenants with Platform Admin should return 200 and array', async () => {
    const res = await request(app).get('/api/tenants').set(platformAdminHeaders());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/tenants without auth should return 401', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .send({ name: 'Test', code })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(401);
  });

  it('POST /api/tenants with Platform Admin should create tenant and return 201', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .set(platformAdminHeaders())
      .send({ name: 'Test Tenant', code });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Test Tenant', code, isActive: true });
    expect(res.body.data.id).toBeDefined();
    createdTenantId = res.body.data.id;
  });

  it('POST /api/tenants with duplicate code should return 409', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .set(platformAdminHeaders())
      .send({ name: 'Other', code });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already exists');
  });

  it('PATCH /api/tenants/:id with Platform Admin should update name and return 200', async () => {
    if (!createdTenantId) return; // skip when POST failed (e.g. no DB)
    const res = await request(app)
      .patch(`/api/tenants/${createdTenantId}`)
      .set(platformAdminHeaders())
      .send({ name: 'Test Tenant Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Tenant Updated');
    expect(res.body.data.code).toBe(code);
  });

  it('PATCH /api/tenants/:id with isActive false should deactivate tenant', async () => {
    if (!createdTenantId) return;
    const res = await request(app)
      .patch(`/api/tenants/${createdTenantId}`)
      .set(platformAdminHeaders())
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('PATCH /api/tenants/:id for non-existent id should return 404', async () => {
    const res = await request(app)
      .patch('/api/tenants/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee')
      .set(platformAdminHeaders())
      .send({ name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });

  it('PATCH /api/tenants/:id without auth should return 401', async () => {
    const id = createdTenantId ?? 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    const res = await request(app).patch(`/api/tenants/${id}`).send({ name: 'X' });
    expect(res.status).toBe(401);
  });
});
