import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      status: 'success',
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    const response: PaginatedResponse<T> = {
      status: 'success',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: any[]
  ): Response {
    const response: ApiResponse = {
      status: 'error',
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send created response
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return ResponseHandler.success(res, data, message || 'Resource created successfully', 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
