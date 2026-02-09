import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => (e as any).msg || e).join('; ');
    res.status(400).json({ message: message || 'Validation error' });
    return;
  }
  next();
}
