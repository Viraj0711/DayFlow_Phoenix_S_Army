import { query, queryOne, execute } from '../db';
import { AttendanceStatus } from '../types';

/**
 * Attendance record row interface matching database schema
 */
export interface AttendanceRow {
  id: string;
  employee_id: string;
  date: Date;
  check_in: Date | null;
  check_out: Date | null;
  status: AttendanceStatus;
  working_hours: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Attendance with employee details
 */
export interface AttendanceWithEmployee extends AttendanceRow {
  employee_code: string;
  first_name: string;
  last_name: string;
  department: string;
}

/**
 * Attendance creation input
 */
export interface CreateAttendanceInput {
  employee_id: string;
  date: Date;
  check_in?: Date | null;
  check_out?: Date | null;
  status: AttendanceStatus;
  working_hours?: number;
  notes?: string | null;
}

/**
 * Attendance update input
 */
export interface UpdateAttendanceInput {
  check_in?: Date | null;
  check_out?: Date | null;
  status?: AttendanceStatus;
  working_hours?: number;
  notes?: string | null;
}

/**
 * Find attendance record by ID
 */
export async function findAttendanceById(
  id: string
): Promise<AttendanceRow | null> {
  const sql = `
    SELECT 
      id, employee_id, date, check_in, check_out, 
      status, working_hours, notes, created_at, updated_at
    FROM attendance
    WHERE id = $1
  `;
  return queryOne<AttendanceRow>(sql, [id]);
}

/**
 * Find attendance record by employee and date
 */
export async function findAttendanceByEmployeeAndDate(
  employeeId: string,
  date: Date
): Promise<AttendanceRow | null> {
  const sql = `
    SELECT 
      id, employee_id, date, check_in, check_out, 
      status, working_hours, notes, created_at, updated_at
    FROM attendance
    WHERE employee_id = $1 
      AND date = $2
  `;
  return queryOne<AttendanceRow>(sql, [employeeId, date]);
}

/**
 * Create attendance record
 */
export async function createAttendanceRecord(
  input: CreateAttendanceInput
): Promise<AttendanceRow> {
  const sql = `
    INSERT INTO attendance (
      employee_id, date, check_in, check_out, 
      status, working_hours, notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING 
      id, employee_id, date, check_in, check_out, 
      status, working_hours, notes, created_at, updated_at
  `;

  const result = await queryOne<AttendanceRow>(sql, [
    input.employee_id,
    input.date,
    input.check_in || null,
    input.check_out || null,
    input.status,
    input.working_hours || 0,
    input.notes || null,
  ]);

  if (!result) {
    throw new Error('Failed to create attendance record');
  }

  return result;
}

/**
 * Update attendance record
 */
export async function updateAttendanceRecord(
  id: string,
  input: UpdateAttendanceInput
): Promise<AttendanceRow | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.check_in !== undefined) {
    fields.push(`check_in = $${paramCount++}`);
    values.push(input.check_in);
  }
  if (input.check_out !== undefined) {
    fields.push(`check_out = $${paramCount++}`);
    values.push(input.check_out);
  }
  if (input.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(input.status);
  }
  if (input.working_hours !== undefined) {
    fields.push(`working_hours = $${paramCount++}`);
    values.push(input.working_hours);
  }
  if (input.notes !== undefined) {
    fields.push(`notes = $${paramCount++}`);
    values.push(input.notes);
  }

  if (fields.length === 0) {
    return findAttendanceById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE attendance
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING 
      id, employee_id, date, check_in, check_out, 
      status, working_hours, notes, created_at, updated_at
  `;

  return queryOne<AttendanceRow>(sql, values);
}

/**
 * Delete attendance record
 */
export async function deleteAttendanceRecord(id: string): Promise<boolean> {
  const sql = `DELETE FROM attendance WHERE id = $1`;
  const rowCount = await execute(sql, [id]);
  return rowCount > 0;
}

/**
 * List attendance records by employee
 */
export async function listAttendanceByEmployee(
  employeeId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: AttendanceStatus;
    limit?: number;
    offset?: number;
  }
): Promise<AttendanceRow[]> {
  const conditions: string[] = ['employee_id = $1'];
  const values: any[] = [employeeId];
  let paramCount = 2;

  if (filters?.startDate) {
    conditions.push(`date >= $${paramCount++}`);
    values.push(filters.startDate);
  }

  if (filters?.endDate) {
    conditions.push(`date <= $${paramCount++}`);
    values.push(filters.endDate);
  }

  if (filters?.status) {
    conditions.push(`status = $${paramCount++}`);
    values.push(filters.status);
  }

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const sql = `
    SELECT 
      id, employee_id, date, check_in, check_out, 
      status, working_hours, notes, created_at, updated_at
    FROM attendance
    WHERE ${conditions.join(' AND ')}
    ORDER BY date DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<AttendanceRow>(sql, values);
}

