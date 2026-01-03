import { z } from 'zod';
import { AttendanceStatus } from '../types';

/**
 * Attendance Validation Schemas
 */

// Check-in schema
export const checkInSchema = z.object({
  body: z.object({
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional(),
    location: z
      .string()
      .max(255, 'Location must not exceed 255 characters')
      .optional(),
  }),
});

// Check-out schema
export const checkOutSchema = z.object({
  body: z.object({
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional(),
  }),
});

// Manual attendance entry (Admin/HR)
export const createAttendanceSchema = z.object({
  body: z.object({
    employee_id: z.string().uuid('Invalid employee ID'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    check_in_time: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)'),
    check_out_time: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)')
      .optional(),
    status: z.nativeEnum(AttendanceStatus).optional(),
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional(),
  }),
});

// Update attendance (Admin/HR)
export const updateAttendanceSchema = z.object({
  body: z.object({
    check_in_time: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)')
      .optional(),
    check_out_time: z
      .string()
      .regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)')
      .optional()
      .nullable(),
    status: z.nativeEnum(AttendanceStatus).optional(),
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional()
      .nullable(),
  }),
});

// Query filters for attendance list
export const attendanceListFiltersSchema = z.object({
  query: z.object({
    employee_id: z.string().uuid().optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    status: z.nativeEnum(AttendanceStatus).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

/**
 * TypeScript type inference
 */
export type CheckInInput = z.infer<typeof checkInSchema>['body'];
export type CheckOutInput = z.infer<typeof checkOutSchema>['body'];
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>['body'];
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>['body'];
export type AttendanceListFilters = z.infer<typeof attendanceListFiltersSchema>['query'];
