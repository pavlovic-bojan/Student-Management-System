import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../server';

describe('Health API (integration)', () => {
  it('GET /api/health should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
