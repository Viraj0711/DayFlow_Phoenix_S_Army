/**
 * Report Module Type Definitions
 */

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * Report query parameters
 */
export interface ReportQueryParams {
  employeeId?: string;
  month?: string;
  year?: string;
  department?: string;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Attendance report response
 */
export interface AttendanceReportResponse {
  success: boolean;
  message: string;
  data: {
    employeeId?: number;
    employeeName?: string;
    month: number;
    year: number;
    period: string; // "January 2026"
    summary: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      halfDays: number;
      leaveDays: number;
      wfhDays: number;
      totalWorkHours: number;
      averageWorkHours: number;
      lateCount: number;
    };
    dailyRecords?: {
      date: string;
      status: string;
      checkIn: string | null;
      checkOut: string | null;
      workHours: number;
      isLate: boolean;
    }[];
  };
}

/**
 * Department-wise attendance summary
 */
export interface DepartmentAttendanceReport {
  department: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  halfDayCount: number;
  leaveCount: number;
  averageWorkHours: number;
  lateCount: number;
}

/**
 * Leave report response
 */
export interface LeaveReportResponse {
  success: boolean;
  message: string;
  data: {
    employeeId?: number;
    employeeName?: string;
    month: number;
    year: number;
    period: string;
    summary: {
      totalRequests: number;
      pending: number;
      approved: number;
      rejected: number;
      cancelled: number;
      byType: {
        type: string;
        count: number;
        days: number;
      }[];
    };
    requests?: {
      id: number;
      leaveType: string;
      startDate: string;
      endDate: string;
      totalDays: number;
      status: string;
      remarks: string;
    }[];
  };
}

/**
 * Payroll report response
 */
export interface PayrollReportResponse {
  success: boolean;
  message: string;
  data: {
    month: number;
    year: number;
    period: string;
    summary: {
      totalEmployees: number;
      totalGrossSalary: number;
      totalDeductions: number;
      totalNetSalary: number;
      totalBonus: number;
      totalIncentive: number;
      averageNetSalary: number;
      paymentStatus: {
        status: string;
        count: number;
        amount: number;
      }[];
    };
    departmentBreakdown?: {
      department: string;
      employeeCount: number;
      totalGrossSalary: number;
      totalNetSalary: number;
      averageNetSalary: number;
    }[];
    records?: {
      employeeId: number;
      employeeCode: string;
      employeeName: string;
      department: string;
      grossSalary: number;
      deductions: number;
      netSalary: number;
      paymentStatus: string;
    }[];
  };
}

/**
 * Employee performance report (combined)
 */
export interface EmployeePerformanceReport {
  success: boolean;
  message: string;
  data: {
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    department: string;
    designation: string;
    month: number;
    year: number;
    period: string;
    attendance: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      leaveDays: number;
      lateCount: number;
      attendancePercentage: number;
    };
    leave: {
      totalRequests: number;
      approvedLeaves: number;
      pendingLeaves: number;
      totalLeaveDays: number;
    };
    payroll: {
      grossSalary: number;
      netSalary: number;
      bonus: number;
      incentive: number;
      paymentStatus: string;
    };
  };
}

// ============================================================================
// SERVICE LAYER TYPES
// ============================================================================

/**
 * Attendance report data
 */
export interface AttendanceReportData {
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  leave_days: number;
  wfh_days: number;
  total_work_hours: number;
  average_work_hours: number;
  late_count: number;
}

/**
 * Leave report data
 */
export interface LeaveReportData {
  total_requests: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

/**
 * Leave by type data
 */
export interface LeaveByTypeData {
  leave_type: string;
  request_count: number;
  total_days: number;
}

/**
 * Payroll summary data
 */
export interface PayrollSummaryData {
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
  total_bonus: number;
  total_incentive: number;
  average_net_salary: number;
}

/**
 * Payroll by status data
 */
export interface PayrollByStatusData {
  payment_status: string;
  count: number;
  total_amount: number;
}

/**
 * Department payroll data
 */
export interface DepartmentPayrollData {
  department: string;
  employee_count: number;
  total_gross_salary: number;
  total_net_salary: number;
  average_net_salary: number;
}
