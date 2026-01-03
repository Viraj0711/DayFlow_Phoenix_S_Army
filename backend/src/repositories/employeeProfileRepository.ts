import { query, queryOne } from '../db';
import { EmploymentStatus } from '../types';
import {
  EmployeeProfileDTO,
  EmployeeListItemDTO,
  EmployeeListFilters,
} from '../types/employee.types';

/**
 * Extended employee profile with all details (joins users table)
 */
export interface EmployeeProfileRow {
  // Employee fields
  id: string;
  user_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: Date;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  department: string;
  designation: string;
  hire_date: Date;
  employment_status: EmploymentStatus;
  manager_id: string | null;
  profile_picture: string | null;
  basic_salary: number | null;
  created_at: Date;
  updated_at: Date;
  
  // User fields (from join)
  email: string;
  role: string;
  
  // Manager fields (from join)
  manager_first_name: string | null;
  manager_last_name: string | null;
}

/**
 * Get employee full profile by user ID (for /employees/me)
 */
export async function getEmployeeProfileByUserId(
  userId: string
): Promise<EmployeeProfileRow | null> {
  const sql = `
    SELECT 
      e.id, e.user_id, e.employee_code, e.first_name, e.last_name, e.phone,
      e.date_of_birth, e.gender, e.address, e.city, e.state, e.country, 
      e.postal_code, e.department, e.designation, e.hire_date, 
      e.employment_status, e.manager_id, e.profile_picture, e.basic_salary,
      e.created_at, e.updated_at,
      u.email, u.role,
      m.first_name as manager_first_name,
      m.last_name as manager_last_name
    FROM employees e
    INNER JOIN users u ON e.user_id = u.id
    LEFT JOIN employees m ON e.manager_id = m.id
    WHERE e.user_id = $1
  `;
  
  return queryOne<EmployeeProfileRow>(sql, [userId]);
}

/**
 * Get employee full profile by employee ID
 */
export async function getEmployeeProfileById(
  employeeId: string
): Promise<EmployeeProfileRow | null> {
  const sql = `
    SELECT 
      e.id, e.user_id, e.employee_code, e.first_name, e.last_name, e.phone,
      e.date_of_birth, e.gender, e.address, e.city, e.state, e.country, 
      e.postal_code, e.department, e.designation, e.hire_date, 
      e.employment_status, e.manager_id, e.profile_picture, e.basic_salary,
      e.created_at, e.updated_at,
      u.email, u.role,
      m.first_name as manager_first_name,
      m.last_name as manager_last_name
    FROM employees e
    INNER JOIN users u ON e.user_id = u.id
    LEFT JOIN employees m ON e.manager_id = m.id
    WHERE e.id = $1
  `;
  
  return queryOne<EmployeeProfileRow>(sql, [employeeId]);
}

/**
 * List employees with filters and pagination (with joins)
 */
export async function listEmployeesWithDetails(
  filters: EmployeeListFilters
): Promise<EmployeeListItemDTO[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.department) {
    conditions.push(`e.department = $${paramCount++}`);
    values.push(filters.department);
  }

  if (filters.designation) {
    conditions.push(`e.designation = $${paramCount++}`);
    values.push(filters.designation);
  }

  if (filters.employment_status) {
    conditions.push(`e.employment_status = $${paramCount++}`);
    values.push(filters.employment_status);
  }

  if (filters.search) {
    conditions.push(`(
      e.first_name ILIKE $${paramCount} OR 
      e.last_name ILIKE $${paramCount} OR 
      e.employee_code ILIKE $${paramCount} OR 
      u.email ILIKE $${paramCount}
    )`);
    values.push(`%${filters.search}%`);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      e.id, e.employee_code, e.first_name, e.last_name, e.phone,
      e.department, e.designation, e.employment_status, e.hire_date,
      e.profile_picture, u.email
    FROM employees e
    INNER JOIN users u ON e.user_id = u.id
    ${whereClause}
    ORDER BY e.created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<EmployeeListItemDTO>(sql, values);
}

/**
 * Count employees with filters
 */
export async function countEmployeesWithFilters(
  filters: EmployeeListFilters
): Promise<number> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.department) {
    conditions.push(`e.department = $${paramCount++}`);
    values.push(filters.department);
  }

  if (filters.designation) {
    conditions.push(`e.designation = $${paramCount++}`);
    values.push(filters.designation);
  }

  if (filters.employment_status) {
    conditions.push(`e.employment_status = $${paramCount++}`);
    values.push(filters.employment_status);
  }

  if (filters.search) {
    conditions.push(`(
      e.first_name ILIKE $${paramCount} OR 
      e.last_name ILIKE $${paramCount} OR 
      e.employee_code ILIKE $${paramCount} OR 
      u.email ILIKE $${paramCount}
    )`);
    values.push(`%${filters.search}%`);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT COUNT(*)::int as count 
    FROM employees e
    INNER JOIN users u ON e.user_id = u.id
    ${whereClause}
  `;

  const result = await queryOne<{ count: number }>(sql, values);
  return result?.count || 0;
}

/**
 * Update employee limited fields (for self-update)
 */
export async function updateEmployeeSelfFields(
  employeeId: string,
  updates: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    profile_picture?: string | null;
  }
): Promise<EmployeeProfileRow | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Only allow specific fields for self-update
  const allowedFields = ['phone', 'address', 'city', 'state', 'country', 'postal_code', 'profile_picture'];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return getEmployeeProfileById(employeeId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(employeeId);

  const sql = `
    UPDATE employees
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id
  `;

  const result = await queryOne<{ id: string }>(sql, values);
  
  if (!result) {
    return null;
  }

  return getEmployeeProfileById(result.id);
}
