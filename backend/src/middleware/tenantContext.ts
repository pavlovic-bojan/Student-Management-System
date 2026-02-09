import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    tenantId?: string;
  }
}

// Simple tenant resolution from header for now.
// In real deployment, this can use subdomain or JWT claims.
export function tenantContext(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const tenantId = req.header('x-tenant-id');
  if (tenantId) {
    req.tenantId = tenantId;
  }
  next();
}

