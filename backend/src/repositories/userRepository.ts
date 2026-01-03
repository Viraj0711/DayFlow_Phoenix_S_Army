import { query, queryOne, execute } from '../db';
import { UserRole } from '../types';

/**
 * User row interface matching database schema
 */
export interface UserRow {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  is_verified: boolean;
  verification_token: string | null;
  reset_token: string | null;
  reset_token_expiry: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * User creation input
 */
export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  verification_token?: string;
}

/**
 * User update input
 */
export interface UpdateUserInput {
  email?: string;
  password?: string;
  role?: UserRole;
  is_verified?: boolean;
  verification_token?: string | null;
  reset_token?: string | null;
  reset_token_expiry?: Date | null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<UserRow | null> {
  const sql = `
    SELECT 
      id, email, password, role, is_verified, 
      verification_token, reset_token, reset_token_expiry,
      created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  return queryOne<UserRow>(sql, [id]);
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const sql = `
    SELECT 
      id, email, password, role, is_verified, 
      verification_token, reset_token, reset_token_expiry,
      created_at, updated_at
    FROM users
    WHERE email = $1
  `;
  return queryOne<UserRow>(sql, [email]);
}

/**
 * Find user by verification token
 */
export async function findUserByVerificationToken(
  token: string
): Promise<UserRow | null> {
  const sql = `
    SELECT 
      id, email, password, role, is_verified, 
      verification_token, reset_token, reset_token_expiry,
      created_at, updated_at
    FROM users
    WHERE verification_token = $1
  `;
  return queryOne<UserRow>(sql, [token]);
}

/**
 * Find user by reset token
 */
export async function findUserByResetToken(
  token: string
): Promise<UserRow | null> {
  const sql = `
    SELECT 
      id, email, password, role, is_verified, 
      verification_token, reset_token, reset_token_expiry,
      created_at, updated_at
    FROM users
    WHERE reset_token = $1
      AND reset_token_expiry > NOW()
  `;
  return queryOne<UserRow>(sql, [token]);
}

/**
 * Create a new user
 */
export async function createUser(
  input: CreateUserInput
): Promise<UserRow> {
  const sql = `
    INSERT INTO users (email, password, role, verification_token)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id, email, password, role, is_verified, 
      verification_token, reset_token, reset_token_expiry,
      created_at, updated_at
  `;
  const result = await queryOne<UserRow>(sql, [
    input.email,
    input.password,
    input.role,
    input.verification_token || null,
  ]);
  
  if (!result) {
    throw new Error('Failed to create user');
  }
  
  return result;
}

/**
 * Update user by ID
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<UserRow | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.email !== undefined) {
    fields.push(`email = $${paramCount++}`);
    values.push(input.email);
  }
  if (input.password !== undefined) {
    fields.push(`password = $${paramCount++}`);
    values.push(input.password);
  }
  if (input.role !== undefined) {
    fields.push(`role = $${paramCount++}`);
    values.push(input.role);
  }
  if (input.is_verified !== undefined) {
    fields.push(`is_verified = $${paramCount++}`);
    values.push(input.is_verified);
  }
  if (input.verification_token !== undefined) {
    fields.push(`verification_token = $${paramCount++}`);
    values.push(input.verification_token);
  }
  if (input.reset_token !== undefined) {
    fields.push(`reset_token = $${paramCount++}`);
    values.push(input.reset_token);
  }
  if (input.reset_token_expiry !== undefined) {
    fields.push(`reset_token_expiry = $${paramCount++}`);
    values.push(input.reset_token_expiry);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING 
      id, email, password, role, is_verified, 
      verification_token, reset_token, reset_token_expiry,
      created_at, updated_at
  `;

  return queryOne<UserRow>(sql, values);
}

/**
 * Delete user by ID
 */
export async function deleteUser(id: string): Promise<boolean> {
  const sql = `DELETE FROM users WHERE id = $1`;
  const rowCount = await execute(sql, [id]);
  return rowCount > 0;
}

/**
 * List all users with optional filtering
 */
export async function listUsers(filters?: {
  role?: UserRole;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<UserRow[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.role) {
    conditions.push(`role = $${paramCount++}`);
    values.push(filters.role);
  }

  if (filters?.is_verified !== undefined) {
    conditions.push(`is_verified = $${paramCount++}`);
    values.push(filters.is_verified);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const sql = `
    SELECT 
      id, email, password, role, is_verified, 
      verification_token, reset_token, reset_token_expiry,
      created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<UserRow>(sql, values);
}

/**
 * Count users with optional filtering
 */
export async function countUsers(filters?: {
  role?: UserRole;
  is_verified?: boolean;
}): Promise<number> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.role) {
    conditions.push(`role = $${paramCount++}`);
    values.push(filters.role);
  }

  if (filters?.is_verified !== undefined) {
    conditions.push(`is_verified = $${paramCount++}`);
    values.push(filters.is_verified);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*)::int as count FROM users ${whereClause}`;
  const result = await queryOne<{ count: number }>(sql, values);
  return result?.count || 0;
}
