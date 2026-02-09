import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tenantContext } from '../../../../middleware/tenantContext';
import { mockRequest, mockResponse } from '../../helpers/testHelpers';

describe('tenantContext middleware', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: () => void;

  beforeEach(() => {
    req = mockRequest({ headers: {} });
    res = mockResponse();
    next = vi.fn();
  });

  it('should set req.tenantId when x-tenant-id header is present', () => {
    const reqWithHeader = {
      ...req,
      header: (name: string) => (name === 'x-tenant-id' ? 'tenant-123' : undefined),
    };
    tenantContext(reqWithHeader as any, res as any, next);
    expect((reqWithHeader as any).tenantId).toBe('tenant-123');
    expect(next).toHaveBeenCalled();
  });

  it('should call next when x-tenant-id is absent', () => {
    const reqNoHeader = {
      ...req,
      header: () => undefined,
    };
    tenantContext(reqNoHeader as any, res as any, next);
    expect((reqNoHeader as any).tenantId).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
