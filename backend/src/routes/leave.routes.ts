import { Router } from 'express';
import * as leaveController from '../controllers/leave.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createLeaveRequestSchema,
  approveLeaveRequestSchema,
  rejectLeaveRequestSchema,
} from '../validators/leave.validator';
import { UserRole } from '../types';

const router = Router();

// ============================================================================
// EMPLOYEE ROUTES (for leave requests)
// ============================================================================

/**
 * @route   POST /api/leave-requests
 * @desc    Create new leave request
 * @access  Private (Employee, HR, Admin)
 */
router.post(
  '/',
  authenticate,
  validate(createLeaveRequestSchema),
  leaveController.createLeaveRequest
);

/**
 * @route   GET /api/leave-requests/me
 * @desc    Get authenticated employee's leave requests
 * @access  Private (Employee, HR, Admin)
 */
router.get('/me', authenticate, leaveController.getMyLeaveRequests);

/**
 * @route   GET /api/leave-requests/me/summary
 * @desc    Get leave summary (balances + recent requests + stats)
 * @access  Private (Employee, HR, Admin)
 */
router.get('/me/summary', authenticate, leaveController.getMyLeaveSummary);

// ============================================================================
// ADMIN/HR ROUTES (for leave management)
// ============================================================================

/**
 * @route   GET /api/leave-requests
 * @desc    List all leave requests with filters
 * @access  Private (HR, Admin)
 * @query   status, employee_id, leave_type_id, start_date, end_date, page, limit
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN),
  leaveController.listLeaveRequests
);

/**
 * @route   PATCH /api/leave-requests/:id/approve
 * @desc    Approve leave request (updates status and balances)
 * @access  Private (HR, Admin)
 */
router.patch(
  '/:id/approve',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN),
  validate(approveLeaveRequestSchema),
  leaveController.approveLeaveRequest
);

/**
 * @route   PATCH /api/leave-requests/:id/reject
 * @desc    Reject leave request (updates status and releases balance)
 * @access  Private (HR, Admin)
 */
router.patch(
  '/:id/reject',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN),
  validate(rejectLeaveRequestSchema),
  leaveController.rejectLeaveRequest
);

export default router;
