import * as leaveRepo from '../repositories/leaveRequestRepository';
import * as employeeRepo from '../repositories/employeeRepository';
import { AppError } from '../middlewares/errorHandler';
import { transaction } from '../db';
import {
  LeaveRequestDTO,
  LeaveBalanceDTO,
  CreateLeaveRequestDTO,
  ApproveLeaveRequestDTO,
  RejectLeaveRequestDTO,
  LeaveRequestFilters,
  PaginatedLeaveRequestsResponse,
  MyLeaveSummaryDTO,
  LeaveRequestStatus,
} from '../types/leave.types';

/**
 * Map database row to DTO
 */
function mapToLeaveRequestDTO(
  row: leaveRepo.LeaveRequestDetailRow
): LeaveRequestDTO {
  return {
    id: row.id,
    employee: {
      id: row.employee_id,
      employee_code: row.employee_code,
      first_name: row.employee_first_name,
      last_name: row.employee_last_name,
      department: row.employee_department,
    },
    leave_type: {
      id: row.leave_type_id,
      name: row.leave_type_name,
      is_paid: row.leave_type_is_paid,
    },
    start_date: row.start_date.toISOString().split('T')[0],
    end_date: row.end_date.toISOString().split('T')[0],
    total_days: row.total_days,
    reason: row.reason,
    status: row.status,
    document_url: row.document_url,
    approver: row.approver_first_name && row.approver_last_name
      ? {
          id: row.approver_id!,
          first_name: row.approver_first_name,
          last_name: row.approver_last_name,
        }
      : null,
    approver_comment: row.approver_comment,
    approved_at: row.approved_at?.toISOString() || null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

function mapToLeaveBalanceDTO(row: leaveRepo.LeaveBalanceRow): LeaveBalanceDTO {
  return {
    id: row.id,
    employee_id: row.employee_id,
    leave_type: {
      id: row.leave_type_id,
      name: row.leave_type_name,
      is_paid: row.leave_type_is_paid,
    },
    year: row.year,
    total_allocated: row.total_allocated,
    used: row.used,
    pending: row.pending,
    available: row.available,
  };
}

/**
 * Calculate business days between dates
 * Simplified: includes weekends (can be enhanced)
 */
function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Create leave request (Employee)
 */
export async function createLeaveRequest(
  userId: string,
  data: CreateLeaveRequestDTO
): Promise<LeaveRequestDTO> {
  // Get employee from user ID
  const employee = await employeeRepo.findEmployeeByUserId(userId);
  
  if (!employee) {
    throw new AppError('Employee profile not found', 404);
  }
  
  // Parse dates
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  
  // Validate dates
  if (startDate > endDate) {
    throw new AppError('Start date must be before or equal to end date', 400);
  }
  
  // Check if start date is in the past (comparing date only, not time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  if (start < today) {
    throw new AppError('Cannot apply for leave starting in the past', 400);
  }
  
  // Validate that leave is not too far in the future (e.g., max 1 year ahead)
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
  
  if (startDate > maxFutureDate) {
    throw new AppError('Cannot apply for leave more than 1 year in advance', 400);
  }
  
  // Calculate days
  const totalDays = calculateLeaveDays(startDate, endDate);
  const year = startDate.getFullYear();
  
  // Create request with balance reservation in transaction
  const result = await transaction(async () => {
    // 1. Reserve balance
    await leaveRepo.reserveLeaveBalance(
      employee.id,
      data.leave_type_id,
      totalDays,
      year
    );
    
    // 2. Create leave request
    const leaveRequest = await leaveRepo.createLeaveRequest({
      employee_id: employee.id,
      leave_type_id: data.leave_type_id,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      reason: data.reason,
      document_url: data.document_url,
    });
    
    return leaveRequest;
  });
  
  // Fetch with details
  const details = await leaveRepo.getLeaveRequestById(result.id);
  
  if (!details) {
    throw new AppError('Failed to fetch created leave request', 500);
  }
  
  return mapToLeaveRequestDTO(details);
}

/**
 * Get my leave requests (Employee)
 */
export async function getMyLeaveRequests(userId: string): Promise<LeaveRequestDTO[]> {
  const employee = await employeeRepo.findEmployeeByUserId(userId);
  
  if (!employee) {
    throw new AppError('Employee profile not found', 404);
  }
  
  const requests = await leaveRepo.listLeaveRequestsByEmployee(employee.id);
  return requests.map(mapToLeaveRequestDTO);
}

/**
 * Get my leave summary (Employee)
 */
export async function getMyLeaveSummary(userId: string): Promise<MyLeaveSummaryDTO> {
  const employee = await employeeRepo.findEmployeeByUserId(userId);
  
  if (!employee) {
    throw new AppError('Employee profile not found', 404);
  }
  
  const currentYear = new Date().getFullYear();
  
  const [balances, recentRequests, stats] = await Promise.all([
    leaveRepo.getEmployeeLeaveBalances(employee.id, currentYear),
    leaveRepo.listLeaveRequestsByEmployee(employee.id, 5),
    leaveRepo.getEmployeeLeaveStats(employee.id),
  ]);
  
  return {
    balances: balances.map(mapToLeaveBalanceDTO),
    recent_requests: recentRequests.map(mapToLeaveRequestDTO),
    stats,
  };
}

/**
 * List all leave requests with filters (Admin/HR)
 */
export async function listLeaveRequests(
  filters: LeaveRequestFilters
): Promise<PaginatedLeaveRequestsResponse> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  
  const dbFilters = {
    status: filters.status,
    employee_id: filters.employee_id,
    leave_type_id: filters.leave_type_id,
    start_date: filters.start_date ? new Date(filters.start_date) : undefined,
    end_date: filters.end_date ? new Date(filters.end_date) : undefined,
    page,
    limit,
  };
  
  const [requests, total] = await Promise.all([
    leaveRepo.listLeaveRequestsWithFilters(dbFilters),
    leaveRepo.countLeaveRequestsWithFilters(dbFilters),
  ]);
  
  return {
    data: requests.map(mapToLeaveRequestDTO),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Approve leave request (Admin/HR)
 */
export async function approveLeaveRequest(
  requestId: string,
  approverId: string,
  data: ApproveLeaveRequestDTO
): Promise<LeaveRequestDTO> {
  // Get approver employee
  const approver = await employeeRepo.findEmployeeByUserId(approverId);
  
  if (!approver) {
    throw new AppError('Approver employee profile not found', 404);
  }
  
  // Approve with transaction
  const updated = await leaveRepo.approveLeaveRequest(
    requestId,
    approver.id,
    data.approver_comment
  );
  
  return mapToLeaveRequestDTO(updated);
}

/**
 * Reject leave request (Admin/HR)
 */
export async function rejectLeaveRequest(
  requestId: string,
  approverId: string,
  data: RejectLeaveRequestDTO
): Promise<LeaveRequestDTO> {
  if (!data.approver_comment || data.approver_comment.trim() === '') {
    throw new AppError('Approver comment is required for rejection', 400);
  }
  
  // Get approver employee
  const approver = await employeeRepo.findEmployeeByUserId(approverId);
  
  if (!approver) {
    throw new AppError('Approver employee profile not found', 404);
  }
  
  // Reject with transaction
  const updated = await leaveRepo.rejectLeaveRequest(
    requestId,
    approver.id,
    data.approver_comment
  );
  
  return mapToLeaveRequestDTO(updated);
}
