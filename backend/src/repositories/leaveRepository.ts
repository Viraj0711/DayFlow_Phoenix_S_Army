import { query, queryOne, execute } from '../db';
import { LeaveType, LeaveStatus } from '../types';

/**
 * Leave request row interface matching database schema
 */
export interface LeaveRow {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  approved_by: string | null;
  approved_at: Date | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Leave with employee details
 */
export interface LeaveWithEmployee extends LeaveRow {
  employee_code: string;
  first_name: string;
  last_name: string;
  department: string;
}

/**
 * Leave creation input
 */
export interface CreateLeaveInput {
  employee_id: string;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  days_count: number;
  reason: string;
}

/**
 * Leave update input
 */
export interface UpdateLeaveInput {
  leave_type?: LeaveType;
  start_date?: Date;
  end_date?: Date;
  days_count?: number;
  reason?: string;
  status?: LeaveStatus;
  approved_by?: string | null;
  rejection_reason?: string | null;
}

/**
 * Find leave request by ID
 */
export async function findLeaveById(id: string): Promise<LeaveRow | null> {
  const sql = `
    SELECT 
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, approved_by, approved_at, rejection_reason,
      created_at, updated_at
    FROM leaves
    WHERE id = $1
  `;
  return queryOne<LeaveRow>(sql, [id]);
}

/**
 * Create leave request
 */
export async function createLeaveRequest(
  input: CreateLeaveInput
): Promise<LeaveRow> {
  const sql = `
    INSERT INTO leaves (
      employee_id, leave_type, start_date, end_date, 
      days_count, reason, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING 
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, approved_by, approved_at, rejection_reason,
      created_at, updated_at
  `;

  const result = await queryOne<LeaveRow>(sql, [
    input.employee_id,
    input.leave_type,
    input.start_date,
    input.end_date,
    input.days_count,
    input.reason,
    LeaveStatus.PENDING,
  ]);

  if (!result) {
    throw new Error('Failed to create leave request');
  }

  return result;
}

/**
 * Update leave request
 */
export async function updateLeaveRequest(
  id: string,
  input: UpdateLeaveInput
): Promise<LeaveRow | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.leave_type !== undefined) {
    fields.push(`leave_type = $${paramCount++}`);
    values.push(input.leave_type);
  }
  if (input.start_date !== undefined) {
    fields.push(`start_date = $${paramCount++}`);
    values.push(input.start_date);
  }
  if (input.end_date !== undefined) {
    fields.push(`end_date = $${paramCount++}`);
    values.push(input.end_date);
  }
  if (input.days_count !== undefined) {
    fields.push(`days_count = $${paramCount++}`);
    values.push(input.days_count);
  }
  if (input.reason !== undefined) {
    fields.push(`reason = $${paramCount++}`);
    values.push(input.reason);
  }
  if (input.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(input.status);
  }
  if (input.approved_by !== undefined) {
    fields.push(`approved_by = $${paramCount++}`);
    values.push(input.approved_by);
  }
  if (input.rejection_reason !== undefined) {
    fields.push(`rejection_reason = $${paramCount++}`);
    values.push(input.rejection_reason);
  }

  if (fields.length === 0) {
    return findLeaveById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE leaves
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING 
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, approved_by, approved_at, rejection_reason,
      created_at, updated_at
  `;

  return queryOne<LeaveRow>(sql, values);
}

/**
 * List leave requests by employee
 */
export async function listLeaveRequestsByEmployee(
  employeeId: string,
  filters?: {
    status?: LeaveStatus;
    leave_type?: LeaveType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<LeaveRow[]> {
  const conditions: string[] = ['employee_id = $1'];
  const values: any[] = [employeeId];
  let paramCount = 2;

  if (filters?.status) {
    conditions.push(`status = $${paramCount++}`);
    values.push(filters.status);
  }

  if (filters?.leave_type) {
    conditions.push(`leave_type = $${paramCount++}`);
    values.push(filters.leave_type);
  }

  if (filters?.startDate) {
    conditions.push(`start_date >= $${paramCount++}`);
    values.push(filters.startDate);
  }

  if (filters?.endDate) {
    conditions.push(`end_date <= $${paramCount++}`);
    values.push(filters.endDate);
  }

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const sql = `
    SELECT 
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, approved_by, approved_at, rejection_reason,
      created_at, updated_at
    FROM leaves
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<LeaveRow>(sql, values);
}

