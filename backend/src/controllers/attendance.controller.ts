/**
 * Attendance Controller
 * Handles HTTP requests for attendance management
 */

import { Request, Response, NextFunction } from 'express';
import * as attendanceService from '../services/attendance.service';
import { UserRole } from '../types/auth.types';
import {
  AttendanceResponse,
  AttendanceWithEmployeeResponse,
  AttendanceListResponse,
  SingleAttendanceResponse,
  CheckInRequest,
  CheckOutRequest,
  AttendanceQueryParams,
  AdminAttendanceQueryParams,
  AttendanceRecord,
  AttendanceWithEmployee,
} from '../types/attendance.types';
import logger from '../utils/logger';

// ============================================================================
// EMPLOYEE ENDPOINTS
// ============================================================================

/**
 * POST /attendance/check-in
 * Employee checks in for the day
 * @access Employee (authenticated)
 */
export async function checkIn(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { location, remarks } = req.body as CheckInRequest;

    // Get employee ID from user
    const employeeId = parseInt(req.user.employeeId, 10);

    // Call service
    const record = await attendanceService.checkIn({
      employeeId,
      location,
      remarks,
    });

    // Transform response
    const response: SingleAttendanceResponse = {
      success: true,
      message: 'Checked in successfully',
      data: transformAttendanceRecord(record),
    };

    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Check-in controller error', { error, user: req.user });

    if (error.message?.includes('Already checked in')) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
}

/**
 * POST /attendance/check-out
 * Employee checks out for the day
 * @access Employee (authenticated)
 */
export async function checkOut(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { location, remarks } = req.body as CheckOutRequest;

    // Get employee ID from user
    const employeeId = parseInt(req.user.employeeId, 10);

    // Call service
    const record = await attendanceService.checkOut({
      employeeId,
      location,
      remarks,
    });

    // Transform response
    const response: SingleAttendanceResponse = {
      success: true,
      message: 'Checked out successfully',
      data: transformAttendanceRecord(record),
    };

    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Check-out controller error', { error, user: req.user });

    if (
      error.message?.includes('No check-in') ||
      error.message?.includes('Already checked out')
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
}

/**
 * GET /attendance/me?from=YYYY-MM-DD&to=YYYY-MM-DD&status=PRESENT&page=1&limit=31
 * Get authenticated employee's attendance records
 * @access Employee (authenticated)
 */
export async function getMyAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Parse query parameters
    const { from, to, status, page, limit } = req.query as AttendanceQueryParams;

    // Validate and parse dates
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (from) {
      startDate = new Date(from);
      if (isNaN(startDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid from date format. Use YYYY-MM-DD',
        });
        return;
      }
    }

    if (to) {
      endDate = new Date(to);
      if (isNaN(endDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid to date format. Use YYYY-MM-DD',
        });
        return;
      }
    }

    // Validate date range
    const validation = attendanceService.validateDateRange(startDate, endDate);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: validation.error,
      });
      return;
    }

    // Parse pagination
    const pageNum = page ? parseInt(page.toString(), 10) : 1;
    const limitNum = limit ? parseInt(limit.toString(), 10) : 31;

    // Get employee ID from user
    const employeeId = parseInt(req.user.employeeId, 10);

    // Get attendance records
    const { records, total } = await attendanceService.getMyAttendance(
      employeeId,
      {
        startDate,
        endDate,
        status,
        page: pageNum,
        limit: limitNum,
      }
    );

    // Get summary if date range provided
    let summary;
    if (startDate && endDate) {
      summary = await attendanceService.getAttendanceSummary(
        employeeId,
        startDate,
        endDate
      );
    }

    // Transform response
    const response: AttendanceListResponse = {
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        records: records.map(transformAttendanceRecord),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        summary,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get my attendance error', { error, user: req.user });
    next(error);
  }
}

/**
 * GET /attendance/today
 * Get today's attendance status for authenticated employee
 * @access Employee (authenticated)
 */
