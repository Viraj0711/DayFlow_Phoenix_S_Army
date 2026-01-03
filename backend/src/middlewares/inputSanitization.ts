import { Request, Response, NextFunction } from 'express';

/**
 * Input sanitization middleware to prevent XSS attacks
 * Sanitizes string inputs by removing potentially dangerous characters
 */

/**
 * Sanitize a string value to prevent XSS
 */
function sanitizeString(value: any): any {
  if (typeof value === 'string') {
    // Remove script tags and potentially dangerous HTML
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  return value;
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return sanitizeString(obj);
}

/**
 * Middleware to sanitize request body, query, and params
 */
export function inputSanitization(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize SQL-like inputs (additional layer on top of parameterized queries)
 */
export function sanitizeSQLInput(value: string): string {
  return value
    .replace(/['";\\]/g, '')  // Remove quotes and backslashes
    .replace(/--/g, '')        // Remove SQL comments
    .replace(/\/\*/g, '')      // Remove multi-line comment start
    .replace(/\*\//g, '')      // Remove multi-line comment end
    .trim();
}
