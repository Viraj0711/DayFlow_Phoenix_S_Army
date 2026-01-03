/**
 * Report Service
 * Business logic for generating reports using SQL aggregations
 */

import db from '../db/pool';
import {
  AttendanceReportData,
  LeaveReportData,
  LeaveByTypeData,
  PayrollSummaryData,
  PayrollByStatusData,
  DepartmentPayrollData,
  DepartmentAttendanceReport,
} from '../types/report.types';

// ============================================================================
// ATTENDANCE REPORTS
// ============================================================================

/**
 * Get attendance report for an employee
 * Uses SQL aggregations with GROUP BY and COUNT
 */
export async function getAttendanceReport(
  employeeId: number,
  month: number,
  year: number
): Promise<AttendanceReportData> {
  const query = `
    SELECT 
      COUNT(*)::int as total_days,
      COUNT(*) FILTER (WHERE status = 'PRESENT')::int as present_days,
      COUNT(*) FILTER (WHERE status = 'ABSENT')::int as absent_days,
      COUNT(*) FILTER (WHERE status = 'HALF_DAY')::int as half_days,
      COUNT(*) FILTER (WHERE status = 'LEAVE')::int as leave_days,
      COUNT(*) FILTER (WHERE status = 'WORK_FROM_HOME')::int as wfh_days,
      COALESCE(SUM(work_hours), 0)::float as total_work_hours,
      COALESCE(AVG(work_hours), 0)::float as average_work_hours,
      COUNT(*) FILTER (WHERE is_late = true)::int as late_count
    FROM attendance_records
    WHERE employee_id = $1
      AND EXTRACT(MONTH FROM date) = $2
      AND EXTRACT(YEAR FROM date) = $3
  `;

  const result = await db.query<AttendanceReportData>(query, [
    employeeId,
    month,
    year,
  ]);

  return (
    result.rows[0] || {
      total_days: 0,
      present_days: 0,
      absent_days: 0,
      half_days: 0,
      leave_days: 0,
      wfh_days: 0,
      total_work_hours: 0,
      average_work_hours: 0,
      late_count: 0,
    }
  );
}

/**
 * Get daily attendance records for detailed report
 */
export async function getDailyAttendanceRecords(
  employeeId: number,
  month: number,
  year: number
): Promise<any[]> {
  const query = `
    SELECT 
      date,
      status,
      check_in_at,
      check_out_at,
      work_hours,
      is_late,
      late_by_minutes
    FROM attendance_records
    WHERE employee_id = $1
      AND EXTRACT(MONTH FROM date) = $2
      AND EXTRACT(YEAR FROM date) = $3
    ORDER BY date ASC
  `;

  const result = await db.query(query, [employeeId, month, year]);
  return result.rows;
}

/**
 * Get department-wise attendance summary
 * Uses SQL GROUP BY for aggregation
 */
export async function getDepartmentAttendanceReport(
  month: number,
  year: number
): Promise<DepartmentAttendanceReport[]> {
  const query = `
    SELECT 
      e.department,
      COUNT(DISTINCT a.employee_id)::int as total_employees,
      COUNT(*) FILTER (WHERE a.status = 'PRESENT')::int as present_count,
      COUNT(*) FILTER (WHERE a.status = 'ABSENT')::int as absent_count,
      COUNT(*) FILTER (WHERE a.status = 'HALF_DAY')::int as half_day_count,
      COUNT(*) FILTER (WHERE a.status = 'LEAVE')::int as leave_count,
      COALESCE(AVG(a.work_hours), 0)::float as average_work_hours,
      COUNT(*) FILTER (WHERE a.is_late = true)::int as late_count
    FROM attendance_records a
    INNER JOIN employees e ON a.employee_id = e.id
    WHERE EXTRACT(MONTH FROM a.date) = $1
      AND EXTRACT(YEAR FROM a.date) = $2
    GROUP BY e.department
    ORDER BY e.department
  `;

  const result = await db.query<DepartmentAttendanceReport>(query, [month, year]);
  return result.rows;
}

// ============================================================================
// LEAVE REPORTS
// ============================================================================

/**
 * Get leave report for an employee
 * Uses SQL COUNT and GROUP BY for status aggregation
 */
export async function getLeaveReport(
  employeeId: number,
  month: number,
  year: number
): Promise<LeaveReportData> {
  const query = `
    SELECT 
      COUNT(*)::int as total_requests,
      COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending,
      COUNT(*) FILTER (WHERE status = 'APPROVED')::int as approved,
      COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected,
      COUNT(*) FILTER (WHERE status = 'CANCELLED')::int as cancelled
    FROM leave_requests
    WHERE employee_id = $1
      AND (
        (EXTRACT(MONTH FROM start_date) = $2 AND EXTRACT(YEAR FROM start_date) = $3)
        OR
        (EXTRACT(MONTH FROM end_date) = $2 AND EXTRACT(YEAR FROM end_date) = $3)
      )
  `;

  const result = await db.query<LeaveReportData>(query, [employeeId, month, year]);

  return (
    result.rows[0] || {
      total_requests: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    }
  );
}

