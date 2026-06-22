import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    errorResponse(res, '未提供访问令牌', 401);
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (error) {
    errorResponse(res, '访问令牌无效或已过期', 403);
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    errorResponse(res, '未认证', 401);
    return;
  }

  if (req.user.role !== 'ADMIN') {
    errorResponse(res, '需要管理员权限', 403);
    return;
  }

  next();
}
