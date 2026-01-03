import { query, queryOne, transaction } from '../db';
import { LeaveRequestStatus } from '../types/leave.types';

/**
 * Database row interfaces
 */
export interface LeaveRequestRow {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  approver_id: string | null;
  approver_comment: string | null;
  approved_at: Date | null;
  document_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequestDetailRow extends LeaveRequestRow {
  // Employee details
  employee_code: string;
  employee_first_name: string;
  employee_last_name: string;
  employee_department: string;
  
  // Leave type details
  leave_type_name: string;
  leave_type_is_paid: boolean;
  
  // Approver details
  approver_first_name: string | null;
  approver_last_name: string | null;
}

export interface LeaveBalanceRow {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_allocated: number;
  used: number;
  pending: number;
  available: number;
  
  // Leave type details
  leave_type_name: string;
  leave_type_is_paid: boolean;
}

/**
 * Create leave request
 */
export async function createLeaveRequest(input: {
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  document_url?: string | null;
}): Promise<LeaveRequestRow> {
  const sql = `
    INSERT INTO leave_requests (
      employee_id, leave_type_id, start_date, end_date,
      total_days, reason, status, document_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)
    RETURNING 
      id, employee_id, leave_type_id, start_date, end_date,
      total_days, reason, status, approver_id, approver_comment,
      approved_at, document_url, created_at, updated_at
  `;
  
  const result = await queryOne<LeaveRequestRow>(sql, [
    input.employee_id,
    input.leave_type_id,
    input.start_date,
    input.end_date,
    input.total_days,
    input.reason,
    input.document_url || null,
  ]);
  
  if (!result) {
    throw new Error('Failed to create leave request');
  }
  
  return result;
}

/**
 * Get leave request with full details (joins)
 */
export async function getLeaveRequestById(
  requestId: string
): Promise<LeaveRequestDetailRow | null> {
  const sql = `
    SELECT 
      lr.id, lr.employee_id, lr.leave_type_id, lr.start_date, lr.end_date,
      lr.total_days, lr.reason, lr.status, lr.approver_id, lr.approver_comment,
      lr.approved_at, lr.document_url, lr.created_at, lr.updated_at,
      
      e.employee_code, e.first_name as employee_first_name,
      e.last_name as employee_last_name, e.department as employee_department,
      
      lt.name as leave_type_name, lt.is_paid as leave_type_is_paid,
      
      app.first_name as approver_first_name,
      app.last_name as approver_last_name
    FROM leave_requests lr
    INNER JOIN employees e ON lr.employee_id = e.id
    INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
    LEFT JOIN employees app ON lr.approver_id = app.id
    WHERE lr.id = $1
  `;
  
  return queryOne<LeaveRequestDetailRow>(sql, [requestId]);
}

/**
 * List leave requests by employee
 */
export async function listLeaveRequestsByEmployee(
  employeeId: string,
  limit: number = 10
): Promise<LeaveRequestDetailRow[]> {
  const sql = `
    SELECT 
      lr.id, lr.employee_id, lr.leave_type_id, lr.start_date, lr.end_date,
      lr.total_days, lr.reason, lr.status, lr.approver_id, lr.approver_comment,
      lr.approved_at, lr.document_url, lr.created_at, lr.updated_at,
      
      e.employee_code, e.first_name as employee_first_name,
      e.last_name as employee_last_name, e.department as employee_department,
      
      lt.name as leave_type_name, lt.is_paid as leave_type_is_paid,
      
      app.first_name as approver_first_name,
      app.last_name as approver_last_name
    FROM leave_requests lr
    INNER JOIN employees e ON lr.employee_id = e.id
    INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
    LEFT JOIN employees app ON lr.approver_id = app.id
    WHERE lr.employee_id = $1
    ORDER BY lr.created_at DESC
    LIMIT $2
  `;
  
  return query<LeaveRequestDetailRow>(sql, [employeeId, limit]);
}

/**
 * List leave requests with filters (Admin/HR)
 */
export async function listLeaveRequestsWithFilters(filters: {
  status?: LeaveRequestStatus;
  employee_id?: string;
  leave_type_id?: string;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}): Promise<LeaveRequestDetailRow[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.status) {
    conditions.push(`lr.status = $${paramCount++}`);
    values.push(filters.status);
  }

