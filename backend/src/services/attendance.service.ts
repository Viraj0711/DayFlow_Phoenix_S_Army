/**
 * Attendance Service
 * Business logic for attendance management including check-in, check-out,
 * and attendance record queries with proper validation
 */

import db from '../db/pool';
import logger from '../utils/logger';
import {
  AttendanceRecord,
  AttendanceStatus,
  CheckInInput,
  CheckOutInput,
  AttendanceFilters,
  AttendanceSummary,
  WorkHoursCalculation,
  AttendanceWithEmployee,
} from '../types/attendance.types';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STANDARD_WORK_HOURS = 8;
const LATE_THRESHOLD_MINUTES = 15; // Minutes after start time considered late
const HALF_DAY_THRESHOLD_HOURS = 4; // Minimum hours for full day
const STANDARD_START_TIME = 9; // 9 AM

// ============================================================================
// CHECK-IN FUNCTIONALITY
// ============================================================================

/**
 * Employee check-in
 * Creates or updates attendance record for today
 * Business Rules:
 * - Only one check-in per day allowed
 * - Cannot check-in if already checked in without checking out
 * - Automatically calculates late status
 */
export async function checkIn(input: CheckInInput): Promise<AttendanceRecord> {
  const { employeeId, location, remarks } = input;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInTime = new Date();

    // Check for existing record today
    const existingQuery = `
      SELECT 
        id, employee_id, date, check_in_at, check_out_at, 
        status, work_hours, remarks, is_late, late_by_minutes,
        location_check_in, location_check_out, created_at, updated_at
      FROM attendance_records
      WHERE employee_id = $1 
        AND date = $2::date
      FOR UPDATE
    `;

    const existingResult = await client.query<AttendanceRecord>(
      existingQuery,
      [employeeId, today]
    );

    const existing = existingResult.rows[0];

    // Validation: Prevent check-in if already checked in and not checked out
    if (existing && existing.check_in_at && !existing.check_out_at) {
      throw new Error(
        'Already checked in today. Please check out before checking in again.'
      );
    }

    // Calculate late status
    const { isLate, lateByMinutes } = calculateLateStatus(checkInTime);

    let result: AttendanceRecord;

    if (existing) {
      // Update existing record (e.g., checking in again after previous check-out)
      const updateQuery = `
        UPDATE attendance_records
        SET 
          check_in_at = $1,
          check_out_at = NULL,
          status = $2,
          is_late = $3,
          late_by_minutes = $4,
          location_check_in = $5,
          remarks = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING 
          id, employee_id, date, check_in_at, check_out_at, 
          status, work_hours, remarks, is_late, late_by_minutes,
          location_check_in, location_check_out, created_at, updated_at
      `;

      const updateResult = await client.query<AttendanceRecord>(updateQuery, [
        checkInTime,
        AttendanceStatus.PRESENT,
        isLate,
        lateByMinutes,
        location || null,
        remarks || null,
        existing.id,
      ]);

      if (!updateResult.rows[0]) {
        throw new Error('Failed to update attendance record');
      }

      result = updateResult.rows[0];
    } else {
      // Create new record
      const insertQuery = `
        INSERT INTO attendance_records (
          employee_id, date, check_in_at, status, 
          is_late, late_by_minutes, location_check_in, remarks
        )
        VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id, employee_id, date, check_in_at, check_out_at, 
          status, work_hours, remarks, is_late, late_by_minutes,
          location_check_in, location_check_out, created_at, updated_at
      `;

      const insertResult = await client.query<AttendanceRecord>(insertQuery, [
        employeeId,
        today,
        checkInTime,
        AttendanceStatus.PRESENT,
        isLate,
        lateByMinutes,
        location || null,
        remarks || null,
      ]);

      if (!insertResult.rows[0]) {
        throw new Error('Failed to create attendance record');
      }

      result = insertResult.rows[0];
    }

    await client.query('COMMIT');

    logger.info('Employee checked in', {
      employeeId,
      recordId: result.id,
      isLate,
    });

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Check-in error', { employeeId, error });
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// CHECK-OUT FUNCTIONALITY
// ============================================================================

/**
 * Employee check-out
 * Updates attendance record with check-out time and calculates work hours
 * Business Rules:
 * - Must have checked in first
 * - Cannot check out multiple times
 * - Automatically calculates work hours and adjusts status
 */
export async function checkOut(
  input: CheckOutInput
): Promise<AttendanceRecord> {
  const { employeeId, location, remarks } = input;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOutTime = new Date();

    // Find today's record
    const findQuery = `
      SELECT 
        id, employee_id, date, check_in_at, check_out_at, 
        status, work_hours, remarks, is_late, late_by_minutes,
        location_check_in, location_check_out, created_at, updated_at
      FROM attendance_records
      WHERE employee_id = $1 
        AND date = $2::date
      FOR UPDATE
    `;

    const findResult = await client.query<AttendanceRecord>(findQuery, [
      employeeId,
      today,
    ]);

    const record = findResult.rows[0];

    // Validation: Must have checked in
    if (!record) {
      throw new Error('No check-in record found for today. Please check in first.');
    }

    if (!record.check_in_at) {
      throw new Error('No check-in time found. Please check in first.');
    }

    // Validation: Cannot check out if already checked out
    if (record.check_out_at) {
      throw new Error('Already checked out today.');
    }

    // Calculate work hours and determine status
    const workHoursCalc = calculateWorkHours(record.check_in_at, checkOutTime);

    // Update record with check-out
    const updateQuery = `
      UPDATE attendance_records
      SET 
        check_out_at = $1,
        status = $2,
        location_check_out = $3,
        remarks = CASE 
          WHEN $4 IS NOT NULL THEN 
            CASE WHEN remarks IS NULL THEN $4 ELSE remarks || ' | ' || $4 END
          ELSE remarks
        END,
        updated_at = NOW()
      WHERE id = $5
      RETURNING 
        id, employee_id, date, check_in_at, check_out_at, 
        status, work_hours, remarks, is_late, late_by_minutes,
        location_check_in, location_check_out, created_at, updated_at
    `;

    const updateResult = await client.query<AttendanceRecord>(updateQuery, [
      checkOutTime,
      workHoursCalc.status,
      location || null,
      remarks || null,
      record.id,
    ]);

    if (!updateResult.rows[0]) {
      throw new Error('Failed to update check-out record');
    }

    const result = updateResult.rows[0];

    await client.query('COMMIT');

    logger.info('Employee checked out', {
      employeeId,
      recordId: result.id,
      workHours: result.work_hours,
      status: result.status,
    });

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Check-out error', { employeeId, error });
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get attendance records for an employee
 * Used by employees to view their own attendance
 */
export async function getMyAttendance(
  employeeId: number,
  filters: AttendanceFilters
): Promise<{ records: AttendanceRecord[]; total: number }> {
  const { startDate, endDate, status, page = 1, limit = 31 } = filters;

  const conditions: string[] = ['employee_id = $1'];
  const values: any[] = [employeeId];
  let paramCount = 2;

  // Date range filter
  if (startDate) {
    conditions.push(`date >= $${paramCount}::date`);
    values.push(startDate);
    paramCount++;
  }

  if (endDate) {
    conditions.push(`date <= $${paramCount}::date`);
    values.push(endDate);
    paramCount++;
  }

  // Status filter
  if (status) {
    conditions.push(`status = $${paramCount}`);
    values.push(status);
    paramCount++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM attendance_records
    WHERE ${whereClause}
  `;

  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get paginated records
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      id, employee_id, date, check_in_at, check_out_at, 
      status, work_hours, remarks, is_late, late_by_minutes,
      location_check_in, location_check_out, created_at, updated_at
    FROM attendance_records
    WHERE ${whereClause}
    ORDER BY date DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);

  const dataResult = await db.query<AttendanceRecord>(dataQuery, values);

  return {
    records: dataResult.rows,
    total,
  };
}

/**
 * Get attendance records (Admin view)
 * Includes employee details and supports filtering by employee, department, etc.
 */
export async function getAttendanceRecords(
  filters: AttendanceFilters
): Promise<{ records: AttendanceWithEmployee[]; total: number }> {
  const {
    employeeId,
    startDate,
    endDate,
    status,
    department,
    page = 1,
    limit = 50,
  } = filters;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Employee filter
  if (employeeId) {
    conditions.push(`a.employee_id = $${paramCount}`);
    values.push(employeeId);
    paramCount++;
  }

  // Date range filter
  if (startDate) {
    conditions.push(`a.date >= $${paramCount}::date`);
    values.push(startDate);
    paramCount++;
  }

  if (endDate) {
    conditions.push(`a.date <= $${paramCount}::date`);
    values.push(endDate);
    paramCount++;
  }

  // Status filter
  if (status) {
    conditions.push(`a.status = $${paramCount}`);
    values.push(status);
    paramCount++;
  }

  // Department filter
  if (department) {
    conditions.push(`e.department = $${paramCount}`);
    values.push(department);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM attendance_records a
    INNER JOIN employees e ON a.employee_id = e.id
    ${whereClause}
  `;

  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get paginated records with employee details
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      a.id, a.employee_id, a.date, a.check_in_at, a.check_out_at, 
      a.status, a.work_hours, a.remarks, a.is_late, a.late_by_minutes,
      a.location_check_in, a.location_check_out, a.created_at, a.updated_at,
      e.employee_code,
      e.first_name || ' ' || e.last_name as employee_name,
      e.department,
      e.designation
    FROM attendance_records a
    INNER JOIN employees e ON a.employee_id = e.id
    ${whereClause}
    ORDER BY a.date DESC, e.first_name, e.last_name
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);

  const dataResult = await db.query<AttendanceWithEmployee>(dataQuery, values);

  return {
    records: dataResult.rows,
    total,
  };
}

/**
 * Get attendance summary statistics
 */
export async function getAttendanceSummary(
  employeeId: number,
  startDate: Date,
  endDate: Date
): Promise<AttendanceSummary> {
  const query = `
    SELECT 
      COUNT(*)::int as total_days,
      COUNT(*) FILTER (WHERE status = 'PRESENT')::int as present_days,
      COUNT(*) FILTER (WHERE status = 'ABSENT')::int as absent_days,
      COUNT(*) FILTER (WHERE status = 'HALF_DAY')::int as half_days,
      COUNT(*) FILTER (WHERE status = 'LEAVE')::int as leave_days,
      COUNT(*) FILTER (WHERE status = 'WORK_FROM_HOME')::int as wfh_days,
      COALESCE(SUM(work_hours), 0)::float as total_work_hours,
      COALESCE(AVG(work_hours), 0)::float as average_work_hours
    FROM attendance_records
    WHERE employee_id = $1
      AND date >= $2::date
      AND date <= $3::date
  `;

  const result = await db.query<{
    total_days: number;
    present_days: number;
    absent_days: number;
    half_days: number;
    leave_days: number;
    wfh_days: number;
    total_work_hours: number;
    average_work_hours: number;
  }>(query, [employeeId, startDate, endDate]);

  const row = result.rows[0];

  return {
    totalDays: row?.total_days || 0,
    presentDays: row?.present_days || 0,
    absentDays: row?.absent_days || 0,
    halfDays: row?.half_days || 0,
    leaveDays: row?.leave_days || 0,
    wfhDays: row?.wfh_days || 0,
    totalWorkHours: row?.total_work_hours || 0,
    averageWorkHours: row?.average_work_hours || 0,
  };
}

/**
 * Get today's attendance record for an employee
 */
export async function getTodayAttendance(
  employeeId: number
): Promise<AttendanceRecord | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = `
    SELECT 
      id, employee_id, date, check_in_at, check_out_at, 
      status, work_hours, remarks, is_late, late_by_minutes,
      location_check_in, location_check_out, created_at, updated_at
    FROM attendance_records
    WHERE employee_id = $1 
      AND date = $2::date
  `;

  const result = await db.query<AttendanceRecord>(query, [employeeId, today]);

  return result.rows[0] || null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate if employee is late and by how many minutes
 */
function calculateLateStatus(checkInTime: Date): {
  isLate: boolean;
  lateByMinutes: number;
} {
  const checkInHour = checkInTime.getHours();
  const checkInMinute = checkInTime.getMinutes();

  // Calculate total minutes since midnight
  const checkInTotalMinutes = checkInHour * 60 + checkInMinute;
  const standardStartMinutes = STANDARD_START_TIME * 60;

  const lateByMinutes = Math.max(
    0,
    checkInTotalMinutes - (standardStartMinutes + LATE_THRESHOLD_MINUTES)
  );

  return {
    isLate: lateByMinutes > 0,
    lateByMinutes,
  };
}

/**
 * Calculate work hours and determine attendance status
 */
function calculateWorkHours(
  checkIn: Date,
  checkOut: Date
): WorkHoursCalculation {
  const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

  let status: AttendanceStatus;

  if (hours >= STANDARD_WORK_HOURS) {
    status = AttendanceStatus.PRESENT;
  } else if (hours >= HALF_DAY_THRESHOLD_HOURS) {
    status = AttendanceStatus.HALF_DAY;
  } else {
    status = AttendanceStatus.HALF_DAY; // Less than 4 hours still counts as half day
  }

  const { isLate, lateByMinutes } = calculateLateStatus(checkIn);

  return {
    hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
    isLate,
    lateByMinutes,
    status,
  };
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate?: Date,
  endDate?: Date
): { isValid: boolean; error?: string } {
  if (startDate && endDate && startDate > endDate) {
    return {
      isValid: false,
      error: 'Start date must be before or equal to end date',
    };
  }

  return { isValid: true };
}
