import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthUserPayload {
  sub: string;
  tenantId: string;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUserPayload;
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Allow test suite to bypass auth when header and env are set (integration tests only)
  if (
    process.env.NODE_ENV === 'test' &&
    process.env.SKIP_AUTH_FOR_TESTS === '1' &&
    req.header('x-test-tenant-id')
  ) {
    req.tenantId = req.header('x-test-tenant-id') ?? undefined;
    const role = req.header('x-test-role') ?? 'SCHOOL_ADMIN';
    req.user = {
      sub: req.header('x-test-user-id') ?? 'test-user',
      tenantId: req.header('x-test-tenant-id') ?? '',
      role,
    };
    next();
    return;
  }

  const authHeader = req.header('authorization');
  if (!authHeader) {
    res.status(401).json({ message: 'Missing Authorization header' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthUserPayload;
    req.user = decoded;
    req.tenantId = decoded.tenantId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