  if (filters.employee_id) {
    conditions.push(`lr.employee_id = $${paramCount++}`);
    values.push(filters.employee_id);
  }

  if (filters.leave_type_id) {
    conditions.push(`lr.leave_type_id = $${paramCount++}`);
    values.push(filters.leave_type_id);
  }

  if (filters.start_date) {
    conditions.push(`lr.start_date >= $${paramCount++}`);
    values.push(filters.start_date);
  }

  if (filters.end_date) {
    conditions.push(`lr.end_date <= $${paramCount++}`);
    values.push(filters.end_date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      lr.id, lr.employee_id, lr.leave_type_id, lr.start_date, lr.end_date,
      lr.total_days, lr.reason, lr.status, lr.approver_id, lr.approver_comment,
      lr.approved_at, lr.document_url, lr.created_at, lr.updated_at,
      
      e.employee_code, e.first_name as employee_first_name,
      e.last_name as employee_last_name, e.department as employee_department,
      
      lt.name as leave_type_name, lt.is_paid as leave_type_is_paid,
      
      app.first_name as approver_first_name,
      app.last_name as approver_last_name
    FROM leave_requests lr
    INNER JOIN employees e ON lr.employee_id = e.id
    INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
    LEFT JOIN employees app ON lr.approver_id = app.id
    ${whereClause}
    ORDER BY lr.created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<LeaveRequestDetailRow>(sql, values);
}

/**
 * Count leave requests with filters
 */
export async function countLeaveRequestsWithFilters(filters: {
  status?: LeaveRequestStatus;
  employee_id?: string;
  leave_type_id?: string;
  start_date?: Date;
  end_date?: Date;
}): Promise<number> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.status) {
    conditions.push(`status = $${paramCount++}`);
    values.push(filters.status);
  }

  if (filters.employee_id) {
    conditions.push(`employee_id = $${paramCount++}`);
    values.push(filters.employee_id);
  }

  if (filters.leave_type_id) {
    conditions.push(`leave_type_id = $${paramCount++}`);
    values.push(filters.leave_type_id);
  }

  if (filters.start_date) {
    conditions.push(`start_date >= $${paramCount++}`);
    values.push(filters.start_date);
  }

