import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again after 15 minutes',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  skipSuccessfulRequests: false, // Count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiter
 * Limits: 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: {
      message: 'Too many password reset requests, please try again after 1 hour',
      code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * File upload rate limiter
 * Limits: 10 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      message: 'Too many file uploads, please try again later',
      code: 'UPLOAD_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
