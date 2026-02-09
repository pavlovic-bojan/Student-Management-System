import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    logger.error(`ApiError: ${err.message}`, { statusCode: err.statusCode });
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error('Unexpected error', { err });
  res.status(500).json({ message: 'Internal server error' });
}

