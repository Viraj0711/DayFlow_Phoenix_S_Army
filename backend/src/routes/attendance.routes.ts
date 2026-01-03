/**
 * Attendance Routes
 * Defines all attendance-related API endpoints
 */

import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
  getAttendance,
} from '../controllers/attendance.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

// ============================================================================
// EMPLOYEE ROUTES (Authenticated employees)
// ============================================================================

/**
 * POST /attendance/check-in
 * Employee checks in for the day
 * Request Body: { location?: string, remarks?: string }
 * Response: { success: boolean, message: string, data: AttendanceResponse }
 * 
 * Example Request:
 * POST /attendance/check-in
 * {
 *   "location": "Office - Floor 3",
 *   "remarks": "Starting work"
 * }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Checked in successfully",
 *   "data": {
 *     "id": 1,
 *     "employeeId": 123,
 *     "date": "2026-01-03",
 *     "checkInAt": "2026-01-03T09:15:00.000Z",
 *     "checkOutAt": null,
 *     "status": "PRESENT",
 *     "workHours": 0,
 *     "remarks": "Starting work",
 *     "isLate": true,
 *     "lateByMinutes": 15,
 *     "locationCheckIn": "Office - Floor 3",
 *     "locationCheckOut": null
 *   }
 * }
 */
router.post('/check-in', authMiddleware, checkIn);

/**
 * POST /attendance/check-out
 * Employee checks out for the day
 * Request Body: { location?: string, remarks?: string }
 * Response: { success: boolean, message: string, data: AttendanceResponse }
 * 
 * Example Request:
 * POST /attendance/check-out
 * {
 *   "location": "Office - Floor 3",
 *   "remarks": "Day complete"
 * }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Checked out successfully",
 *   "data": {
 *     "id": 1,
 *     "employeeId": 123,
 *     "date": "2026-01-03",
 *     "checkInAt": "2026-01-03T09:15:00.000Z",
 *     "checkOutAt": "2026-01-03T18:00:00.000Z",
 *     "status": "PRESENT",
 *     "workHours": 8.75,
 *     "remarks": "Starting work | Day complete",
 *     "isLate": true,
 *     "lateByMinutes": 15,
 *     "locationCheckIn": "Office - Floor 3",
 *     "locationCheckOut": "Office - Floor 3"
 *   }
 * }
 */
router.post('/check-out', authMiddleware, checkOut);

/**
 * GET /attendance/me?from=YYYY-MM-DD&to=YYYY-MM-DD&status=PRESENT&page=1&limit=31
 * Get authenticated employee's own attendance records
 * Query Parameters:
 *   - from: Start date (YYYY-MM-DD) - optional
 *   - to: End date (YYYY-MM-DD) - optional
 *   - status: Filter by status - optional
 *   - page: Page number (default: 1) - optional
 *   - limit: Records per page (default: 31) - optional
 * Response: { success: boolean, message: string, data: { records, pagination, summary? } }
 * 
 * Example Request:
 * GET /attendance/me?from=2026-01-01&to=2026-01-31&page=1&limit=10
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Attendance records retrieved successfully",
 *   "data": {
 *     "records": [
 *       {
 *         "id": 1,
 *         "employeeId": 123,
 *         "date": "2026-01-03",
 *         "checkInAt": "2026-01-03T09:15:00.000Z",
 *         "checkOutAt": "2026-01-03T18:00:00.000Z",
 *         "status": "PRESENT",
 *         "workHours": 8.75,
 *         "remarks": null,
 *         "isLate": true,
 *         "lateByMinutes": 15,
 *         "locationCheckIn": "Office",
 *         "locationCheckOut": "Office"
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 10,
 *       "total": 20,
 *       "totalPages": 2
 *     },
 *     "summary": {
 *       "totalDays": 20,
 *       "presentDays": 18,
 *       "absentDays": 0,
 *       "halfDays": 2,
 *       "leaveDays": 0,
 *       "wfhDays": 0,
 *       "totalWorkHours": 156.5,
 *       "averageWorkHours": 8.69
 *     }
 *   }
 * }
 */
router.get('/me', authMiddleware, getMyAttendance);

/**
 * GET /attendance/today
 * Get today's attendance status for authenticated employee
 * Response: { success: boolean, message: string, data: AttendanceResponse | null }
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Today's attendance retrieved successfully",
 *   "data": {
 *     "id": 1,
 *     "employeeId": 123,
 *     "date": "2026-01-03",
 *     "checkInAt": "2026-01-03T09:15:00.000Z",
 *     "checkOutAt": null,
 *     "status": "PRESENT",
 *     "workHours": 0,
 *     "remarks": null,
 *     "isLate": true,
 *     "lateByMinutes": 15,
 *     "locationCheckIn": "Office",
 *     "locationCheckOut": null
 *   }
 * }
 */
router.get('/today', authMiddleware, getTodayAttendance);

// ============================================================================
// ADMIN ROUTES (HR_ADMIN and SUPER_ADMIN only)
// ============================================================================

/**
 * GET /attendance?employeeId=123&from=YYYY-MM-DD&to=YYYY-MM-DD&department=IT&status=PRESENT&page=1&limit=50
 * Get attendance records for all employees (admin only)
 * Query Parameters:
 *   - employeeId: Filter by employee ID - optional
 *   - from: Start date (YYYY-MM-DD) - optional
 *   - to: End date (YYYY-MM-DD) - optional
 *   - department: Filter by department - optional
 *   - status: Filter by status - optional
 *   - page: Page number (default: 1) - optional
 *   - limit: Records per page (default: 50) - optional
 * Response: { success: boolean, message: string, data: { records, pagination, summary? } }
 * 
 * Example Request:
 * GET /attendance?employeeId=123&from=2026-01-01&to=2026-01-31
 * 
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Attendance records retrieved successfully",
 *   "data": {
 *     "records": [
 *       {
 *         "id": 1,
 *         "employeeId": 123,
 *         "date": "2026-01-03",
 *         "checkInAt": "2026-01-03T09:15:00.000Z",
 *         "checkOutAt": "2026-01-03T18:00:00.000Z",
 *         "status": "PRESENT",
 *         "workHours": 8.75,
 *         "remarks": null,
 *         "isLate": true,
 *         "lateByMinutes": 15,
 *         "locationCheckIn": "Office",
 *         "locationCheckOut": "Office",
 *         "employee": {
 *           "id": 123,
 *           "name": "John Doe",
 *           "employeeCode": "EMP001",
 *           "department": "Engineering",
 *           "designation": "Software Engineer"
 *         }
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 50,
 *       "total": 100,
 *       "totalPages": 2
 *     },
 *     "summary": {
 *       "totalDays": 20,
 *       "presentDays": 18,
 *       "absentDays": 0,
 *       "halfDays": 2,
 *       "leaveDays": 0,
 *       "wfhDays": 0,
 *       "totalWorkHours": 156.5,
 *       "averageWorkHours": 8.69
 *     }
 *   }
 * }
 */
router.get(
  '/',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
  getAttendance
);

export default router;