/**
 * List all pending leave requests
 */
export async function listPendingLeaveRequests(filters?: {
  department?: string;
  limit?: number;
  offset?: number;
}): Promise<LeaveWithEmployee[]> {
  const conditions: string[] = ["l.status = 'PENDING'"];
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.department) {
    conditions.push(`e.department = $${paramCount++}`);
    values.push(filters.department);
  }

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const sql = `
    SELECT 
      l.id, l.employee_id, l.leave_type, l.start_date, l.end_date, l.days_count,
      l.reason, l.status, l.approved_by, l.approved_at, l.rejection_reason,
      l.created_at, l.updated_at,
      e.employee_code, e.first_name, e.last_name, e.department
    FROM leaves l
    INNER JOIN employees e ON l.employee_id = e.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY l.created_at ASC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<LeaveWithEmployee>(sql, values);
}

/**
 * Approve leave request
 */
export async function approveLeaveRequest(
  leaveId: string,
  approverId: string
): Promise<LeaveRow | null> {
  const sql = `
    UPDATE leaves
    SET 
      status = $1,
      approved_by = $2,
      approved_at = NOW(),
      updated_at = NOW()
    WHERE id = $3
    RETURNING 
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, approved_by, approved_at, rejection_reason,
      created_at, updated_at
  `;

  return queryOne<LeaveRow>(sql, [LeaveStatus.APPROVED, approverId, leaveId]);
}

/**
 * Reject leave request
 */
export async function rejectLeaveRequest(
  leaveId: string,
  approverId: string,
  rejectionReason: string
): Promise<LeaveRow | null> {
  const sql = `
    UPDATE leaves
    SET 
      status = $1,
      approved_by = $2,
      approved_at = NOW(),
      rejection_reason = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING 
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, approved_by, approved_at, rejection_reason,
      created_at, updated_at
  `;

  return queryOne<LeaveRow>(sql, [
    LeaveStatus.REJECTED,
    approverId,
    rejectionReason,
    leaveId,
  ]);
}

/**
 * Cancel leave request
 */
export async function cancelLeaveRequest(leaveId: string): Promise<LeaveRow | null> {
  const sql = `
    UPDATE leaves
    SET 
      status = $1,
      updated_at = NOW()
    WHERE id = $2
      AND status = $3
    RETURNING 
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, approved_by, approved_at, rejection_reason,
      created_at, updated_at
  `;

  return queryOne<LeaveRow>(sql, [
    LeaveStatus.CANCELLED,
    leaveId,
    LeaveStatus.PENDING,
  ]);
}

/**
 * Get leave balance summary for an employee
 */
export async function getLeaveBalance(
  employeeId: string,
  year: number
): Promise<Record<LeaveType, { taken: number; available: number }>> {
  const sql = `
    SELECT 
      leave_type,
      COALESCE(SUM(days_count) FILTER (WHERE status = 'APPROVED'), 0)::int as taken
    FROM leaves
    WHERE employee_id = $1
      AND EXTRACT(YEAR FROM start_date) = $2
    GROUP BY leave_type
  `;

  const results = await query<{ leave_type: LeaveType; taken: number }>(sql, [
    employeeId,
    year,
  ]);

  // Define default leave allocations (can be moved to configuration)
  const allocations: Record<LeaveType, number> = {
    [LeaveType.SICK]: 12,
    [LeaveType.CASUAL]: 10,
    [LeaveType.ANNUAL]: 20,
    [LeaveType.MATERNITY]: 90,
    [LeaveType.PATERNITY]: 15,
    [LeaveType.UNPAID]: 0,
  };

  const balance: Record<LeaveType, { taken: number; available: number }> = {} as any;

  Object.values(LeaveType).forEach((type) => {
    const taken = results.find((r) => r.leave_type === type)?.taken || 0;
    const allocated = allocations[type];
    balance[type] = {
      taken,
      available: Math.max(0, allocated - taken),
    };
  });

  return balance;
}
