import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

/**
 * Clean up old entries periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (record.resetTime < now) {
        requestCounts.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

/**
 * Create a rate limiter middleware
 * @param maxRequests Maximum requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @param keyGenerator Function to generate unique key for the client
 */
export function createRateLimiter(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  keyGenerator?: (req: Request) => string
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Generate unique key for the client
    const key = keyGenerator
      ? keyGenerator(req)
      : `${req.ip}-${req.path}`;

    const now = Date.now();
    let record = requestCounts.get(key);

    // Initialize or reset if window expired
    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      requestCounts.set(key, record);
    }

    // Increment request count
    record.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    // Check if limit exceeded
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      
      throw new AppError(
        'Too many requests. Please try again later.',
        429
      );
    }

    next();
  };
}

/**
 * Stricter rate limiter for authentication endpoints
 */
export const authRateLimiter = createRateLimiter(
  5, // 5 attempts
  15 * 60 * 1000, // per 15 minutes
  (req: Request) => `auth-${req.ip}-${req.body?.email || ''}`
);

/**
 * Rate limiter for sensitive operations (delete, update)
 */
export const sensitiveOperationLimiter = createRateLimiter(
  10, // 10 operations
  60 * 1000, // per minute
  (req: Request) => `sensitive-${req.user?.userId || req.ip}-${req.method}`
);

/**
 * General API rate limiter
 */
export const generalRateLimiter = createRateLimiter(
  100, // 100 requests
  15 * 60 * 1000 // per 15 minutes
);
