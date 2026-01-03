import { Router } from 'express';
import {
  signup,
  login,
  requestVerification,
  verifyEmail,
  getCurrentUser,
} from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types/auth.types';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// POST /auth/signup - Register new user
router.post('/signup', signup);

// POST /auth/login - User login
router.post('/login', login);

// POST /auth/request-verification - Request email verification
router.post('/request-verification', requestVerification);

// GET /auth/verify-email?token=xxx - Verify email with token
router.get('/verify-email', verifyEmail);

/**
 * Protected routes (authentication required)
 */

// GET /auth/me - Get current user profile
router.get('/me', authMiddleware, getCurrentUser);

/**
 * Example: Admin-only route
 */
// router.get(
//   '/admin/users',
//   authMiddleware,
//   requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
//   getAllUsers
// );

export default router;
