/**
 * Attendance Module Type Definitions
 * Defines all types, interfaces, and DTOs for attendance management
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  LEAVE = 'LEAVE',
  WORK_FROM_HOME = 'WORK_FROM_HOME',
  ON_DUTY = 'ON_DUTY',
}

// ============================================================================
// DATABASE ROW INTERFACES
// ============================================================================

/**
 * Attendance record row from database
 */
export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: Date;
  check_in_at: Date | null;
  check_out_at: Date | null;
  status: AttendanceStatus;
  work_hours: number;
  remarks: string | null;
  is_late: boolean;
  late_by_minutes: number;
  location_check_in: string | null;
  location_check_out: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Attendance with employee details (for admin views)
 */
export interface AttendanceWithEmployee extends AttendanceRecord {
  employee_name: string;
  employee_code: string;
  department: string;
  designation: string;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * Check-in request body
 */
export interface CheckInRequest {
  location?: string;
  remarks?: string;
}

/**
 * Check-out request body
 */
export interface CheckOutRequest {
  location?: string;
  remarks?: string;
}

/**
 * Query parameters for getting attendance records
 */
export interface AttendanceQueryParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

/**
 * Admin query parameters (includes employee filter)
 */
export interface AdminAttendanceQueryParams extends AttendanceQueryParams {
  employeeId?: string;
  department?: string;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Single attendance record response
 */
export interface AttendanceResponse {
  id: number;
  employeeId: number;
  date: string; // YYYY-MM-DD
  checkInAt: string | null; // ISO timestamp
  checkOutAt: string | null; // ISO timestamp
  status: AttendanceStatus;
  workHours: number;
  remarks: string | null;
  isLate: boolean;
  lateByMinutes: number;
  locationCheckIn: string | null;
  locationCheckOut: string | null;
}

/**
 * Attendance with employee info (for admin)
 */
export interface AttendanceWithEmployeeResponse extends AttendanceResponse {
  employee: {
    id: number;
    name: string;
    employeeCode: string;
    department: string;
    designation: string;
  };
}

/**
 * Paginated attendance list response
 */
export interface AttendanceListResponse {
  success: boolean;
  message: string;
  data: {
    records: AttendanceResponse[] | AttendanceWithEmployeeResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary?: AttendanceSummary;
  };
}

/**
 * Single attendance response
 */
export interface SingleAttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceResponse;
}

/**
 * Attendance summary statistics
 */
export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  wfhDays: number;
  totalWorkHours: number;
  averageWorkHours: number;
}

// ============================================================================
// SERVICE LAYER TYPES
// ============================================================================

/**
 * Check-in input for service layer
 */
export interface CheckInInput {
  employeeId: number;
  location?: string;
  remarks?: string;
}

/**
 * Check-out input for service layer
 */
export interface CheckOutInput {
  employeeId: number;
  location?: string;
  remarks?: string;
}

/**
 * Filters for querying attendance
 */
export interface AttendanceFilters {
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  department?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// BUSINESS RULE TYPES
// ============================================================================

/**
 * Attendance validation result
 */
export interface AttendanceValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Work hours calculation result
 */
export interface WorkHoursCalculation {
  hours: number;
  isLate: boolean;
  lateByMinutes: number;
  status: AttendanceStatus;
}
