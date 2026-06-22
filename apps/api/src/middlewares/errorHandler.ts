import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { ZodError } from 'zod';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    errorResponse(res, `验证错误: ${messages}`, 400);
    return;
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse(res, '未授权', 401);
    return;
  }

  errorResponse(res, err.message || '服务器内部错误', 500);
}
