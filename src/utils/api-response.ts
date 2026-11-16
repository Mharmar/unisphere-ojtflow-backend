import { Response } from 'express';
import { ApiSuccessResponse, PaginationMeta } from '../types/api.types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): Response {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };

  return res.status(statusCode).json(payload);
}