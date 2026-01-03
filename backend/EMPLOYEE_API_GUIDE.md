# Employee Profile API - Implementation Summary

## 📋 Overview

Complete Employee Profile Management REST APIs with **separation of concerns**:
- **Controllers** handle HTTP requests/responses
- **Services** contain business logic
- **Repositories** execute raw SQL queries
- **DTOs** define request/response interfaces

---

## 🗂️ File Structure

```
backend/src/
├── types/
│   └── employee.types.ts         # DTOs and interfaces
├── validators/
│   └── employee.validator.ts     # Zod validation schemas
├── repositories/
│   ├── employeeRepository.ts     # Basic employee CRUD
│   └── employeeProfileRepository.ts  # Profile queries with JOINs
├── services/
│   └── employee.service.ts       # Business logic
├── controllers/
│   └── employee.controller.ts    # HTTP handlers
└── routes/
    └── employee.routes.ts        # Route definitions
```

---

## 🔐 API Endpoints

### **Employee Routes (Self-Service)**

#### `GET /api/employees/me`
- **Access**: Authenticated employees
- **Returns**: Full profile with personal, job, address, salary details
- **SQL**: JOIN users + employees + manager details

```typescript
// Response DTO
{
  id: string;
  employee_code: string;
  personal: {
    first_name, last_name, email, phone, 
    date_of_birth, gender, profile_picture
  };
  address: {
    street, city, state, country, postal_code
  };
  job: {
    department, designation, hire_date,
    employment_status, manager_id, manager_name
  };
  salary: {
    basic_salary, currency
  };
  created_at, updated_at
}
```

#### `PATCH /api/employees/me`
- **Access**: Authenticated employees
- **Allowed Fields**: phone, address, city, state, country, postal_code, profile_picture
- **SQL**: Dynamic UPDATE with only allowed fields

---

### **Admin/HR Routes**

#### `GET /api/employees`
- **Access**: HR, Admin
- **Features**: Pagination, filters (department, designation, status, search)
- **SQL**: JOIN with WHERE clauses and pagination

```typescript
// Query params
?department=Engineering
&designation=Senior Developer
&employment_status=Active
&search=john
&page=1
&limit=20

// Response
{
  data: EmployeeListItemDTO[],
  pagination: {
    page, limit, total, totalPages
  }
}
```

#### `GET /api/employees/:id`
- **Access**: HR, Admin
- **Returns**: Full employee profile by ID
- **SQL**: Same as /employees/me but by employee_id

#### `POST /api/employees`
- **Access**: HR, Admin
- **Creates**: User + Employee in **transaction**
- **SQL**: INSERT into users, then employees (atomic)

```typescript
// Request body
{
  email, password, role,
  employee_code, first_name, last_name, phone,
  date_of_birth, gender, profile_picture,
  address, city, state, country, postal_code,
  department, designation, hire_date,
  employment_status, manager_id, basic_salary
}
```

#### `PATCH /api/employees/:id`
- **Access**: HR, Admin
- **Updates**: All employee fields + email/role
- **SQL**: Transaction updating both users and employees tables

---

## 🔍 Sample SQL Queries

### Get Profile with JOINs
```sql
SELECT 
  e.id, e.user_id, e.employee_code, e.first_name, e.last_name, 
  e.phone, e.date_of_birth, e.gender, e.address, e.city, e.state, 
  e.country, e.postal_code, e.department, e.designation, e.hire_date, 
  e.employment_status, e.manager_id, e.profile_picture, e.basic_salary,
  e.created_at, e.updated_at,
  u.email, u.role,
  m.first_name as manager_first_name,
  m.last_name as manager_last_name
FROM employees e
INNER JOIN users u ON e.user_id = u.id
LEFT JOIN employees m ON e.manager_id = m.id
WHERE e.user_id = $1
```

### List with Filters and Pagination
```sql
SELECT 
  e.id, e.employee_code, e.first_name, e.last_name, e.phone,
  e.department, e.designation, e.employment_status, e.hire_date,
  e.profile_picture, u.email
FROM employees e
INNER JOIN users u ON e.user_id = u.id
WHERE e.department = $1 
  AND e.employment_status = $2
  AND (
    e.first_name ILIKE $3 OR 
    e.last_name ILIKE $3 OR 
    e.employee_code ILIKE $3 OR 
    u.email ILIKE $3
  )
ORDER BY e.created_at DESC
LIMIT $4 OFFSET $5
```

### Update Limited Fields (Self-Update)
```sql
UPDATE employees
SET 
  phone = $1,
  address = $2,
  city = $3,
  state = $4,
  country = $5,
  postal_code = $6,
  profile_picture = $7,
  updated_at = NOW()
WHERE id = $8
RETURNING id
```

