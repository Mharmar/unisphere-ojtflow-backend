import { ApiErrorDetail } from '../types/api.types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}