/**
 * Get leave breakdown by type
 * Uses SQL GROUP BY to aggregate by leave type
 */
export async function getLeaveByType(
  employeeId: number,
  month: number,
  year: number
): Promise<LeaveByTypeData[]> {
  const query = `
    SELECT 
      leave_type,
      COUNT(*)::int as request_count,
      COALESCE(SUM(total_days), 0)::int as total_days
    FROM leave_requests
    WHERE employee_id = $1
      AND (
        (EXTRACT(MONTH FROM start_date) = $2 AND EXTRACT(YEAR FROM start_date) = $3)
        OR
        (EXTRACT(MONTH FROM end_date) = $2 AND EXTRACT(YEAR FROM end_date) = $3)
      )
    GROUP BY leave_type
    ORDER BY leave_type
  `;

  const result = await db.query<LeaveByTypeData>(query, [employeeId, month, year]);
  return result.rows;
}

/**
 * Get detailed leave requests
 */
export async function getLeaveRequests(
  employeeId: number,
  month: number,
  year: number
): Promise<any[]> {
  const query = `
    SELECT 
      id,
      leave_type,
      start_date,
      end_date,
      total_days,
      status,
      remarks,
      created_at
    FROM leave_requests
    WHERE employee_id = $1
      AND (
        (EXTRACT(MONTH FROM start_date) = $2 AND EXTRACT(YEAR FROM start_date) = $3)
        OR
        (EXTRACT(MONTH FROM end_date) = $2 AND EXTRACT(YEAR FROM end_date) = $3)
      )
    ORDER BY start_date DESC
  `;

  const result = await db.query(query, [employeeId, month, year]);
  return result.rows;
}

// ============================================================================
// PAYROLL REPORTS
// ============================================================================

/**
 * Get payroll summary report
 * Uses SQL SUM and AVG aggregations
 */
export async function getPayrollSummaryReport(
  month: number,
  year: number
): Promise<PayrollSummaryData> {
  const query = `
    SELECT 
      COUNT(*)::int as total_employees,
      COALESCE(SUM(gross_salary), 0)::float as total_gross_salary,
      COALESCE(SUM(total_deductions), 0)::float as total_deductions,
      COALESCE(SUM(net_salary), 0)::float as total_net_salary,
      COALESCE(SUM(bonus), 0)::float as total_bonus,
      COALESCE(SUM(incentive), 0)::float as total_incentive,
      COALESCE(AVG(net_salary), 0)::float as average_net_salary
    FROM payroll_records
    WHERE month = $1 AND year = $2
  `;

  const result = await db.query<PayrollSummaryData>(query, [month, year]);

  return (
    result.rows[0] || {
      total_employees: 0,
      total_gross_salary: 0,
      total_deductions: 0,
      total_net_salary: 0,
      total_bonus: 0,
      total_incentive: 0,
      average_net_salary: 0,
    }
  );
}

/**
 * Get payroll breakdown by payment status
 * Uses SQL GROUP BY to aggregate by status
 */
export async function getPayrollByStatus(
  month: number,
  year: number
): Promise<PayrollByStatusData[]> {
  const query = `
    SELECT 
      payment_status,
      COUNT(*)::int as count,
      COALESCE(SUM(net_salary), 0)::float as total_amount
    FROM payroll_records
    WHERE month = $1 AND year = $2
    GROUP BY payment_status
    ORDER BY payment_status
  `;

  const result = await db.query<PayrollByStatusData>(query, [month, year]);
  return result.rows;
}

/**
 * Get department-wise payroll summary
 * Uses SQL GROUP BY with JOIN for department aggregation
 */
export async function getDepartmentPayrollReport(
  month: number,
  year: number
): Promise<DepartmentPayrollData[]> {
  const query = `
    SELECT 
      e.department,
      COUNT(*)::int as employee_count,
      COALESCE(SUM(p.gross_salary), 0)::float as total_gross_salary,
      COALESCE(SUM(p.net_salary), 0)::float as total_net_salary,
      COALESCE(AVG(p.net_salary), 0)::float as average_net_salary
    FROM payroll_records p
    INNER JOIN employees e ON p.employee_id = e.id
    WHERE p.month = $1 AND p.year = $2
    GROUP BY e.department
    ORDER BY e.department
  `;

  const result = await db.query<DepartmentPayrollData>(query, [month, year]);
  return result.rows;
}

/**
 * Get detailed payroll records for report
 */
export async function getPayrollRecordsForReport(
  month: number,
  year: number
): Promise<any[]> {
  const query = `
    SELECT 
      p.employee_id,
      e.employee_code,
      e.first_name || ' ' || e.last_name as employee_name,
      e.department,
      p.gross_salary,
      p.total_deductions,
      p.net_salary,
      p.payment_status
    FROM payroll_records p
    INNER JOIN employees e ON p.employee_id = e.id
    WHERE p.month = $1 AND p.year = $2
    ORDER BY e.department, e.first_name
  `;

  const result = await db.query(query, [month, year]);
  return result.rows;
}