### Create Employee + User (Transaction)
```typescript
await transaction(async () => {
  // 1. Create user
  const user = await query(`
    INSERT INTO users (email, password, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role
  `, [email, hashedPassword, role]);
  
  // 2. Create employee
  const employee = await query(`
    INSERT INTO employees (
      user_id, employee_code, first_name, last_name, 
      phone, date_of_birth, gender, address, city, 
      state, country, postal_code, department, 
      designation, hire_date, employment_status, 
      manager_id, basic_salary
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `, [user.id, ...employeeData]);
  
  return employee;
});
```

---

## 🛡️ Security & Validation

### Authentication & Authorization
```typescript
// Employee routes - any authenticated user
router.get('/me', authenticate, controller.getMyProfile);

// Admin routes - only HR/Admin
router.get('/', 
  authenticate, 
  authorize(UserRole.HR, UserRole.ADMIN),
  controller.listEmployees
);
```

### Input Validation (Zod)
```typescript
// Self-update - limited fields
const updateEmployeeSelfSchema = z.object({
  body: z.object({
    phone: z.string().min(10).max(15).optional(),
    address: z.string().min(1).max(500).optional(),
    // ... other safe fields
  }),
});

// Admin update - all fields
const updateEmployeeAdminSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(UserRole).optional(),
    // ... all fields
  }),
});
```

### SQL Injection Prevention
All queries use **parameterized queries** ($1, $2, etc.):
```typescript
// ❌ BAD (SQL injection vulnerable)
query(`SELECT * FROM employees WHERE id = '${id}'`);

// ✅ GOOD (parameterized)
query(`SELECT * FROM employees WHERE id = $1`, [id]);
```

---

## 🏗️ Separation of Concerns

### Repository Layer (Data Access)
```typescript
// employeeProfileRepository.ts
export async function getEmployeeProfileByUserId(userId: string) {
  const sql = `SELECT ... JOIN ... WHERE user_id = $1`;
  return queryOne<EmployeeProfileRow>(sql, [userId]);
}
```

### Service Layer (Business Logic)
```typescript
// employee.service.ts
export async function getMyProfile(userId: string) {
  const profile = await employeeProfileRepo.getEmployeeProfileByUserId(userId);
  
  if (!profile) {
    throw new AppError('Employee profile not found', 404);
  }
  
  return mapToEmployeeProfileDTO(profile);  // Transform to DTO
}
```

### Controller Layer (HTTP)
```typescript
// employee.controller.ts
export async function getMyProfile(req: AuthRequest, res: Response, next) {
  try {
    if (!req.user) {
      return ResponseHandler.error(res, 'Unauthorized', 401);
    }
    
    const profile = await employeeService.getMyProfile(req.user.id);
    ResponseHandler.success(res, profile, 'Profile retrieved');
  } catch (error) {
    next(error);  // Pass to error handler middleware
  }
}
```

### Routes (Endpoint Definition)
```typescript
// employee.routes.ts
router.get('/me', 
  authenticate,  // Middleware 1
  controller.getMyProfile  // Handler
);

router.patch('/me',
  authenticate,  // Middleware 1
  validate(updateEmployeeSelfSchema),  // Middleware 2
  controller.updateMyProfile  // Handler
);
```

---

## 📦 DTOs (Data Transfer Objects)

### Request DTOs
- `CreateEmployeeRequestDTO` - POST /employees body
- `UpdateEmployeeSelfRequestDTO` - PATCH /employees/me body
- `UpdateEmployeeAdminRequestDTO` - PATCH /employees/:id body
- `EmployeeListFilters` - GET /employees query params

### Response DTOs
- `EmployeeProfileDTO` - Full profile response
- `EmployeeListItemDTO` - List item response
- `PaginatedEmployeeResponse` - Paginated list wrapper

---

## 🧪 Testing Examples

### Get Own Profile
```bash
curl -X GET http://localhost:3000/api/employees/me \
  -H "Authorization: Bearer <jwt_token>"
```

### Update Own Profile
```bash
curl -X PATCH http://localhost:3000/api/employees/me \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "city": "Mumbai",
    "profile_picture": "https://example.com/photo.jpg"
  }'
```

### List Employees (Admin)
```bash
curl -X GET "http://localhost:3000/api/employees?department=Engineering&page=1&limit=10" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

### Create Employee (Admin)
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "SecurePass123!",
    "role": "Employee",
    "employee_code": "EMP001",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "9876543210",
    "date_of_birth": "1990-05-15",
    "gender": "Male",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "postal_code": "400001",
    "department": "Engineering",
    "designation": "Software Engineer",
    "hire_date": "2024-01-15",
    "employment_status": "Active",
    "basic_salary": 50000
  }'
```

---

## ✅ Key Features Implemented

- ✅ Raw SQL queries with parameterized inputs
- ✅ JOIN queries for employee + user + manager data
- ✅ Transactions for atomic operations (create employee)
- ✅ Dynamic UPDATE with field filtering
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod schemas
- ✅ Pagination and filtering
- ✅ DTO pattern for type safety
- ✅ Error handling with AppError
- ✅ Separation of concerns (Controller → Service → Repository)

---

## 📝 Next Steps

1. **Database Setup**: Create PostgreSQL tables
2. **Authentication**: Implement JWT login/register endpoints
3. **File Upload**: Add profile picture upload to S3/local storage
4. **Audit Logging**: Track who updated what
5. **Soft Delete**: Add `deleted_at` instead of hard delete
6. **Unit Tests**: Test services and repositories
7. **API Documentation**: Generate Swagger/OpenAPI docs
