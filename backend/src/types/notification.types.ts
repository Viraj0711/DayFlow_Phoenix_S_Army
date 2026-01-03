/**
 * Notification Module Type Definitions
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum NotificationType {
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  ATTENDANCE_ALERT = 'ATTENDANCE_ALERT',
  PAYROLL_GENERATED = 'PAYROLL_GENERATED',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
}

// ============================================================================
// DATABASE ROW INTERFACES
// ============================================================================

/**
 * Notification from database
 */
export interface Notification {
  id: number;
  user_id: string; // UUID
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, any>;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * Query parameters for notifications
 */
export interface NotificationQueryParams {
  type?: NotificationType;
  isRead?: string; // 'true' or 'false'
  page?: string;
  limit?: string;
}

/**
 * Create notification input
 */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, any>;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Notification response
 */
export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, any>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/**
 * Notification list response
 */
export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationResponse[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Single notification response
 */
export interface SingleNotificationResponse {
  success: boolean;
  message: string;
  data: NotificationResponse;
}

/**
 * Mark as read response
 */
export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}
