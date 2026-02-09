import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../../middleware/authenticate';
import { mockRequest, mockResponse } from '../../helpers/testHelpers';

vi.mock('../../../config/env', () => ({
  env: { jwtSecret: 'test-jwt-secret-min-32-chars-long' },
}));

describe('authenticate middleware', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: ReturnType<typeof import('vitest').vi.fn>;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    process.env.SKIP_AUTH_FOR_TESTS = '';
    req = mockRequest();
    res = mockResponse();
    next = vi.fn();
  });

  it('should return 401 when Authorization header is missing', () => {
    const reqNoAuth = {
      ...req,
      header: () => undefined,
    };
    authenticate(reqNoAuth as any, res as any, next);
    expect(res.statusCode).toBe(401);
    expect((res as any).body).toEqual({ message: 'Missing Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    const reqWithToken = {
      ...req,
      header: (name: string) =>
        name === 'authorization' ? 'Bearer invalid-token' : undefined,
    };
    authenticate(reqWithToken as any, res as any, next);
    expect(res.statusCode).toBe(401);
    expect((res as any).body).toEqual({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.user and req.tenantId and call next when token is valid', () => {
    const payload = { sub: 'user-1', tenantId: 'tenant-1', role: 'SCHOOL_ADMIN' };
    const token = jwt.sign(
      payload,
      'test-jwt-secret-min-32-chars-long',
      { expiresIn: '1h' },
    );
    const reqWithToken = {
      ...req,
      header: (name: string) =>
        name === 'authorization' ? `Bearer ${token}` : undefined,
    };
    authenticate(reqWithToken as any, res as any, next);
    expect((reqWithToken as any).user).toMatchObject({
      sub: 'user-1',
      tenantId: 'tenant-1',
      role: 'SCHOOL_ADMIN',
    });
    expect((reqWithToken as any).tenantId).toBe('tenant-1');
    expect(next).toHaveBeenCalled();
  });

  it('should bypass auth in test mode when x-test-tenant-id is set', () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_AUTH_FOR_TESTS = '1';
    const reqTest = {
      ...req,
      header: (name: string) =>
        name === 'x-test-tenant-id'
          ? 'test-tenant-id'
          : name === 'x-test-user-id'
            ? 'test-user-id'
            : undefined,
    };
    authenticate(reqTest as any, res as any, next);
    expect((reqTest as any).tenantId).toBe('test-tenant-id');
    expect((reqTest as any).user).toMatchObject({
      sub: 'test-user-id',
      tenantId: 'test-tenant-id',
      role: 'SCHOOL_ADMIN',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should use x-test-role when provided in test mode', () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_AUTH_FOR_TESTS = '1';
    const reqTest = {
      ...req,
      header: (name: string) =>
        name === 'x-test-tenant-id'
          ? 'test-tenant-id'
          : name === 'x-test-user-id'
            ? 'test-user-id'
            : name === 'x-test-role'
              ? 'PLATFORM_ADMIN'
              : undefined,
    };
    authenticate(reqTest as any, res as any, next);
    expect((reqTest as any).user?.role).toBe('PLATFORM_ADMIN');
    expect(next).toHaveBeenCalled();
  });
});
