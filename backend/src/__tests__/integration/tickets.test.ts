import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../server';

const prisma = new PrismaClient();

describe('Tickets API (integration)', () => {
  let tenantId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Tickets Test Tenant',
        code: `TICK-${Date.now()}`,
      },
    });
    tenantId = tenant.id;
  });

  it('POST /api/tickets should create a ticket when valid', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'user-tickets-1')
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
      createdById: 'user-tickets-1',
      status: 'NEW',
    });
  });

  it('POST /api/tickets should validate input', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'user-tickets-2')
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
      .set('x-test-user-id', 'user-tickets-3')
      .send(payload);

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/tickets')
      .set('x-test-tenant-id', tenantId)
      .set('x-test-user-id', 'user-tickets-3')
      .send(payload);

    expect(second.status).toBe(429);
  });
});

