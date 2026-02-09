import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler, ApiError } from '../../../../middleware/errorHandler';
import { mockRequest, mockResponse } from '../../helpers/testHelpers';

vi.mock('../../../../utils/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('errorHandler', () => {
  let req: ReturnType<typeof mockRequest>;
  let res: ReturnType<typeof mockResponse>;
  let next: () => void;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = () => {};
  });

  it('should send statusCode and message for ApiError', () => {
    const err = new ApiError('Not found', 404);
    errorHandler(err, req as any, res as any, next);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Not found' });
  });

  it('should send 500 for non-ApiError', () => {
    const err = new Error('Unexpected');
    errorHandler(err, req as any, res as any, next);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Internal server error' });
  });

  it('ApiError should have statusCode property', () => {
    const err = new ApiError('Forbidden', 403);
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });
});
