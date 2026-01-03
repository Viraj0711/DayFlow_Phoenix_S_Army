import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth.types';

// Validate JWT secret exists and is strong enough
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn('⚠️  WARNING: Using default JWT_SECRET in development. DO NOT use in production!');
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production';

if (JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  return jwt.decode(token) as JWTPayload | null;
}
