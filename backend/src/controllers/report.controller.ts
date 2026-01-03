/**
 * Report Controller
 * HTTP request handlers for report endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/report.service';
import logger from '../utils/logger';

/**
 * GET /api/reports/attendance
 * Get attendance report
 */
export async function getAttendanceReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employeeId = req.query.employeeId
      ? parseInt(req.query.employeeId as string)
      : parseInt(req.user!.employeeId);
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    const summary = await reportService.getAttendanceReport(employeeId, month, year);
    const dailyRecords = await reportService.getDailyAttendanceRecords(
      employeeId,
      month,
      year
    );

    res.json({
      success: true,
      data: {
        summary,
        dailyRecords,
        month,
        year,
      },
      message: 'Attendance report fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching attendance report:', error);
    next(error);
  }
}

/**
 * GET /api/reports/leave
 * Get leave report
 */
export async function getLeaveReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employeeId = req.query.employeeId
      ? parseInt(req.query.employeeId as string)
      : parseInt(req.user!.employeeId);
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    const summary = await reportService.getLeaveReport(employeeId, month, year);
    const byType = await reportService.getLeaveByType(employeeId, month, year);
    const requests = await reportService.getLeaveRequests(employeeId, month, year);

    res.json({
      success: true,
      data: {
        summary,
        byType,
        requests,
        month,
        year,
      },
      message: 'Leave report fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching leave report:', error);
    next(error);
  }
}

/**
 * GET /api/reports/payroll
 * Get payroll summary report (admin/HR only)
 */
export async function getPayrollReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    const summary = await reportService.getPayrollSummaryReport(month, year);
    const byStatus = await reportService.getPayrollByStatus(month, year);
    const byDepartment = await reportService.getDepartmentPayrollReport(month, year);

    res.json({
      success: true,
      data: {
        summary,
        byStatus,
        byDepartment,
        month,
        year,
      },
      message: 'Payroll report fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching payroll report:', error);
    next(error);
  }
}

/**
 * GET /api/reports/department-attendance
 * Get department-wise attendance report (admin/HR only)
 */
export async function getDepartmentAttendanceReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    const report = await reportService.getDepartmentAttendanceReport(month, year);

    res.json({
      success: true,
      data: report,
      month,
      year,
      message: 'Department attendance report fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching department attendance report:', error);
    next(error);
  }
}

/**
 * GET /api/reports/employee-performance
 * Get comprehensive employee performance report
 */
export async function getEmployeePerformanceReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employeeId = req.query.employeeId
      ? parseInt(req.query.employeeId as string)
      : parseInt(req.user!.employeeId);
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    const report = await reportService.getEmployeePerformanceReport(
      employeeId,
      month,
      year
    );

    res.json({
      success: true,
      data: report,
      month,
      year,
      message: 'Employee performance report fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching employee performance report:', error);
    next(error);
  }
}

/**
 * GET /api/reports/top-performers
 * Get top performing employees by attendance (admin/HR only)
 */
export async function getTopPerformers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const report = await reportService.getTopAttendanceEmployees(month, year, limit);

    res.json({
      success: true,
      data: report,
      month,
      year,
      message: 'Top performers fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching top performers:', error);
    next(error);
  }
}

/**
 * GET /api/reports/late-arrivals
 * Get late arrival statistics (admin/HR only)
 */
export async function getLateArrivalStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const month = req.query.month
      ? parseInt(req.query.month as string)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    const report = await reportService.getLateArrivalStatistics(month, year);

    res.json({
      success: true,
      data: report,
      month,
      year,
      message: 'Late arrival statistics fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching late arrival stats:', error);
    next(error);
  }
}

/**
 * GET /api/reports/trends
 * Get monthly trends for last 6 months (admin/HR only)
 */
export async function getMonthlyTrends(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trends = await reportService.getMonthlyTrends();

    res.json({
      success: true,
      data: trends,
      message: 'Monthly trends fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching monthly trends:', error);
    next(error);
  }
}
