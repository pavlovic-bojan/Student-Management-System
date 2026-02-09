import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

/**
 * Allows only PLATFORM_ADMIN or SCHOOL_ADMIN.
 * Must be used after authenticate middleware.
 */
export function requireAdminOrSchoolAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const role = req.user?.role;
  if (role === 'PLATFORM_ADMIN' || role === 'SCHOOL_ADMIN') {
    next();
    return;
  }
  next(new ApiError('Forbidden: only Platform Admin or School Admin can perform this action', 403));
}

/**
 * Allows PLATFORM_ADMIN, SCHOOL_ADMIN, or PROFESSOR (professor can only create students).
 * Must be used after authenticate middleware.
 */
export function requireCanCreateUser(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const role = req.user?.role;
  if (role === 'PLATFORM_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'PROFESSOR') {
    next();
    return;
  }
  next(new ApiError('Forbidden: only Platform Admin, School Admin, or Professor can create users', 403));
}
