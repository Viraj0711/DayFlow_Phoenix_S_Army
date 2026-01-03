/**
 * SQL SECURITY BEST PRACTICES AND EXAMPLES
 * 
 * This file demonstrates safe SQL practices using parameterized queries
 * to prevent SQL injection attacks.
 */

/**
 * ❌ DANGEROUS - Never use string concatenation or template literals
 */
export const DANGEROUS_EXAMPLES = {
  // SQL Injection Vulnerable
  sqlInjectionVulnerable: (email: string) => {
    // ❌ NEVER DO THIS
    const sql = `SELECT * FROM users WHERE email = '${email}'`;
    // Attacker could input: ' OR '1'='1
    // Resulting query: SELECT * FROM users WHERE email = '' OR '1'='1'
    // This returns all users!
  },

  // Template Literal Vulnerable
  templateLiteralVulnerable: (id: string) => {
    // ❌ NEVER DO THIS
    const sql = `DELETE FROM users WHERE id = ${id}`;
    // Attacker could input: 1; DROP TABLE users;
  },

  // Dynamic Field Vulnerable
  dynamicFieldVulnerable: (field: string, value: string) => {
    // ❌ NEVER DO THIS - field name cannot be parameterized safely this way
    const sql = `SELECT * FROM users WHERE ${field} = '${value}'`;
  },
};

/**
 * ✅ SAFE - Always use parameterized queries
 */
