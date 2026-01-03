import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  updateEmployeeSelfSchema,
  createEmployeeSchema,
  updateEmployeeAdminSchema,
} from '../validators/employee.validator';
import { UserRole } from '../types';

const router = Router();

// ============================================================================
// EMPLOYEE ROUTES (for authenticated employees)
// ============================================================================

/**
 * @route   GET /api/employees/me
 * @desc    Get authenticated employee's own profile
 * @access  Private (Employee, HR, Admin)
 */
router.get('/me', authenticate, employeeController.getMyProfile);

/**
 * @route   PATCH /api/employees/me
 * @desc    Update authenticated employee's own profile (limited fields)
 * @access  Private (Employee, HR, Admin)
 */
router.patch(
  '/me',
  authenticate,
  validate(updateEmployeeSelfSchema),
  employeeController.updateMyProfile
);

// ============================================================================
// ADMIN/HR ROUTES (for employee management)
// ============================================================================

/**
 * @route   GET /api/employees
 * @desc    List all employees with pagination and filters
 * @access  Private (HR, Admin)
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN),
  employeeController.listEmployees
);

/**
 * @route   GET /api/employees/:id
 * @desc    Get specific employee by ID
 * @access  Private (HR, Admin)
 */
router.get(
  '/:id',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN),
  employeeController.getEmployeeById
);

/**
 * @route   POST /api/employees
 * @desc    Create new employee (creates user + employee in transaction)
 * @access  Private (HR, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN),
  validate(createEmployeeSchema),
  employeeController.createEmployee
);

/**
 * @route   PATCH /api/employees/:id
 * @desc    Update employee by ID (full update with all fields)
 * @access  Private (HR, Admin)
 */
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN),
  validate(updateEmployeeAdminSchema),
  employeeController.updateEmployee
);

export default router;
