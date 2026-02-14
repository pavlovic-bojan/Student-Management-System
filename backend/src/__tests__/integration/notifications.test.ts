import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../../prisma/client';

describe('Notifications API (integration)', () => {
  let tenantId: string;
  let userId: string;
  let notificationId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Notifications Test Tenant',
        code: `NOTIF-${Date.now()}`,
      },
    });
    tenantId = tenant.id;

    const user = await prisma.user.create({
      data: {
        email: `notif-user-${Date.now()}@test.edu`,
        password: 'hashed',
        firstName: 'Notif',
        lastName: 'User',
        role: 'SCHOOL_ADMIN',
        tenantId,
      },
    });
    userId = user.id;

    const notif = await prisma.notification.create({
      data: {
        userId,
        type: 'USER_ACTION',
        action: 'CREATED',
        targetEmail: 'target@test.edu',
        actorRole: 'PLATFORM_ADMIN',
        tenantName: 'Test School',
        read: false,
      },
    });
    notificationId = notif.id;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { tenantId } }).catch(() => {});
    await prisma.tenant.deleteMany({ where: { id: tenantId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('GET /api/notifications without auth should return 401', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications with x-test-user-id should return 200 and array', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userId);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
    const first = res.body.notifications.find((n: { id: string }) => n.id === notificationId);
    expect(first).toBeDefined();
    expect(first.type).toBe('USER_ACTION');
    expect(first.action).toBe('CREATED');
    expect(first.read).toBe(false);
  });

  it('GET /api/notifications?unreadOnly=false should return all', async () => {
    const res = await request(app)
      .get('/api/notifications?unreadOnly=false')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userId);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it('POST /api/notifications/mark-read with valid ids should return 204', async () => {
    const res = await request(app)
      .post('/api/notifications/mark-read')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userId)
      .send({ ids: [notificationId] });
    expect(res.status).toBe(204);

    const updated = await prisma.notification.findUnique({ where: { id: notificationId } });
    expect(updated?.read).toBe(true);
  });

  it('POST /api/notifications/mark-read without auth should return 401', async () => {
    const res = await request(app)
      .post('/api/notifications/mark-read')
      .send({ ids: [notificationId] });
    expect(res.status).toBe(401);
  });
});