export const SAFE_EXAMPLES = {
  /**
   * Basic parameterized query
   */
  safeSelect: async (email: string) => {
    // ✅ SAFE - Uses parameter placeholder $1
    const sql = `SELECT * FROM users WHERE email = $1`;
    const values = [email];
    // Even if email contains SQL, it's treated as a literal string
    // return await query(sql, values);
  },

  /**
   * Multiple parameters
   */
  safeMultipleParams: async (firstName: string, lastName: string, department: string) => {
    // ✅ SAFE - Uses $1, $2, $3 placeholders
    const sql = `
      SELECT * FROM employees 
      WHERE first_name = $1 
        AND last_name = $2 
        AND department = $3
    `;
    const values = [firstName, lastName, department];
    // return await query(sql, values);
  },

  /**
   * Safe INSERT with RETURNING
   */
  safeInsert: async (email: string, password: string, role: string) => {
    // ✅ SAFE - All values parameterized
    const sql = `
      INSERT INTO users (email, password, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
    `;
    const values = [email, password, role];
    // return await queryOne(sql, values);
  },

  /**
   * Safe UPDATE with dynamic fields
   */
  safeUpdateDynamic: async (id: string, updates: Record<string, any>) => {
    // ✅ SAFE - Build parameterized query dynamically
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Whitelist allowed fields
    const allowedFields = ['first_name', 'last_name', 'phone', 'address'];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id); // Add ID as last parameter

    const sql = `
      UPDATE employees
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    // return await queryOne(sql, values);
  },

  /**
   * Safe dynamic WHERE clause
   */
  safeDynamicWhere: async (filters: {
    department?: string;
    status?: string;
    minSalary?: number;
  }) => {
    // ✅ SAFE - Build WHERE clause with parameters
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (filters.department) {
      conditions.push(`department = $${paramCount++}`);
      values.push(filters.department);
    }

    if (filters.status) {
      conditions.push(`employment_status = $${paramCount++}`);
      values.push(filters.status);
    }

    if (filters.minSalary !== undefined) {
      conditions.push(`basic_salary >= $${paramCount++}`);
      values.push(filters.minSalary);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const sql = `
      SELECT * FROM employees
      ${whereClause}
      ORDER BY created_at DESC
    `;

    // return await query(sql, values);
  },

  /**
   * Safe LIKE search with wildcards
   */
  safeLikeSearch: async (searchTerm: string) => {
    // ✅ SAFE - Wildcard added in parameter, not in SQL
    const sql = `
      SELECT * FROM employees
      WHERE first_name ILIKE $1 
         OR last_name ILIKE $1
         OR employee_code ILIKE $1
    `;
    const values = [`%${searchTerm}%`]; // Add wildcards in value
    // return await query(sql, values);
  },

  /**
   * Safe IN clause with array
   */
  safeInClause: async (ids: string[]) => {
    // ✅ SAFE - Use ANY with array parameter
    const sql = `
      SELECT * FROM employees
      WHERE id = ANY($1)
    `;
    const values = [ids]; // PostgreSQL supports array parameters
    // return await query(sql, values);
  },

  /**
   * Safe pagination
   */
  safePagination: async (page: number, limit: number) => {
    // ✅ SAFE - Parameterize LIMIT and OFFSET
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT * FROM employees
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const values = [limit, offset];
    // return await query(sql, values);
  },

  /**
   * Safe JOIN with parameters
   */
  safeJoin: async (userId: string) => {
    // ✅ SAFE - Parameters in JOIN condition
    const sql = `
      SELECT 
        e.*,
        u.email,
        u.role,
        m.first_name as manager_first_name,
        m.last_name as manager_last_name
      FROM employees e
      INNER JOIN users u ON e.user_id = u.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.user_id = $1
    `;
    const values = [userId];
    // return await queryOne(sql, values);
  },

  /**
   * Safe transaction example
   */
  safeTransaction: async (email: string, password: string, employeeData: any) => {
    // ✅ SAFE - All queries in transaction use parameters
    // return await transaction(async () => {
    //   // Step 1: Create user
    //   const userSql = `
    //     INSERT INTO users (email, password, role)
    //     VALUES ($1, $2, $3)
    //     RETURNING id
    //   `;
    //   const user = await queryOne(userSql, [email, password, 'Employee']);
      
    //   // Step 2: Create employee
    //   const empSql = `
    //     INSERT INTO employees (user_id, employee_code, first_name, last_name)
    //     VALUES ($1, $2, $3, $4)
    //     RETURNING *
    //   `;
    //   const employee = await queryOne(empSql, [
    //     user.id,
    //     employeeData.code,
    //     employeeData.firstName,
    //     employeeData.lastName,
    //   ]);
      
    //   return employee;
    // });
  },

  /**
   * Safe ORDER BY with whitelisting
   */
  safeOrderBy: async (sortField: string, sortOrder: string) => {
    // ✅ SAFE - Whitelist allowed fields and validate order
    const allowedSortFields = ['first_name', 'last_name', 'created_at', 'department'];
    const allowedOrders = ['ASC', 'DESC'];

    const field = allowedSortFields.includes(sortField) ? sortField : 'created_at';
    const order = allowedOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    // Field name is safe because it's whitelisted
    const sql = `
      SELECT * FROM employees
      ORDER BY ${field} ${order}
    `;
    // return await query(sql, []);
  },

  /**
   * Safe date range query
   */
  safeDateRange: async (startDate: string, endDate: string) => {
    // ✅ SAFE - Date parameters
    const sql = `
      SELECT * FROM leave_requests
      WHERE start_date >= $1 
        AND end_date <= $2
      ORDER BY start_date DESC
    `;
    const values = [startDate, endDate];
    // return await query(sql, values);
  },

  /**
   * Safe aggregate query
   */
  safeAggregate: async (employeeId: string, year: number) => {
    // ✅ SAFE - All conditions parameterized
    const sql = `
      SELECT 
        COUNT(*)::int as total_requests,
        COUNT(*) FILTER (WHERE status = 'APPROVED')::int as approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected,
        COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending
      FROM leave_requests
      WHERE employee_id = $1 
        AND EXTRACT(YEAR FROM start_date) = $2
    `;
    const values = [employeeId, year];
    // return await queryOne(sql, values);
  },
};

/**
 * KEY PRINCIPLES:
 * 
 * 1. ✅ ALWAYS use parameter placeholders ($1, $2, $3, etc.)
 * 2. ✅ NEVER concatenate user input into SQL strings
 * 3. ✅ NEVER use template literals with user input
 * 4. ✅ Whitelist dynamic field names (ORDER BY, column names)
 * 5. ✅ Validate and sanitize input before using in queries
 * 6. ✅ Use TypeScript types to enforce correct parameter types
 * 7. ✅ Use transactions for multi-step operations
 * 8. ✅ Add wildcards (%) in parameter values, not in SQL
 * 9. ✅ Use ANY($1) for IN clauses with arrays
 * 10. ✅ Always return minimal data (don't SELECT *)
 */

export default SAFE_EXAMPLES;
