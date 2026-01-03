/**
 * Custom Application Error Class
 * Extends Error with HTTP status code and optional details
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    details?: any,
    code?: string
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguish operational errors from programming errors
    this.details = details;
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert to JSON response format
   */
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code || `ERROR_${this.statusCode}`,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Common HTTP Error Classes
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: any) {
    super(message, 400, details, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, details, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, details, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, details, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, details, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, details, 'VALIDATION_ERROR');
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, details, 'INTERNAL_SERVER_ERROR');
  }
}

/**
 * Database Error Handler
 * Converts PostgreSQL errors to user-friendly AppErrors
 */
export class DatabaseErrorHandler {
  /**
   * Handle PostgreSQL errors
   */
  static handlePgError(error: any): AppError {
    // PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
    
    // Unique violation (23505)
    if (error.code === '23505') {
      const field = this.extractFieldFromConstraint(error.constraint);
      return new ConflictError(
        `${field || 'Resource'} already exists`,
        {
          constraint: error.constraint,
          detail: error.detail,
        }
      );
    }
    
    // Foreign key violation (23503)
    if (error.code === '23503') {
      const field = this.extractFieldFromConstraint(error.constraint);
      return new BadRequestError(
        `Invalid ${field || 'reference'}: Related resource does not exist`,
        {
          constraint: error.constraint,
          detail: error.detail,
        }
      );
    }
    
    // Not null violation (23502)
    if (error.code === '23502') {
      return new BadRequestError(
        `Required field '${error.column}' is missing`,
        {
          column: error.column,
        }
      );
    }
    
    // Check violation (23514)
    if (error.code === '23514') {
      return new BadRequestError(
        'Data validation failed',
        {
          constraint: error.constraint,
          detail: error.detail,
        }
      );
    }
    
    // Invalid text representation (22P02)
    if (error.code === '22P02') {
      return new BadRequestError(
        'Invalid data format',
        {
          detail: error.message,
        }
      );
    }
    
    // Connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new InternalServerError(
        'Database connection failed',
        {
          code: error.code,
        }
      );
    }
    
    // Generic database error
    return new InternalServerError(
      'Database operation failed',
      {
        code: error.code,
        message: error.message,
      }
    );
  }
  
  /**
   * Extract field name from constraint name
   * e.g., "users_email_key" -> "email"
   */
  private static extractFieldFromConstraint(constraint?: string): string | null {
    if (!constraint) return null;
    
    // Common patterns: table_field_key, table_field_fkey, field_unique
    const patterns = [
      /^[^_]+_([^_]+)_key$/,      // users_email_key
      /^[^_]+_([^_]+)_fkey$/,     // employees_user_id_fkey
      /^([^_]+)_unique$/,         // email_unique
      /^unique_[^_]+_([^_]+)$/,   // unique_employee_leave_year
    ];
    
    for (const pattern of patterns) {
      const match = constraint.match(pattern);
      if (match) {
        return match[1].replace(/_/g, ' ');
      }
    }
    
    return constraint;
  }
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