export async function getTodayAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const employeeId = parseInt(req.user.employeeId, 10);

    const record = await attendanceService.getTodayAttendance(
      employeeId
    );

    if (!record) {
      res.status(200).json({
        success: true,
        message: 'No attendance record for today',
        data: null,
      });
      return;
    }

    const response: SingleAttendanceResponse = {
      success: true,
      message: 'Today\'s attendance retrieved successfully',
      data: transformAttendanceRecord(record),
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get today attendance error', { error, user: req.user });
    next(error);
  }
}

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /attendance?employeeId=123&from=YYYY-MM-DD&to=YYYY-MM-DD&department=IT&status=PRESENT&page=1&limit=50
 * Get attendance records for all employees (admin only)
 * @access HR_ADMIN, SUPER_ADMIN
 */
export async function getAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Verify admin role
    if (
      req.user.role !== UserRole.HR_ADMIN &&
      req.user.role !== UserRole.SUPER_ADMIN
    ) {
      res.status(403).json({
        success: false,
        message: 'Access denied. HR_ADMIN or SUPER_ADMIN role required',
      });
      return;
    }

    // Parse query parameters
    const {
      employeeId,
      from,
      to,
      department,
      status,
      page,
      limit,
    } = req.query as AdminAttendanceQueryParams;

    // Validate and parse dates
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (from) {
      startDate = new Date(from);
      if (isNaN(startDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid from date format. Use YYYY-MM-DD',
        });
        return;
      }
    }

    if (to) {
      endDate = new Date(to);
      if (isNaN(endDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid to date format. Use YYYY-MM-DD',
        });
        return;
      }
    }

    // Validate date range
    const validation = attendanceService.validateDateRange(startDate, endDate);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: validation.error,
      });
      return;
    }

    // Parse employee ID
    const empId = employeeId ? parseInt(employeeId.toString(), 10) : undefined;

    // Parse pagination
    const pageNum = page ? parseInt(page.toString(), 10) : 1;
    const limitNum = limit ? parseInt(limit.toString(), 10) : 50;

    // Get attendance records
    const { records, total } = await attendanceService.getAttendanceRecords({
      employeeId: empId,
      startDate,
      endDate,
      department,
      status,
      page: pageNum,
      limit: limitNum,
    });

    // Get summary if employee and date range provided
    let summary;
    if (empId && startDate && endDate) {
      summary = await attendanceService.getAttendanceSummary(
        empId,
        startDate,
        endDate
      );
    }

    // Transform response
    const response: AttendanceListResponse = {
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        records: records.map(transformAttendanceWithEmployee),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        summary,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Get attendance (admin) error', { error, user: req.user });
    next(error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform database record to API response format
 */
function transformAttendanceRecord(
  record: AttendanceRecord
): AttendanceResponse {
  return {
    id: record.id,
    employeeId: record.employee_id,
    date: record.date?.toISOString().split('T')[0] || '', // YYYY-MM-DD
    checkInAt: record.check_in_at ? record.check_in_at.toISOString() : null,
    checkOutAt: record.check_out_at ? record.check_out_at.toISOString() : null,
    status: record.status,
    workHours: record.work_hours,
    remarks: record.remarks,
    isLate: record.is_late,
    lateByMinutes: record.late_by_minutes,
    locationCheckIn: record.location_check_in,
    locationCheckOut: record.location_check_out,
  };
}

/**
 * Transform database record with employee to API response format
 */
function transformAttendanceWithEmployee(
  record: AttendanceWithEmployee
): AttendanceWithEmployeeResponse {
  return {
    id: record.id,
    employeeId: record.employee_id,
    date: record.date?.toISOString().split('T')[0] || '',
    checkInAt: record.check_in_at ? record.check_in_at.toISOString() : null,
    checkOutAt: record.check_out_at ? record.check_out_at.toISOString() : null,
    status: record.status,
    workHours: record.work_hours,
    remarks: record.remarks,
    isLate: record.is_late,
    lateByMinutes: record.late_by_minutes,
    locationCheckIn: record.location_check_in,
    locationCheckOut: record.location_check_out,
    employee: {
      id: record.employee_id,
      name: record.employee_name,
      employeeCode: record.employee_code,
      department: record.department,
      designation: record.designation,
    },
  };
}
