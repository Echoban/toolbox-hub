import { Response } from 'express';
import { ApiResponse } from '../types';

export function successResponse<T>(res: Response, data: T, message = 'success', code = 200): void {
  const response: ApiResponse<T> = {
    code,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(code).json(response);
}

export function errorResponse(res: Response, message = 'error', code = 500): void {
  const response: ApiResponse<null> = {
    code,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  };
  res.status(code).json(response);
}
