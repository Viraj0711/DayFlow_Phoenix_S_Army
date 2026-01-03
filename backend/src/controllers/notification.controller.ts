/**
 * Notification Controller
 * HTTP request handlers for notification endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import logger from '../utils/logger';

/**
 * GET /api/notifications
 * Get notifications for logged-in user
 */
export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const unreadOnly = req.query.unreadOnly === 'true';
    const type = req.query.type as string | undefined;

    const result = await notificationService.getNotifications(userId, {
      page,
      limit,
      isRead: unreadOnly ? false : undefined,
      type: type as any,
    });

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
      message: 'Notifications fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
export async function markAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notificationId = parseInt(req.params.id || '0');
    const userId = req.user!.userId;

    await notificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    next(error);
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export async function markAllAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    next(error);
  }
}

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = parseInt(req.user!.userId);

    const countQuery = `
      SELECT COUNT(*)::int as unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;

    const db = require('../db/pool').default;
    const result = await db.query(countQuery, [userId]);
    const unreadCount = result.rows[0]?.unread_count || 0;

    res.json({
      success: true,
      data: { unreadCount },
      message: 'Unread count fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    next(error);
  }
}
