import { Request, Response } from 'express';
import {
  createUser,
  findUserByEmail,
  findUserByEmployeeId,
  updateLastLogin,
  toPublicUser,
  createVerificationToken,
  findVerificationToken,
  markEmailVerified,
  markTokenUsed,
  deleteOldVerificationTokens,
} from '../repositories/user.repository';
import { validatePassword, hashPassword, comparePassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/email.service';
import { SignupRequest, LoginRequest, UserRole } from '../types/auth.types';

/**
 * POST /auth/signup
 * Register a new user
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { employeeId, email, password, role }: SignupRequest = req.body;

    // Validate required fields
    if (!employeeId || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Employee ID, email, and password are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
      });
      return;
    }

    // Validate role (if provided)
    const userRole = role || UserRole.EMPLOYEE;
    if (!Object.values(UserRole).includes(userRole)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be EMPLOYEE or HR_ADMIN',
      });
      return;
    }

    // Check if email already exists
    const existingEmail = await findUserByEmail(email.toLowerCase());
    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Check if employee ID already exists
    const existingEmployeeId = await findUserByEmployeeId(employeeId);
    if (existingEmployeeId) {
      res.status(409).json({
        success: false,
        message: 'Employee ID already registered',
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(
      employeeId,
      email.toLowerCase(),
      passwordHash,
      userRole
    );

    // Create verification token
    const verificationToken = await createVerificationToken(user.id);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken.token, user.employee_id);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Continue even if email fails
    }

    // Return success response (without token, user needs to verify email first)
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: toPublicUser(user),
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * POST /auth/login
 * User login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact HR.',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if email is verified (skip in development mode)
    if (!user.email_verified && process.env.NODE_ENV !== 'development') {
      res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.',
      });
      return;
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      employeeId: user.employee_id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: toPublicUser(user),
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * POST /auth/request-verification
 * Request a new verification email
 */
export async function requestVerification(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    // Find user
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      // Don't reveal if email exists
      res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a verification link.',
      });
      return;
    }

    // Check if already verified
    if (user.email_verified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
      return;
    }

    // Delete old tokens
    await deleteOldVerificationTokens(user.id);

    // Create new verification token
    const verificationToken = await createVerificationToken(user.id);

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken.token, user.employee_id);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error: any) {
    console.error('Request verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * GET /auth/verify-email?token=xxx
 * Verify email with token
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
      return;
    }

    // Find verification token
    const verificationToken = await findVerificationToken(token);
    if (!verificationToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
      return;
    }

    // Mark email as verified
    await markEmailVerified(verificationToken.user_id);

    // Mark token as used
    await markTokenUsed(token);

    // Send welcome email
    const user = await findUserByEmail(
      (await findUserByEmail(''))?.email || '' // This is just to get the email
    );
    if (user) {
      try {
        await sendWelcomeEmail(user.email, user.employee_id);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.',
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * GET /auth/me
 * Get current user profile (protected route example)
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const user = await findUserByEmail(req.user.email);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: toPublicUser(user),
      },
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
