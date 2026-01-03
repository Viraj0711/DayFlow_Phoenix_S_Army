import { z } from 'zod';

/**
 * Schema for creating leave request
 */
export const createLeaveRequestSchema = z.object({
  body: z.object({
    leave_type_id: z.string().uuid(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
    document_url: z.string().url().nullable().optional(),
  }),
});

/**
 * Schema for approving leave request
 */
export const approveLeaveRequestSchema = z.object({
  body: z.object({
    approver_comment: z.string().max(500).optional(),
  }),
});

/**
 * Schema for rejecting leave request
 */
export const rejectLeaveRequestSchema = z.object({
  body: z.object({
    approver_comment: z.string().min(10, 'Rejection comment is required (min 10 characters)').max(500),
  }),
});
