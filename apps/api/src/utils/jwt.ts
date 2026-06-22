import jwt from 'jsonwebtoken';
import { config } from '../config';
import { TokenPayload } from '../types';

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiration as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(payload: { userId: number }): string {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiration as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: number } {
  return jwt.verify(token, config.jwtRefreshSecret) as { userId: number };
}
