import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../logger';

/**
 * Global error-handling middleware.
 * Returns { error: string, code?: string }. Stack traces only in development.
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  // Always log the full error including stack
  logger.error(err.message, err instanceof Error ? err : undefined, {
    path: req.path,
    method: req.method,
  });

  const isDev = process.env.NODE_ENV === 'development';

  // Known application errors
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { error: err.message, code: err.code };
    if (err.details) body.errors = err.details.errors ?? err.details;
    if (isDev) body.stack = err.stack;
    return res.status(err.statusCode).json(body);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const zodErr = err as any;
    const body: Record<string, unknown> = {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: zodErr.errors?.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
    };
    if (isDev) body.stack = err.stack;
    return res.status(400).json(body);
  }

  // Unexpected errors — never expose internals in production
  const body: Record<string, unknown> = { error: 'Internal server error' };
  if (isDev) body.stack = err.stack;
  res.status(500).json(body);
}

/**
 * Async wrapper to forward errors to the error handler.
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
