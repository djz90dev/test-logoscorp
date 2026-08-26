import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import type { AppError } from '../shared/types.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof ZodError) {
    logger.warn({ requestId, error: err.message, validationErrors: err.errors });
    res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  const appError = err as AppError;
  const statusCode = appError.statusCode || 500;
  const code = appError.code || 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    logger.error({ requestId, error: err.message, stack: err.stack });
  } else {
    logger.warn({ requestId, error: err.message, code });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === 'production' && statusCode >= 500
          ? 'Internal server error'
          : err.message,
      code,
    },
  });
}
