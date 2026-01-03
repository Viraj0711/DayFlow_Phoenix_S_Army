/**
 * Notification Routes
 * API endpoints for notification management
 */

import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * All routes require authentication
 */

// GET /api/notifications - Get my notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read - Mark specific notification as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

export default router;
