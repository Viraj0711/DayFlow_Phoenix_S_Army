/**
 * Payroll Routes
 * API endpoints for payroll management
 */

import { Router } from 'express';
import * as payrollController from '../controllers/payroll.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

/**
 * Employee Routes
 */

// GET /api/payroll/me - Get my payroll records
router.get('/me', authMiddleware, payrollController.getMyPayroll);

/**
 * Admin/HR Routes
 */

// GET /api/payroll - Get all payroll records (with filters)
router.get(
  '/',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
  payrollController.getPayrollRecords
);

// POST /api/payroll/generate - Generate payroll for an employee
router.post(
  '/generate',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
  payrollController.generatePayroll
);

// PATCH /api/payroll/:employeeId - Update payroll record
router.patch(
  '/:employeeId',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
  payrollController.updatePayroll
);

export default router;
