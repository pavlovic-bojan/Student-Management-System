import { Request, Response } from 'express';

/**
 * Create a mock Express Request with optional body, params, headers.
 */
export function mockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    header: (name: string) => (overrides.headers as Record<string, string>)?.[name],
    ...overrides,
  };
}

/**
 * Create a mock Express Response with spy methods.
 */
export function mockResponse(): Partial<Response> & { statusCode: number; body: unknown } {
  const res: Partial<Response> & { statusCode: number; body: unknown } = {
    statusCode: 200,
    body: undefined,
  };
  res.status = ((code: number) => {
    res.statusCode = code;
    return res as Response;
  }) as Response['status'];
  res.json = ((data: unknown) => {
    res.body = data;
    return res as Response;
  }) as Response['json'];
  res.send = (() => res as Response) as Response['send'];
  return res;
}

/**
 * Create a mock NextFunction that captures calls.
 */
export function mockNext(): (err?: unknown) => void {
  return (err?: unknown) => {
    if (err) throw err;
  };
}
