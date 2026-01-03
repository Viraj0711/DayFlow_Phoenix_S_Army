import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Unexpected errors - never expose details in production
  logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, err);
  
  // Generate a unique error ID for tracking
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger.error(`Error ID: ${errorId}`, err);
  
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An internal server error occurred. Please contact support.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(process.env.NODE_ENV !== 'development' && { errorId }),
  });
};
