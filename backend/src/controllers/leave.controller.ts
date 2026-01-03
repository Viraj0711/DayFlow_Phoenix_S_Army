import { Request, Response, NextFunction } from 'express';
import * as leaveService from '../services/leave.service';
import { ResponseHandler } from '../utils/responseHandler';
import { AuthRequest } from '../middlewares/auth';
import {
  CreateLeaveRequestDTO,
  ApproveLeaveRequestDTO,
  RejectLeaveRequestDTO,
  LeaveRequestFilters,
  LeaveRequestStatus,
} from '../types/leave.types';

/**
 * POST /leave-requests
 * Create new leave request (Employee)
 */
export async function createLeaveRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401) as any;
    }
    
    const data: CreateLeaveRequestDTO = req.body;
    const leaveRequest = await leaveService.createLeaveRequest(req.user.id, data);
    
    ResponseHandler.created(res, leaveRequest, 'Leave request created successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leave-requests/me
 * Get authenticated employee's leave requests
 */
export async function getMyLeaveRequests(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401) as any;
    }
    
    const requests = await leaveService.getMyLeaveRequests(req.user.id);
    ResponseHandler.success(res, requests, 'Leave requests retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leave-requests/me/summary
 * Get leave summary (balances + recent requests + stats)
 */
export async function getMyLeaveSummary(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401) as any;
    }
    
    const summary = await leaveService.getMyLeaveSummary(req.user.id);
    ResponseHandler.success(res, summary, 'Leave summary retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leave-requests
 * List all leave requests with filters (Admin/HR)
 */
export async function listLeaveRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters: LeaveRequestFilters = {
      status: req.query.status as LeaveRequestStatus,
      employee_id: req.query.employee_id as string,
      leave_type_id: req.query.leave_type_id as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    
    const result = await leaveService.listLeaveRequests(filters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /leave-requests/:id/approve
 * Approve leave request (Admin/HR)
 */
export async function approveLeaveRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401) as any;
    }
    
    const { id } = req.params;
    const data: ApproveLeaveRequestDTO = req.body;
    
    const updated = await leaveService.approveLeaveRequest(
      id,
      req.user.id,
      data
    );
    
    ResponseHandler.success(res, updated, 'Leave request approved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /leave-requests/:id/reject
 * Reject leave request (Admin/HR)
 */
export async function rejectLeaveRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401) as any;
    }
    
    const { id } = req.params;
    const data: RejectLeaveRequestDTO = req.body;
    
    const updated = await leaveService.rejectLeaveRequest(
      id,
      req.user.id,
      data
    );
    
    ResponseHandler.success(res, updated, 'Leave request rejected');
  } catch (error) {
    next(error);
  }
}
