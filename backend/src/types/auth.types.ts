// User role enum matching database
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HR_ADMIN = 'HR_ADMIN',
  MANAGER = 'MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// User interface matching database schema
export interface User {
  id: string; // UUID
  employee_id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  email_verified: boolean;
  verification_token: string | null;
  reset_token: string | null;
  reset_token_expires_at: Date | null;
  last_login_at: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Public user data (without sensitive fields)
export interface PublicUser {
  id: string;
  employee_id: string;
  email: string;
  role: UserRole;
  email_verified: boolean;
  is_active: boolean;
  created_at: Date;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  employeeId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Auth request bodies
export interface SignupRequest {
  employeeId: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RequestVerificationRequest {
  email: string;
}

// Auth responses
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: PublicUser;
    token: string;
  };
}

// Email verification token
export interface EmailVerificationToken {
  id: number;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  used_at: Date | null;
}

// Express Request with user
export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}
