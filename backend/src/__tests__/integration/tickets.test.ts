import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { app } from '../../server';

const prisma = new PrismaClient();

describe('Tickets API (integration)', () => {
  let tenantId: string;
  let createdTicketId: string;
  let userOneId: string;
  let userThreeId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Tickets Test Tenant',
        code: `TICK-${Date.now()}`,
      },
    });
    tenantId = tenant.id;

    userOneId = randomUUID();
    userThreeId = randomUUID();

    // Create test users so Ticket.createdById foreign key is satisfied
    await prisma.user.create({
      data: {
        id: userOneId,
        email: `tickets1-${userOneId}@example.com`,
        password: 'hashed-password',
        firstName: 'Tickets',
        lastName: 'UserOne',
        role: 'PLATFORM_ADMIN',
        tenantId,
      },
    });

    await prisma.user.create({
      data: {
        id: userThreeId,
        email: `tickets3-${userThreeId}@example.com`,
        password: 'hashed-password',
        firstName: 'Tickets',
        lastName: 'UserThree',
        role: 'PLATFORM_ADMIN',
        tenantId,
      },
    });
  });

  it('POST /api/tickets should create a ticket when valid', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userOneId)
      .send({
        subject: 'Bug in dashboard',
        description: 'When I click on button X, I see an error in the console.',
        page: 'Dashboard',
        steps: '1. Login\n2. Open dashboard\n3. Click button X',
        expectedActual: 'Expected: no error.\nActual: error in console.',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      subject: 'Bug in dashboard',
      description: 'When I click on button X, I see an error in the console.',
      page: 'Dashboard',
      steps: '1. Login\n2. Open dashboard\n3. Click button X',
      expectedActual: 'Expected: no error.\nActual: error in console.',
      tenantId,
      createdById: userOneId,
      status: 'NEW',
    });

    createdTicketId = res.body.data.id;
  });

  it('POST /api/tickets should validate input', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userOneId)
      .send({
        subject: 'shrt',
        description: 'short',
      });

    expect(res.status).toBe(400);
  });

  it('POST /api/tickets should enforce cooldown per user', async () => {
    const payload = {
      subject: 'Bug in exams',
      description: 'Something is broken.',
    };

    const first = await request(app)
      .post('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userThreeId)
      .send(payload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userThreeId)
      .send(payload);

    expect(second.status).toBe(429);
  });

  it('GET /api/tickets should list tickets for tenant with filters', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userOneId)
      .set('x-test-role', 'PLATFORM_ADMIN');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const first = res.body.data[0];
    expect(first).toHaveProperty('subject');
    expect(first).toHaveProperty('tenantName');
    expect(first).toHaveProperty('reporterName');
  });

  it('PATCH /api/tickets/:id should allow admin to toggle priority', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${createdTicketId}`)
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', userOneId)
      .set('x-test-role', 'PLATFORM_ADMIN')
      .send({ isPriority: true });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: createdTicketId,
      isPriority: true,
    });
  });
});

