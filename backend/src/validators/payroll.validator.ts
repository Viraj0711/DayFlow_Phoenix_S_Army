import { z } from 'zod';
import { PayrollStatus } from '../types';

/**
 * Payroll Validation Schemas
 */

// Create payroll schema
export const createPayrollSchema = z.object({
  body: z.object({
    employee_id: z.string().uuid('Invalid employee ID'),
    month: z
      .number()
      .int('Month must be an integer')
      .min(1, 'Month must be between 1 and 12')
      .max(12, 'Month must be between 1 and 12'),
    year: z
      .number()
      .int('Year must be an integer')
      .min(2000, 'Year must be 2000 or later')
      .max(2100, 'Year must be 2100 or earlier'),
    basic_salary: z
      .number()
      .positive('Basic salary must be positive'),
    allowances: z
      .number()
      .nonnegative('Allowances cannot be negative')
      .default(0),
    deductions: z
      .number()
      .nonnegative('Deductions cannot be negative')
      .default(0),
    overtime_hours: z
      .number()
      .nonnegative('Overtime hours cannot be negative')
      .default(0),
    overtime_pay: z
      .number()
      .nonnegative('Overtime pay cannot be negative')
      .default(0),
    bonus: z
      .number()
      .nonnegative('Bonus cannot be negative')
      .default(0),
    tax: z
      .number()
      .nonnegative('Tax cannot be negative')
      .default(0),
    net_salary: z
      .number()
      .positive('Net salary must be positive'),
    payment_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
      .optional(),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
  }),
});

// Update payroll schema
export const updatePayrollSchema = z.object({
  body: z.object({
    basic_salary: z.number().positive().optional(),
    allowances: z.number().nonnegative().optional(),
    deductions: z.number().nonnegative().optional(),
    overtime_hours: z.number().nonnegative().optional(),
    overtime_pay: z.number().nonnegative().optional(),
    bonus: z.number().nonnegative().optional(),
    tax: z.number().nonnegative().optional(),
    net_salary: z.number().positive().optional(),
    status: z.nativeEnum(PayrollStatus).optional(),
    payment_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
      .optional()
      .nullable(),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional()
      .nullable(),
  }),
});

// Process payroll (change status)
export const processPayrollSchema = z.object({
  body: z.object({
    payment_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
  }),
});

// Payroll list filters
export const payrollListFiltersSchema = z.object({
  query: z.object({
    employee_id: z.string().uuid().optional(),
    month: z.string().regex(/^\d+$/).transform(Number).optional(),
    year: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.nativeEnum(PayrollStatus).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

/**
 * TypeScript type inference
 */
export type CreatePayrollInput = z.infer<typeof createPayrollSchema>['body'];
export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>['body'];
export type ProcessPayrollInput = z.infer<typeof processPayrollSchema>['body'];
export type PayrollListFilters = z.infer<typeof payrollListFiltersSchema>['query'];
