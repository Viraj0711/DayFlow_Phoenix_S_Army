import { query, queryOne, execute } from '../db';
import { EmploymentStatus } from '../types';

/**
 * Employee row interface matching database schema
 */
export interface EmployeeRow {
  id: string;
  user_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: Date;
  gender: string;
  profile_picture: string | null;
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
  basic_salary: number | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Employee with user data
 */
export interface EmployeeWithUser extends EmployeeRow {
  email: string;
  role: string;
}

/**
 * Employee creation input
 */
export interface CreateEmployeeInput {
  user_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: Date;
  gender: string;
  profile_picture?: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  department: string;
  designation: string;
  hire_date: Date;
  employment_status: EmploymentStatus;
  manager_id?: string | null;
  basic_salary?: number | null;
}

/**
 * Employee update input
 */
export interface UpdateEmployeeInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  department?: string;
  designation?: string;
  employment_status?: EmploymentStatus;
  manager_id?: string | null;
}

/**
 * Find employee by employee code
 */
export async function findEmployeeByCode(
  employeeCode: string
): Promise<EmployeeRow | null> {
  const sql = `
    SELECT 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, profile_picture, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id, basic_salary,
      created_at, updated_at
    FROM employees
    WHERE employee_code = $1
  `;
  
  return queryOne<EmployeeRow>(sql, [employeeCode]);
}

/**
 * Find employee by ID
 */
export async function findEmployeeById(
  id: string
): Promise<EmployeeRow | null> {
  const sql = `
    SELECT 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id,
      created_at, updated_at
    FROM employees
    WHERE id = $1
  `;
  return queryOne<EmployeeRow>(sql, [id]);
}

/**
 * Find employee by user ID
 */
export async function findEmployeeByUserId(
  userId: string
): Promise<EmployeeRow | null> {
  const sql = `
    SELECT 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id,
      created_at, updated_at
    FROM employees
    WHERE user_id = $1
  `;
  return queryOne<EmployeeRow>(sql, [userId]);
}

/**
 * Find employee by employee code
 */
export async function findEmployeeByCode(
  code: string
): Promise<EmployeeRow | null> {
  const sql = `
    SELECT 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id,
      created_at, updated_at
    FROM employees
    WHERE employee_code = $1
  `;
  return queryOne<EmployeeRow>(sql, [code]);
}

/**
 * Find employee with user details
 */
export async function findEmployeeWithUser(
  id: string
): Promise<EmployeeWithUser | null> {
  const sql = `
    SELECT 
      e.id, e.user_id, e.employee_code, e.first_name, e.last_name, e.phone,
      e.date_of_birth, e.gender, e.address, e.city, e.state, e.country, 
      e.postal_code, e.department, e.designation, e.hire_date, 
      e.employment_status, e.manager_id, e.created_at, e.updated_at,
      u.email, u.role
    FROM employees e
    INNER JOIN users u ON e.user_id = u.id
    WHERE e.id = $1
  `;
  return queryOne<EmployeeWithUser>(sql, [id]);
}

/**
 * Create a new employee
 */
export async function createEmployee(
  input: CreateEmployeeInput
): Promise<EmployeeRow> {
  const sql = `
    INSERT INTO employees (
      user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, profile_picture, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id, basic_salary
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, profile_picture, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id, basic_salary,
      created_at, updated_at
  `;
  
  const result = await queryOne<EmployeeRow>(sql, [
    input.user_id,
    input.employee_code,
    input.first_name,
    input.last_name,
    input.phone,
    input.date_of_birth,
    input.gender,
    input.profile_picture || null,
    input.address,
    input.city,
    input.state,
    input.country,
    input.postal_code,
    input.department,
    input.designation,
    input.hire_date,
    input.employment_status,
    input.manager_id || null,
    input.basic_salary,
  ]);

  if (!result) {
    throw new Error('Failed to create employee');
  }

  return result;
}

/**
 * Update employee by ID
 */
