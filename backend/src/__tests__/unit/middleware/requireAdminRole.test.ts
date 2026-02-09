import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAdminOrSchoolAdmin, requireCanCreateUser } from '../../../../middleware/requireAdminRole';
import { mockRequest, mockResponse } from '../../helpers/testHelpers';

describe('requireAdminOrSchoolAdmin', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = vi.fn();
  });

  it('should call next when role is PLATFORM_ADMIN', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'PLATFORM_ADMIN' };
    requireAdminOrSchoolAdmin(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next when role is SCHOOL_ADMIN', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'SCHOOL_ADMIN' };
    requireAdminOrSchoolAdmin(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with ApiError 403 when role is PROFESSOR', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'PROFESSOR' };
    requireAdminOrSchoolAdmin(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    const err = (next as any).mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('Platform Admin or School Admin');
  });

  it('should call next with ApiError 403 when role is STUDENT', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'STUDENT' };
    requireAdminOrSchoolAdmin(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    const err = (next as any).mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });

  it('should call next with ApiError 403 when user is missing', () => {
    (req as any).user = undefined;
    requireAdminOrSchoolAdmin(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    const err = (next as any).mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });
});

describe('requireCanCreateUser', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = vi.fn();
  });

  it('should call next when role is PLATFORM_ADMIN', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'PLATFORM_ADMIN' };
    requireCanCreateUser(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next when role is SCHOOL_ADMIN', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'SCHOOL_ADMIN' };
    requireCanCreateUser(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next when role is PROFESSOR', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'PROFESSOR' };
    requireCanCreateUser(req as any, res as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with ApiError 403 when role is STUDENT', () => {
    (req as any).user = { sub: 'u1', tenantId: 't1', role: 'STUDENT' };
    requireCanCreateUser(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    const err = (next as any).mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('Professor can create users');
  });
});
