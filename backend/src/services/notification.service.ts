/**
 * Notification Service
 * Business logic for notifications with raw SQL
 */

import db from '../db/pool';
import logger from '../utils/logger';
import {
  Notification,
  CreateNotificationInput,
  NotificationType,
} from '../types/notification.types';

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  filters: {
    type?: NotificationType;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
  const { type, isRead, page = 1, limit = 20 } = filters;

  const conditions: string[] = ['user_id = $1'];
  const values: any[] = [userId];
  let paramCount = 2;

  if (type) {
    conditions.push(`type = $${paramCount}`);
    values.push(type);
    paramCount++;
  }

  if (isRead !== undefined) {
    conditions.push(`is_read = $${paramCount}`);
    values.push(isRead);
    paramCount++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM notifications
    WHERE ${whereClause}
  `;

  const countResult = await db.query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Get unread count
  const unreadQuery = `
    SELECT COUNT(*) as unread
    FROM notifications
    WHERE user_id = $1 AND is_read = FALSE
  `;

  const unreadResult = await db.query<{ unread: string }>(unreadQuery, [userId]);
  const unreadCount = parseInt(unreadResult.rows[0]?.unread || '0', 10);

  // Get paginated notifications
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT 
      id, user_id, type, title, message, payload,
      is_read, read_at, created_at
    FROM notifications
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);

  const dataResult = await db.query<Notification>(dataQuery, values);

  return {
    notifications: dataResult.rows,
    total,
    unreadCount,
  };
}

/**
 * Get notification by ID
 */
export async function getNotificationById(
  id: number,
  userId: string
): Promise<Notification | null> {
  const query = `
    SELECT 
      id, user_id, type, title, message, payload,
      is_read, read_at, created_at
    FROM notifications
    WHERE id = $1 AND user_id = $2
  `;

  const result = await db.query<Notification>(query, [id, userId]);
  return result.rows[0] || null;
}

// ============================================================================
// MARK AS READ
// ============================================================================

/**
 * Mark notification as read
 */
export async function markAsRead(
  id: number,
  userId: string
): Promise<boolean> {
  const query = `
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE id = $1 AND user_id = $2 AND is_read = FALSE
  `;

  const result = await db.query(query, [id, userId]);
  return (result.rowCount || 0) > 0;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  const query = `
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = $1 AND is_read = FALSE
  `;

  const result = await db.query(query, [userId]);
  return result.rowCount || 0;
}

// ============================================================================
// CREATE NOTIFICATION
// ============================================================================

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const { userId, type, title, message, payload = {} } = input;

  const query = `
    INSERT INTO notifications (user_id, type, title, message, payload)
    VALUES ($1, $2, $3, $4, $5::jsonb)
    RETURNING 
      id, user_id, type, title, message, payload,
      is_read, read_at, created_at
  `;

  const result = await db.query<Notification>(query, [
    userId,
    type,
    title,
    message,
    JSON.stringify(payload),
  ]);

  if (!result.rows[0]) {
    throw new Error('Failed to create notification');
  }

  logger.info('Notification created', {
    userId,
    type,
    notificationId: result.rows[0].id,
  });

  return result.rows[0];
}

/**
 * Create multiple notifications (bulk)
 */
export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<Notification[]> {
  if (inputs.length === 0) {
    return [];
  }

  const values: any[] = [];
  const valuePlaceholders: string[] = [];
  let paramCount = 1;

  inputs.forEach((input) => {
    valuePlaceholders.push(
      `($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${paramCount + 4}::jsonb)`
    );
    values.push(
      input.userId,
      input.type,
      input.title,
      input.message,
      JSON.stringify(input.payload || {})
    );
    paramCount += 5;
  });

  const query = `
    INSERT INTO notifications (user_id, type, title, message, payload)
    VALUES ${valuePlaceholders.join(', ')}
    RETURNING 
      id, user_id, type, title, message, payload,
      is_read, read_at, created_at
  `;

  const result = await db.query<Notification>(query, values);

  logger.info('Bulk notifications created', { count: result.rows.length });

  return result.rows;
}

// ============================================================================
// HELPER FUNCTIONS FOR COMMON NOTIFICATIONS
// ============================================================================

/**
 * Notify about leave request
 */
export async function notifyLeaveRequest(
  managerId: string,
  employeeName: string,
  leaveId: number,
  leaveType: string,
  startDate: string,
  endDate: string
): Promise<Notification> {
  return createNotification({
    userId: managerId,
    type: NotificationType.LEAVE_REQUEST,
    title: 'New Leave Request',
    message: `${employeeName} has requested ${leaveType} leave from ${startDate} to ${endDate}`,
    payload: {
      leave_id: leaveId,
      employee_name: employeeName,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
    },
  });
}

/**
 * Notify about leave approval
 */
export async function notifyLeaveApproval(
  employeeUserId: string,
  leaveId: number,
  leaveType: string,
  approverName: string
): Promise<Notification> {
  return createNotification({
    userId: employeeUserId,
    type: NotificationType.LEAVE_APPROVED,
    title: 'Leave Request Approved',
    message: `Your ${leaveType} leave request has been approved by ${approverName}`,
    payload: {
      leave_id: leaveId,
      leave_type: leaveType,
      approver_name: approverName,
    },
  });
}

/**
 * Notify about leave rejection
 */
export async function notifyLeaveRejection(
  employeeUserId: string,
  leaveId: number,
  leaveType: string,
  approverName: string,
  reason?: string
): Promise<Notification> {
  return createNotification({
    userId: employeeUserId,
    type: NotificationType.LEAVE_REJECTED,
    title: 'Leave Request Rejected',
    message: `Your ${leaveType} leave request has been rejected by ${approverName}${reason ? `: ${reason}` : ''}`,
    payload: {
      leave_id: leaveId,
      leave_type: leaveType,
      approver_name: approverName,
      reason,
    },
  });
}

/**
 * Notify about payroll generation
 */
export async function notifyPayrollGenerated(
  employeeUserId: string,
  month: number,
  year: number,
  netSalary: number
): Promise<Notification> {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return createNotification({
    userId: employeeUserId,
    type: NotificationType.PAYROLL_GENERATED,
    title: 'Payroll Generated',
    message: `Your salary for ${monthNames[month - 1]} ${year} has been processed. Net salary: ₹${netSalary.toFixed(2)}`,
    payload: {
      month,
      year,
      net_salary: netSalary,
    },
  });
}

/**
 * Notify about attendance alert
 */
export async function notifyAttendanceAlert(
  employeeUserId: string,
  alertType: string,
  message: string
): Promise<Notification> {
  return createNotification({
    userId: employeeUserId,
    type: NotificationType.ATTENDANCE_ALERT,
    title: 'Attendance Alert',
    message,
    payload: {
      alert_type: alertType,
    },
  });
}

/**
 * Delete old notifications (cleanup)
 */
export async function deleteOldNotifications(daysOld: number = 90): Promise<number> {
  const query = `
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      AND is_read = TRUE
  `;

  const result = await db.query(query);
  const deletedCount = result.rowCount || 0;

  logger.info('Old notifications deleted', { count: deletedCount, daysOld });

  return deletedCount;
}
