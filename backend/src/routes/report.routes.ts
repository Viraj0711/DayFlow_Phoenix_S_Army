/**
 * Report Routes
 * API endpoints for generating reports
 */

import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

/**
 * Employee Routes - can view their own reports
 */

// GET /api/reports/attendance - Get attendance report
router.get('/attendance', authMiddleware, reportController.getAttendanceReport);

// GET /api/reports/leave - Get leave report
router.get('/leave', authMiddleware, reportController.getLeaveReport);

// GET /api/reports/employee-performance - Get comprehensive performance report
router.get(
  '/employee-performance',
  authMiddleware,
  reportController.getEmployeePerformanceReport
);

/**
 * Admin/HR Routes - can view organization-wide reports
 */

// GET /api/reports/payroll - Get payroll summary report
router.get(
  '/payroll',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
  reportController.getPayrollReport
);

// GET /api/reports/department-attendance - Get department-wise attendance
router.get(
  '/department-attendance',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]),
  reportController.getDepartmentAttendanceReport
);

// GET /api/reports/top-performers - Get top performing employees
router.get(
  '/top-performers',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]),
  reportController.getTopPerformers
);

// GET /api/reports/late-arrivals - Get late arrival statistics
router.get(
  '/late-arrivals',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]),
  reportController.getLateArrivalStats
);

// GET /api/reports/trends - Get monthly trends
router.get(
  '/trends',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
  reportController.getMonthlyTrends
);

export default router;