/**
 * List attendance records for a date range (for all employees or department)
 */
export async function listAttendanceByDateRange(
  startDate: Date,
  endDate: Date,
  filters?: {
    department?: string;
    status?: AttendanceStatus;
    limit?: number;
    offset?: number;
  }
): Promise<AttendanceWithEmployee[]> {
  const conditions: string[] = ['a.date >= $1', 'a.date <= $2'];
  const values: any[] = [startDate, endDate];
  let paramCount = 3;

  if (filters?.department) {
    conditions.push(`e.department = $${paramCount++}`);
    values.push(filters.department);
  }

  if (filters?.status) {
    conditions.push(`a.status = $${paramCount++}`);
    values.push(filters.status);
  }

  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const sql = `
    SELECT 
      a.id, a.employee_id, a.date, a.check_in, a.check_out, 
      a.status, a.working_hours, a.notes, a.created_at, a.updated_at,
      e.employee_code, e.first_name, e.last_name, e.department
    FROM attendance a
    INNER JOIN employees e ON a.employee_id = e.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY a.date DESC, e.first_name, e.last_name
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<AttendanceWithEmployee>(sql, values);
}

/**
 * Get attendance summary for an employee
 */
export async function getAttendanceSummary(
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  late_days: number;
  total_working_hours: number;
}> {
  const sql = `
    SELECT 
      COUNT(*)::int as total_days,
      COUNT(*) FILTER (WHERE status = 'PRESENT')::int as present_days,
      COUNT(*) FILTER (WHERE status = 'ABSENT')::int as absent_days,
      COUNT(*) FILTER (WHERE status = 'HALF_DAY')::int as half_days,
      COUNT(*) FILTER (WHERE status = 'LATE')::int as late_days,
      COALESCE(SUM(working_hours), 0)::float as total_working_hours
    FROM attendance
    WHERE employee_id = $1
      AND date >= $2
      AND date <= $3
  `;

  const result = await queryOne<{
    total_days: number;
    present_days: number;
    absent_days: number;
    half_days: number;
    late_days: number;
    total_working_hours: number;
  }>(sql, [employeeId, startDate, endDate]);

  return result || {
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    half_days: 0,
    late_days: 0,
    total_working_hours: 0,
  };
}

/**
 * Check in employee
 */
export async function checkIn(
  employeeId: string,
  date: Date,
  checkInTime: Date
): Promise<AttendanceRow> {
  // Check if record exists for today
  const existing = await findAttendanceByEmployeeAndDate(employeeId, date);

  if (existing) {
    // Update existing record
    const updated = await updateAttendanceRecord(existing.id, {
      check_in: checkInTime,
      status: AttendanceStatus.PRESENT,
    });
    if (!updated) {
      throw new Error('Failed to update check-in');
    }
    return updated;
  } else {
    // Create new record
    return createAttendanceRecord({
      employee_id: employeeId,
      date,
      check_in: checkInTime,
      status: AttendanceStatus.PRESENT,
    });
  }
}

/**
 * Check out employee
 */
export async function checkOut(
  employeeId: string,
  date: Date,
  checkOutTime: Date
): Promise<AttendanceRow | null> {
  const existing = await findAttendanceByEmployeeAndDate(employeeId, date);

  if (!existing) {
    throw new Error('No check-in record found for today');
  }

  if (!existing.check_in) {
    throw new Error('Cannot check out without checking in first');
  }

  // Calculate working hours
  const workingHours =
    (checkOutTime.getTime() - existing.check_in.getTime()) / (1000 * 60 * 60);

  return updateAttendanceRecord(existing.id, {
    check_out: checkOutTime,
    working_hours: workingHours,
  });
}
