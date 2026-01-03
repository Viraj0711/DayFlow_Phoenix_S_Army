/**
 * Leave Management DTOs
 */

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Leave Type
 */
export interface LeaveTypeDTO {
  id: string;
  name: string;
  description: string | null;
  default_days_per_year: number;
  is_paid: boolean;
  requires_document: boolean;
}

/**
 * Employee Leave Balance
 */
export interface LeaveBalanceDTO {
  id: string;
  employee_id: string;
  leave_type: {
    id: string;
    name: string;
    is_paid: boolean;
  };
  year: number;
  total_allocated: number;
  used: number;
  pending: number;
  available: number;
}

/**
 * Leave Request (detailed)
 */
export interface LeaveRequestDTO {
  id: string;
  employee: {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    department: string;
  };
  leave_type: {
    id: string;
    name: string;
    is_paid: boolean;
  };
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  document_url: string | null;
  
  approver: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  approver_comment: string | null;
  approved_at: string | null;
  
  created_at: string;
  updated_at: string;
}

/**
 * Create Leave Request
 */
export interface CreateLeaveRequestDTO {
  leave_type_id: string;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  reason: string;
  document_url?: string | null;
}

/**
 * Approve/Reject Leave Request
 */
export interface ApproveLeaveRequestDTO {
  approver_comment?: string;
}

export interface RejectLeaveRequestDTO {
  approver_comment: string; // Required for rejection
}

/**
 * Leave Request Filters
 */
export interface LeaveRequestFilters {
  status?: LeaveRequestStatus;
  employee_id?: string;
  leave_type_id?: string;
  start_date?: string; // ISO date - filter requests starting from this date
  end_date?: string;   // ISO date - filter requests ending before this date
  page?: number;
  limit?: number;
}

/**
 * Paginated Leave Requests
 */
export interface PaginatedLeaveRequestsResponse {
  data: LeaveRequestDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * My Leave Summary
 */
export interface MyLeaveSummaryDTO {
  balances: LeaveBalanceDTO[];
  recent_requests: LeaveRequestDTO[];
  stats: {
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
  };
}
