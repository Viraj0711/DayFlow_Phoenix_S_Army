import crypto from 'crypto';
import { query } from '../config/database';
import { User, PublicUser, EmailVerificationToken } from '../types/auth.types';

/**
 * Create a new user
 */
export async function createUser(
  employeeId: string,
  email: string,
  passwordHash: string,
  role: string = 'EMPLOYEE'
): Promise<User> {
  const sql = `
    INSERT INTO users (employee_id, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await query<User>(sql, [employeeId, email, passwordHash, role]);
  if (!result.rows[0]) {
    throw new Error('Failed to create user');
  }
  return result.rows[0];
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT * FROM users
    WHERE email = $1
  `;
  
  const result = await query<User>(sql, [email]);
  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string): Promise<User | null> {
  const sql = `
    SELECT * FROM users
    WHERE id = $1
  `;
  
  const result = await query<User>(sql, [userId]);
  return result.rows[0] || null;
}

/**
 * Find user by employee ID
 */
export async function findUserByEmployeeId(employeeId: string): Promise<User | null> {
  const sql = `
    SELECT * FROM users
    WHERE employee_id = $1
  `;
  
  const result = await query<User>(sql, [employeeId]);
  return result.rows[0] || null;
}

/**
 * Update user's last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const sql = `
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = $1
  `;
  
  await query(sql, [userId]);
}

/**
 * Mark email as verified
 */
export async function markEmailVerified(userId: string): Promise<void> {
  const sql = `
    UPDATE users
    SET email_verified = true, verification_token = NULL
    WHERE id = $1
  `;
  
  await query(sql, [userId]);
}

/**
 * Create email verification token
 */
export async function createVerificationToken(userId: string): Promise<EmailVerificationToken> {
  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Token expires in 24 hours (configurable)
  const expiresHours = parseInt(process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || '24');
  
  const sql = `
    INSERT INTO email_verification_tokens (user_id, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '${expiresHours} hours')
    RETURNING *
  `;
  
  const result = await query<EmailVerificationToken>(sql, [userId, token]);
  if (!result.rows[0]) {
    throw new Error('Failed to create verification token');
  }
  return result.rows[0];
}

/**
 * Find verification token
 */
export async function findVerificationToken(token: string): Promise<EmailVerificationToken | null> {
  const sql = `
    SELECT * FROM email_verification_tokens
    WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
  `;
  
  const result = await query<EmailVerificationToken>(sql, [token]);
  return result.rows[0] || null;
}

/**
 * Mark verification token as used
 */
export async function markTokenUsed(token: string): Promise<void> {
  const sql = `
    UPDATE email_verification_tokens
    SET used_at = NOW()
    WHERE token = $1
  `;
  
  await query(sql, [token]);
}

/**
 * Delete old verification tokens for a user
 */
export async function deleteOldVerificationTokens(userId: string): Promise<void> {
  const sql = `
    DELETE FROM email_verification_tokens
    WHERE user_id = $1
  `;
  
  await query(sql, [userId]);
}

/**
 * Convert User to PublicUser (remove sensitive fields)
 */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    employee_id: user.employee_id,
    email: user.email,
    role: user.role,
    email_verified: user.email_verified,
    is_active: user.is_active,
    created_at: user.created_at,
  };
}