export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput
): Promise<EmployeeRow | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (input.first_name !== undefined) {
    fields.push(`first_name = $${paramCount++}`);
    values.push(input.first_name);
  }
  if (input.last_name !== undefined) {
    fields.push(`last_name = $${paramCount++}`);
    values.push(input.last_name);
  }
  if (input.phone !== undefined) {
    fields.push(`phone = $${paramCount++}`);
    values.push(input.phone);
  }
  if (input.date_of_birth !== undefined) {
    fields.push(`date_of_birth = $${paramCount++}`);
    values.push(input.date_of_birth);
  }
  if (input.gender !== undefined) {
    fields.push(`gender = $${paramCount++}`);
    values.push(input.gender);
  }
  if (input.address !== undefined) {
    fields.push(`address = $${paramCount++}`);
    values.push(input.address);
  }
  if (input.city !== undefined) {
    fields.push(`city = $${paramCount++}`);
    values.push(input.city);
  }
  if (input.state !== undefined) {
    fields.push(`state = $${paramCount++}`);
    values.push(input.state);
  }
  if (input.country !== undefined) {
    fields.push(`country = $${paramCount++}`);
    values.push(input.country);
  }
  if (input.postal_code !== undefined) {
    fields.push(`postal_code = $${paramCount++}`);
    values.push(input.postal_code);
  }
  if (input.department !== undefined) {
    fields.push(`department = $${paramCount++}`);
    values.push(input.department);
  }
  if (input.designation !== undefined) {
    fields.push(`designation = $${paramCount++}`);
    values.push(input.designation);
  }
  if (input.employment_status !== undefined) {
    fields.push(`employment_status = $${paramCount++}`);
    values.push(input.employment_status);
  }
  if (input.manager_id !== undefined) {
    fields.push(`manager_id = $${paramCount++}`);
    values.push(input.manager_id);
  }

  if (fields.length === 0) {
    return findEmployeeById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE employees
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id,
      created_at, updated_at
  `;

  return queryOne<EmployeeRow>(sql, values);
}

/**
 * Soft delete employee by ID (sets status to TERMINATED)
 * This prevents data loss and maintains referential integrity
 */
export async function deleteEmployee(id: string): Promise<boolean> {
  // Soft delete by updating employment status instead of hard delete
  const sql = `
    UPDATE employees 
    SET employment_status = 'TERMINATED', 
        updated_at = NOW()
    WHERE id = $1 
      AND employment_status != 'TERMINATED'
    RETURNING id
  `;
  const result = await queryOne<{ id: string }>(sql, [id]);
  return result !== null;
}

/**
 * Permanently delete employee (USE WITH CAUTION)
 * Should only be used for GDPR compliance or data cleanup
 */
export async function permanentlyDeleteEmployee(id: string): Promise<boolean> {
  // First check if employee has any related records
  const hasRelatedRecords = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM (
      SELECT 1 FROM attendance WHERE employee_id = $1
      UNION ALL
      SELECT 1 FROM leave_requests WHERE employee_id = $1
      UNION ALL
      SELECT 1 FROM employee_leave_balances WHERE employee_id = $1
    ) AS related`,
    [id]
  );
  
  if (hasRelatedRecords && hasRelatedRecords.count > 0) {
    throw new Error('Cannot permanently delete employee with existing records. Use soft delete instead.');
  }
  
  const sql = `DELETE FROM employees WHERE id = $1`;
  const rowCount = await execute(sql, [id]);
  return rowCount > 0;
}

/**
 * List employees with optional filtering
 */
export async function listEmployees(filters?: {
  department?: string;
  designation?: string;
  employment_status?: EmploymentStatus;
  manager_id?: string;
  limit?: number;
  offset?: number;
}): Promise<EmployeeRow[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.department) {
    conditions.push(`department = $${paramCount++}`);
    values.push(filters.department);
  }

  if (filters?.designation) {
    conditions.push(`designation = $${paramCount++}`);
    values.push(filters.designation);
  }

  if (filters?.employment_status) {
    conditions.push(`employment_status = $${paramCount++}`);
    values.push(filters.employment_status);
  }

  if (filters?.manager_id) {
    conditions.push(`manager_id = $${paramCount++}`);
    values.push(filters.manager_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const sql = `
    SELECT 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id,
      created_at, updated_at
    FROM employees
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  return query<EmployeeRow>(sql, values);
}

/**
 * Get employees under a specific manager
 */
export async function getTeamMembers(managerId: string): Promise<EmployeeRow[]> {
  const sql = `
    SELECT 
      id, user_id, employee_code, first_name, last_name, phone,
      date_of_birth, gender, address, city, state, country, postal_code,
      department, designation, hire_date, employment_status, manager_id,
      created_at, updated_at
    FROM employees
    WHERE manager_id = $1
    ORDER BY first_name, last_name
  `;
  return query<EmployeeRow>(sql, [managerId]);
}

/**
 * Count employees with optional filtering
 */
export async function countEmployees(filters?: {
  department?: string;
  employment_status?: EmploymentStatus;
}): Promise<number> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.department) {
    conditions.push(`department = $${paramCount++}`);
    values.push(filters.department);
  }

  if (filters?.employment_status) {
    conditions.push(`employment_status = $${paramCount++}`);
    values.push(filters.employment_status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*)::int as count FROM employees ${whereClause}`;
  const result = await queryOne<{ count: number }>(sql, values);
  return result?.count || 0;
}