  if (filters.end_date) {
    conditions.push(`end_date <= $${paramCount++}`);
    values.push(filters.end_date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*)::int as count FROM leave_requests ${whereClause}`;
  
  const result = await queryOne<{ count: number }>(sql, values);
  return result?.count || 0;
}

/**
 * Approve leave request with balance update (TRANSACTION)
 * 
 * Workflow:
 * 1. Update leave_requests: status = APPROVED, set approver
 * 2. Update employee_leave_balances: move pending to used
 */
export async function approveLeaveRequest(
  requestId: string,
  approverId: string,
  approverComment?: string
): Promise<LeaveRequestDetailRow> {
  return transaction(async () => {
    // 1. Get leave request details
    const leaveRequest = await queryOne<LeaveRequestRow>(
      `SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE`,
      [requestId]
    );
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new Error(`Cannot approve request with status: ${leaveRequest.status}`);
    }
    
    // 2. Update leave request status
    await queryOne(
      `
      UPDATE leave_requests
      SET 
        status = 'APPROVED',
        approver_id = $1,
        approver_comment = $2,
        approved_at = NOW()
      WHERE id = $3
      `,
      [approverId, approverComment || null, requestId]
    );
    
    // 3. Update leave balance: move pending to used
    const year = leaveRequest.start_date.getFullYear();
    
    const balanceUpdate = await queryOne<{ available: number }>(
      `
      UPDATE employee_leave_balances
      SET 
        pending = pending - $1,
        used = used + $1
      WHERE employee_id = $2 
        AND leave_type_id = $3 
        AND year = $4
      RETURNING available
      `,
      [
        leaveRequest.total_days,
        leaveRequest.employee_id,
        leaveRequest.leave_type_id,
        year,
      ]
    );
    
    if (!balanceUpdate) {
      throw new Error('Leave balance record not found');
    }
    
    // 4. Return updated leave request with details
    const updated = await getLeaveRequestById(requestId);
    
    if (!updated) {
      throw new Error('Failed to fetch updated leave request');
    }
    
    return updated;
  });
}

/**
 * Reject leave request with balance cleanup (TRANSACTION)
 * 
 * Workflow:
 * 1. Update leave_requests: status = REJECTED, set approver
 * 2. Update employee_leave_balances: remove from pending
 */
export async function rejectLeaveRequest(
  requestId: string,
  approverId: string,
  approverComment: string
): Promise<LeaveRequestDetailRow> {
  return transaction(async () => {
    // 1. Get leave request details
    const leaveRequest = await queryOne<LeaveRequestRow>(
      `SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE`,
      [requestId]
    );
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new Error(`Cannot reject request with status: ${leaveRequest.status}`);
    }
    
    // 2. Update leave request status
    await queryOne(
      `
      UPDATE leave_requests
      SET 
        status = 'REJECTED',
        approver_id = $1,
        approver_comment = $2,
        approved_at = NOW()
      WHERE id = $3
      `,
      [approverId, approverComment, requestId]
    );
    
    // 3. Update leave balance: remove from pending
    const year = leaveRequest.start_date.getFullYear();
    
    await queryOne(
      `
      UPDATE employee_leave_balances
      SET pending = pending - $1
      WHERE employee_id = $2 
        AND leave_type_id = $3 
        AND year = $4
      `,
      [
        leaveRequest.total_days,
        leaveRequest.employee_id,
        leaveRequest.leave_type_id,
        year,
      ]
    );
    
    // 4. Return updated leave request with details
    const updated = await getLeaveRequestById(requestId);
    
    if (!updated) {
      throw new Error('Failed to fetch updated leave request');
    }
    
    return updated;
  });
}

/**
 * Reserve leave balance when creating request (TRANSACTION)
 */
export async function reserveLeaveBalance(
  employeeId: string,
  leaveTypeId: string,
  totalDays: number,
  year: number
): Promise<void> {
  const sql = `
    UPDATE employee_leave_balances
    SET pending = pending + $1
    WHERE employee_id = $2 
      AND leave_type_id = $3 
      AND year = $4
      AND (total_allocated - used - pending) >= $1
    RETURNING id
  `;
  
  const result = await queryOne<{ id: string }>(sql, [
    totalDays,
    employeeId,
    leaveTypeId,
    year,
  ]);
  
  if (!result) {
    throw new Error('Insufficient leave balance');
  }
}

/**
 * Get employee leave balances for a year
 */
export async function getEmployeeLeaveBalances(
  employeeId: string,
  year: number
): Promise<LeaveBalanceRow[]> {
  const sql = `
    SELECT 
      elb.id, elb.employee_id, elb.leave_type_id, elb.year,
      elb.total_allocated, elb.used, elb.pending, elb.available,
      lt.name as leave_type_name,
      lt.is_paid as leave_type_is_paid
    FROM employee_leave_balances elb
    INNER JOIN leave_types lt ON elb.leave_type_id = lt.id
    WHERE elb.employee_id = $1 AND elb.year = $2
    ORDER BY lt.name
  `;
  
  return query<LeaveBalanceRow>(sql, [employeeId, year]);
}

/**
 * Get leave request stats for employee
 */
export async function getEmployeeLeaveStats(
  employeeId: string
): Promise<{
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
}> {
  const sql = `
    SELECT 
      COUNT(*)::int as total_requests,
      COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending_requests,
      COUNT(*) FILTER (WHERE status = 'APPROVED')::int as approved_requests,
      COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected_requests
    FROM leave_requests
    WHERE employee_id = $1
  `;
  
  const result = await queryOne<{
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
  }>(sql, [employeeId]);
  
  return result || {
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
  };
}
