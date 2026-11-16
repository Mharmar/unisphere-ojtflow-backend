import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '../types/api.types';
import { AppError } from '../utils/app-error';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    };
    return res.status(err.statusCode).json(body);
  }

  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    };
    return res.status(422).json(body);
  }

  console.error('Unhandled error:', err);

  const fallback: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
  return res.status(500).json(fallback);
}