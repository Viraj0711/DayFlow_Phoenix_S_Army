# HRMS Repository Layer

This directory contains the data access layer for the HRMS application using raw SQL queries with the `pg` library.

## Pattern Overview

Each repository follows a consistent pattern:

### 1. **Type Definitions**
```typescript
// Row interface matching database schema
export interface EntityRow {
  id: string;
  // ... other fields matching DB columns
  created_at: Date;
  updated_at: Date;
}

// Input types for creation
export interface CreateEntityInput {
  // ... required fields for creating entity
}

// Input types for updates
export interface UpdateEntityInput {
  // ... optional fields that can be updated
}
```

### 2. **CRUD Operations**

#### Find Operations
```typescript
// Find by ID
export async function findEntityById(id: string): Promise<EntityRow | null> {
  const sql = `SELECT * FROM entities WHERE id = $1`;
  return queryOne<EntityRow>(sql, [id]);
}

// Find with filters
export async function findEntityBy...(param: string): Promise<EntityRow | null> {
  const sql = `SELECT * FROM entities WHERE field = $1`;
  return queryOne<EntityRow>(sql, [param]);
}
```

#### Create Operation
```typescript
export async function createEntity(input: CreateEntityInput): Promise<EntityRow> {
  const sql = `
    INSERT INTO entities (field1, field2, ...)
    VALUES ($1, $2, ...)
    RETURNING *
  `;
  const result = await queryOne<EntityRow>(sql, [
    input.field1,
    input.field2,
    // ...
  ]);
  
  if (!result) {
    throw new Error('Failed to create entity');
  }
  
  return result;
}
```

#### Update Operation (Dynamic)
```typescript
export async function updateEntity(
  id: string,
  input: UpdateEntityInput
): Promise<EntityRow | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Build dynamic SET clause
  if (input.field1 !== undefined) {
    fields.push(`field1 = $${paramCount++}`);
    values.push(input.field1);
  }
  // ... repeat for each field

  if (fields.length === 0) {
    return findEntityById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const sql = `
    UPDATE entities
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  return queryOne<EntityRow>(sql, values);
}
```

#### Delete Operation
```typescript
export async function deleteEntity(id: string): Promise<boolean> {
  const sql = `DELETE FROM entities WHERE id = $1`;
  const rowCount = await execute(sql, [id]);
  return rowCount > 0;
}
```

#### List with Filters
```typescript
export async function listEntities(filters?: {
  field1?: string;
  field2?: number;
  limit?: number;
  offset?: number;
}): Promise<EntityRow[]> {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.field1) {
    conditions.push(`field1 = $${paramCount++}`);
    values.push(filters.field1);
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';
  
  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  const sql = `
    SELECT * FROM entities
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);
  return query<EntityRow>(sql, values);
}
```

## SQL Injection Prevention

**Always use parameterized queries:**

✅ **CORRECT:**
```typescript
const sql = `SELECT * FROM users WHERE email = $1`;
await query(sql, [userEmail]);
```

❌ **WRONG:**
```typescript
const sql = `SELECT * FROM users WHERE email = '${userEmail}'`;
await query(sql);
```

## Remaining Repositories to Implement

Following the same pattern, create these repositories:

### 1. **payrollRepository.ts**
```typescript
export interface PayrollRow {
  id: string;
  employee_id: string;
  period_start: Date;
  period_end: Date;
  basic_salary: number;
  allowances: number;
  deductions: number;
  gross_salary: number;
  net_salary: number;
  status: PayrollStatus;
  paid_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Functions to implement:
// - findPayrollById
// - createPayrollRecord
// - updatePayrollRecord
// - listPayrollByEmployee
// - listPayrollByPeriod
// - calculatePayroll
// - markAsPaid
```

### 2. **notificationRepository.ts**
```typescript
export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: Date;
}

// Functions to implement:
// - findNotificationById
// - createNotification
// - markAsRead
// - markAllAsRead
// - listNotificationsByUser
// - deleteNotification
// - countUnreadNotifications
```

## Best Practices

1. **Always return typed results** using generics: `query<EntityRow>(...)`
2. **Handle null cases** appropriately with `queryOne` returning `null`
3. **Use transactions** for operations that modify multiple tables
4. **Validate input** before executing queries (use Zod schemas)
5. **Log errors** but don't expose sensitive data
6. **Use consistent naming**:
   - `find*` for single record retrieval
   - `list*` for multiple records
   - `create*` for insertions
   - `update*` for modifications
   - `delete*` for deletions
7. **Add business logic functions** like `checkIn`, `checkOut`, `approveLeave`, etc.
8. **Include aggregate functions** like `count*`, `get*Summary` when needed

## Example Usage

```typescript
import * as userRepo from './repositories/userRepository';
import * as employeeRepo from './repositories/employeeRepository';

// Create user and employee
const user = await userRepo.createUser({
  email: 'john@example.com',
  password: hashedPassword,
  role: UserRole.EMPLOYEE,
});

const employee = await employeeRepo.createEmployee({
  user_id: user.id,
  employee_code: 'EMP001',
  first_name: 'John',
  last_name: 'Doe',
  // ... other fields
});

// List employees by department
const engineers = await employeeRepo.listEmployees({
  department: 'Engineering',
  employment_status: EmploymentStatus.ACTIVE,
  limit: 50,
});
```