// ============================================================================
// COMBINED EMPLOYEE PERFORMANCE REPORT
// ============================================================================

/**
 * Get comprehensive employee performance report
 * Combines attendance, leave, and payroll data
 */
export async function getEmployeePerformanceReport(
  employeeId: number,
  month: number,
  year: number
): Promise<{
  attendance: AttendanceReportData;
  leave: LeaveReportData & { byType: LeaveByTypeData[] };
  payroll: any;
  employee: any;
}> {
  // Get employee details
  const employeeQuery = `
    SELECT 
      id,
      employee_code,
      first_name || ' ' || last_name as employee_name,
      department,
      designation
    FROM employees
    WHERE id = $1
  `;

  const employeeResult = await db.query(employeeQuery, [employeeId]);
  const employee = employeeResult.rows[0];

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get attendance report
  const attendance = await getAttendanceReport(employeeId, month, year);

  // Get leave report
  const leaveReport = await getLeaveReport(employeeId, month, year);
  const leaveByType = await getLeaveByType(employeeId, month, year);

  // Get payroll
  const payrollQuery = `
    SELECT 
      gross_salary,
      net_salary,
      bonus,
      incentive,
      payment_status
    FROM payroll_records
    WHERE employee_id = $1 AND month = $2 AND year = $3
  `;

  const payrollResult = await db.query(payrollQuery, [employeeId, month, year]);
  const payroll = payrollResult.rows[0] || null;

  return {
    employee,
    attendance,
    leave: { ...leaveReport, byType: leaveByType },
    payroll,
  };
}

// ============================================================================
// ANALYTICS & INSIGHTS
// ============================================================================

/**
 * Get top performing employees by attendance
 */
export async function getTopAttendanceEmployees(
  month: number,
  year: number,
  limit: number = 10
): Promise<any[]> {
  const query = `
    SELECT 
      e.id,
      e.employee_code,
      e.first_name || ' ' || e.last_name as employee_name,
      e.department,
      COUNT(*) FILTER (WHERE a.status = 'PRESENT')::int as present_days,
      COUNT(*)::int as total_days,
      ROUND(
        (COUNT(*) FILTER (WHERE a.status = 'PRESENT')::float / 
         NULLIF(COUNT(*)::float, 0)) * 100, 
        2
      ) as attendance_percentage
    FROM employees e
    LEFT JOIN attendance_records a ON e.id = a.employee_id
      AND EXTRACT(MONTH FROM a.date) = $1
      AND EXTRACT(YEAR FROM a.date) = $2
    WHERE e.employment_status = 'ACTIVE'
    GROUP BY e.id, e.employee_code, e.first_name, e.last_name, e.department
    ORDER BY attendance_percentage DESC
    LIMIT $3
  `;

  const result = await db.query(query, [month, year, limit]);
  return result.rows;
}

/**
 * Get late arrival statistics
 */
export async function getLateArrivalStatistics(
  month: number,
  year: number
): Promise<any[]> {
  const query = `
    SELECT 
      e.id,
      e.employee_code,
      e.first_name || ' ' || e.last_name as employee_name,
      e.department,
      COUNT(*) FILTER (WHERE a.is_late = true)::int as late_days,
      AVG(a.late_by_minutes) FILTER (WHERE a.is_late = true)::float as avg_late_minutes
    FROM employees e
    LEFT JOIN attendance_records a ON e.id = a.employee_id
      AND EXTRACT(MONTH FROM a.date) = $1
      AND EXTRACT(YEAR FROM a.date) = $2
    WHERE e.employment_status = 'ACTIVE'
    GROUP BY e.id, e.employee_code, e.first_name, e.last_name, e.department
    HAVING COUNT(*) FILTER (WHERE a.is_late = true) > 0
    ORDER BY late_days DESC, avg_late_minutes DESC
  `;

  const result = await db.query(query, [month, year]);
  return result.rows;
}

/**
 * Get monthly trends (last 6 months)
 */
export async function getMonthlyTrends(): Promise<any[]> {
  const query = `
    SELECT 
      p.year,
      p.month,
      COUNT(DISTINCT p.employee_id)::int as total_employees,
      COALESCE(SUM(p.net_salary), 0)::float as total_payout,
      COALESCE(AVG(p.net_salary), 0)::float as average_salary,
      COUNT(*) FILTER (WHERE p.payment_status = 'PROCESSED')::int as paid_count
    FROM payroll_records p
    WHERE p.generated_at >= NOW() - INTERVAL '6 months'
    GROUP BY p.year, p.month
    ORDER BY p.year DESC, p.month DESC
    LIMIT 6
  `;

  const result = await db.query(query);
  return result.rows;
}
