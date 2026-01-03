# Leave & Time-Off Management - Implementation Guide

## 📋 Overview

Complete Leave & Time-Off Management system with:
- **Workflow**: PENDING → APPROVED/REJECTED
- **Balance Tracking**: Automatic reservation and deduction
- **Transactions**: Atomic operations using `BEGIN ... COMMIT`
- **Raw SQL**: All database operations with parameterized queries

---

## 🗄️ Database Schema

### Tables Created

#### 1. **leave_types** (Master Data)
```sql
CREATE TABLE leave_types (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  default_days_per_year INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT TRUE,
  requires_document BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Seed Data**:
- Annual Leave: 20 days/year
- Sick Leave: 12 days/year (requires document)
- Casual Leave: 10 days/year
- Maternity Leave: 180 days/year
- Paternity Leave: 15 days/year
- Unpaid Leave: 0 days
- Compensatory Off: 0 days

#### 2. **employee_leave_balances** (Balance Tracking)
```sql
CREATE TABLE employee_leave_balances (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) CASCADE,
  year INTEGER NOT NULL,
  total_allocated DECIMAL(5,2) DEFAULT 0,
  used DECIMAL(5,2) DEFAULT 0,
  pending DECIMAL(5,2) DEFAULT 0,
  available DECIMAL(5,2) GENERATED ALWAYS AS 
    (total_allocated - used - pending) STORED,
  
  CONSTRAINT unique_employee_leave_year 
    UNIQUE(employee_id, leave_type_id, year),
  CONSTRAINT balance_check 
    CHECK (used >= 0 AND pending >= 0)
);
```

**Computed Column**: `available = total_allocated - used - pending`

#### 3. **leave_requests** (Workflow)
```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  
  -- Approval workflow
  approver_id UUID REFERENCES employees(id) SET NULL,
  approver_comment TEXT,
  approved_at TIMESTAMP,
  
  -- Documents
  document_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_days CHECK (total_days > 0)
);
```

**Indexes**:
```sql
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
```

---

## 🔄 Leave Request Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    LEAVE REQUEST WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

1. CREATE REQUEST (Employee)
   │
   ├─ Validate dates (future dates only)
   ├─ Calculate total_days
   ├─ BEGIN TRANSACTION
   │   ├─ Check available balance
   │   ├─ Reserve balance (pending += total_days)
   │   └─ Insert leave_requests (status = PENDING)
   └─ COMMIT

2. PENDING → APPROVED (HR/Admin)
   │
   ├─ BEGIN TRANSACTION
   │   ├─ UPDATE leave_requests
   │   │   SET status = 'APPROVED',
   │   │       approver_id = $1,
   │   │       approver_comment = $2,
   │   │       approved_at = NOW()
   │   │
   │   └─ UPDATE employee_leave_balances
   │       SET pending = pending - total_days,
   │           used = used + total_days
   └─ COMMIT

3. PENDING → REJECTED (HR/Admin)
   │
   ├─ BEGIN TRANSACTION
   │   ├─ UPDATE leave_requests
   │   │   SET status = 'REJECTED',
   │   │       approver_id = $1,
   │   │       approver_comment = $2
   │   │
   │   └─ UPDATE employee_leave_balances
   │       SET pending = pending - total_days
   │       (Release reserved balance)
   └─ COMMIT
```

---

## 🔍 Key SQL Queries

### 1. Create Leave Request with Balance Reservation
```sql
-- Transaction Start
BEGIN;

-- Check and reserve balance
UPDATE employee_leave_balances
SET pending = pending + $1
WHERE employee_id = $2 
  AND leave_type_id = $3 
  AND year = $4
  AND (total_allocated - used - pending) >= $1  -- Ensure sufficient balance
RETURNING id;

-- Insert leave request
INSERT INTO leave_requests (
  employee_id, leave_type_id, start_date, end_date,
  total_days, reason, status, document_url
)
VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)
RETURNING *;

COMMIT;
```

### 2. List Leave Requests with Filters (JOINs)
```sql
SELECT 
  lr.id, lr.employee_id, lr.leave_type_id, 
  lr.start_date, lr.end_date, lr.total_days, 
  lr.reason, lr.status, lr.approver_id, 
  lr.approver_comment, lr.approved_at, lr.document_url,
  lr.created_at, lr.updated_at,
  
  -- Employee details
  e.employee_code, 
  e.first_name as employee_first_name,
  e.last_name as employee_last_name, 
  e.department as employee_department,
  
  -- Leave type details
  lt.name as leave_type_name, 
  lt.is_paid as leave_type_is_paid,
  
  -- Approver details
  app.first_name as approver_first_name,
  app.last_name as approver_last_name
  
FROM leave_requests lr
INNER JOIN employees e ON lr.employee_id = e.id
INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
LEFT JOIN employees app ON lr.approver_id = app.id

WHERE lr.status = $1 
  AND lr.start_date >= $2 
  AND lr.end_date <= $3
  AND lr.employee_id = $4

ORDER BY lr.created_at DESC
LIMIT $5 OFFSET $6;
```

### 3. Approve Leave Request (Transaction)
```sql
BEGIN;

-- Lock the row for update
SELECT * FROM leave_requests 
WHERE id = $1 
FOR UPDATE;

-- Update leave request status
UPDATE leave_requests
SET 
  status = 'APPROVED',
  approver_id = $1,
  approver_comment = $2,
  approved_at = NOW()
WHERE id = $3;

-- Move pending to used in balance
UPDATE employee_leave_balances
SET 
  pending = pending - $4,
  used = used + $4
WHERE employee_id = $5 
  AND leave_type_id = $6 
  AND year = $7;

COMMIT;
```

### 4. Reject Leave Request (Transaction)
```sql
BEGIN;

-- Lock the row
SELECT * FROM leave_requests 
WHERE id = $1 
FOR UPDATE;

-- Update status
UPDATE leave_requests
SET 
  status = 'REJECTED',
  approver_id = $1,
  approver_comment = $2,  -- Required for rejection
  approved_at = NOW()
WHERE id = $3;

-- Release pending balance
UPDATE employee_leave_balances
SET pending = pending - $4
WHERE employee_id = $5 
  AND leave_type_id = $6 
  AND year = $7;

COMMIT;
```

### 5. Get Employee Leave Balances
```sql
SELECT 
  elb.id, elb.employee_id, elb.leave_type_id, elb.year,
  elb.total_allocated, elb.used, elb.pending, 
  elb.available,  -- Computed column
  lt.name as leave_type_name,
  lt.is_paid as leave_type_is_paid
FROM employee_leave_balances elb
INNER JOIN leave_types lt ON elb.leave_type_id = lt.id
WHERE elb.employee_id = $1 
  AND elb.year = $2
ORDER BY lt.name;
```

### 6. Leave Request Stats (Aggregate)
```sql
SELECT 
  COUNT(*)::int as total_requests,
  COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending_requests,
  COUNT(*) FILTER (WHERE status = 'APPROVED')::int as approved_requests,
  COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected_requests
FROM leave_requests
WHERE employee_id = $1;
```

---

## 🎯 API Endpoints

### **Employee Routes**

#### `POST /api/leave-requests`
Create new leave request with automatic balance reservation.

**Request**:
```json
{
  "leave_type_id": "uuid",
  "start_date": "2026-02-01",
  "end_date": "2026-02-05",
  "reason": "Family vacation",
  "document_url": "https://example.com/doc.pdf"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Leave request created successfully",
  "data": {
    "id": "uuid",
    "employee": { "id": "uuid", "name": "John Doe", ... },
    "leave_type": { "id": "uuid", "name": "Annual Leave", ... },
    "start_date": "2026-02-01",
    "end_date": "2026-02-05",
    "total_days": 5,
    "status": "PENDING",
    ...
  }
}
```

#### `GET /api/leave-requests/me`
Get all my leave requests.

#### `GET /api/leave-requests/me/summary`
Get leave summary (balances + recent requests + stats).

**Response**:
```json
{
  "balances": [
    {
      "leave_type": { "name": "Annual Leave" },
      "total_allocated": 20,
      "used": 5,
      "pending": 3,
      "available": 12
    }
  ],
  "recent_requests": [...],
  "stats": {
    "total_requests": 10,
    "pending_requests": 2,
    "approved_requests": 7,
    "rejected_requests": 1
  }
}
```

---

### **Admin/HR Routes**

#### `GET /api/leave-requests`
List all leave requests with filters.

**Query Params**:
```
?status=PENDING
&employee_id=uuid
&leave_type_id=uuid
&start_date=2026-01-01
&end_date=2026-12-31
&page=1
&limit=20
```

**Response**:
```json
{
  "data": [ /* LeaveRequestDTO[] */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### `PATCH /api/leave-requests/:id/approve`
Approve leave request (transaction: updates status + balances).

**Request**:
```json
{
  "approver_comment": "Approved for vacation"
}
```

#### `PATCH /api/leave-requests/:id/reject`
Reject leave request (transaction: updates status + releases balance).

**Request**:
```json
{
  "approver_comment": "Insufficient staffing during this period"
}
```

---

## 🏗️ Code Architecture

### Repository Layer
[leaveRequestRepository.ts](src/repositories/leaveRequestRepository.ts)

**Key Functions**:
- `createLeaveRequest()` - Insert with parameterized query
- `getLeaveRequestById()` - SELECT with triple JOIN
- `listLeaveRequestsWithFilters()` - Dynamic WHERE with pagination
- `approveLeaveRequest()` - **Transaction** (FOR UPDATE + 2 UPDATEs)
- `rejectLeaveRequest()` - **Transaction** (FOR UPDATE + 2 UPDATEs)
- `reserveLeaveBalance()` - UPDATE with balance check
- `getEmployeeLeaveBalances()` - SELECT with JOIN

**Transaction Example**:
```typescript
export async function approveLeaveRequest(
  requestId: string,
  approverId: string,
  approverComment?: string
): Promise<LeaveRequestDetailRow> {
  return transaction(async () => {
    // 1. Lock row
    const leaveRequest = await queryOne(
      `SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE`,
      [requestId]
    );
    
    // 2. Validate status
    if (leaveRequest.status !== 'PENDING') {
      throw new Error('Cannot approve non-pending request');
    }
    
    // 3. Update leave request
    await queryOne(`
      UPDATE leave_requests
      SET status = 'APPROVED', approver_id = $1, 
          approver_comment = $2, approved_at = NOW()
      WHERE id = $3
    `, [approverId, approverComment, requestId]);
    
    // 4. Update balance
    await queryOne(`
      UPDATE employee_leave_balances
      SET pending = pending - $1, used = used + $1
      WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4
    `, [leaveRequest.total_days, ...]);
    
    // 5. Return updated data
    return getLeaveRequestById(requestId);
  });
}
```

### Service Layer
[leave.service.ts](src/services/leave.service.ts)

**Business Logic**:
- Date validation (future dates only)
- Leave days calculation
- Balance sufficiency checks
- DTO mapping
- Error handling with `AppError`

### Controller Layer
[leave.controller.ts](src/controllers/leave.controller.ts)

**HTTP Handlers**:
- Request/response handling
- User authentication check
- Error propagation to middleware

### Routes
[leave.routes.ts](src/routes/leave.routes.ts)

**Middleware Chain**:
```typescript
router.post('/',
  authenticate,                      // JWT verification
  validate(createLeaveRequestSchema), // Zod validation
  leaveController.createLeaveRequest  // Handler
);

router.patch('/:id/approve',
  authenticate,
  authorize(UserRole.HR, UserRole.ADMIN), // RBAC
  validate(approveLeaveRequestSchema),
  leaveController.approveLeaveRequest
);
```

---

## 🔒 Data Integrity Rules

### Status Transitions (Enforced)
```
PENDING ──approve──> APPROVED  ✅
PENDING ──reject──> REJECTED   ✅
APPROVED ──X──> any             ❌
REJECTED ──X──> any             ❌
```

### Balance Constraints
```sql
CHECK (used >= 0 AND pending >= 0)
CHECK (available = total_allocated - used - pending)  -- Computed
```

### Transaction Isolation
```typescript
// Row-level locking prevents concurrent modifications
SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE;
```

### Referential Integrity
- `employee_id` → ON DELETE CASCADE
- `leave_type_id` → ON DELETE RESTRICT (can't delete types in use)
- `approver_id` → ON DELETE SET NULL (preserve history)

---

## 🧪 Testing Examples

### 1. Create Leave Request
```bash
curl -X POST http://localhost:3000/api/leave-requests \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "leave_type_id": "uuid-of-annual-leave",
    "start_date": "2026-03-10",
    "end_date": "2026-03-14",
    "reason": "Family vacation to Goa"
  }'
```

### 2. Get My Leave Summary
```bash
curl -X GET http://localhost:3000/api/leave-requests/me/summary \
  -H "Authorization: Bearer <jwt_token>"
```

### 3. List Pending Requests (Admin)
```bash
curl -X GET "http://localhost:3000/api/leave-requests?status=PENDING&page=1" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

### 4. Approve Leave Request (Admin)
```bash
curl -X PATCH http://localhost:3000/api/leave-requests/<request_id>/approve \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approver_comment": "Approved - enjoy your vacation"
  }'
```

### 5. Reject Leave Request (Admin)
```bash
curl -X PATCH http://localhost:3000/api/leave-requests/<request_id>/reject \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approver_comment": "Denied - project deadline approaching"
  }'
```

---

## 📊 Database Functions

### Helper Functions Created

#### 1. Calculate Business Days
```sql
CREATE FUNCTION calculate_business_days(
  start_date DATE,
  end_date DATE
) RETURNS DECIMAL AS $$
  -- Counts Monday-Friday only
$$;
```

#### 2. Auto-allocate Leave Balances
```sql
CREATE FUNCTION allocate_leave_balances_for_employee(
  p_employee_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO employee_leave_balances (...)
  SELECT employee_id, leave_type_id, year, default_days_per_year
  FROM leave_types
  WHERE default_days_per_year > 0
  ON CONFLICT DO NOTHING;
END;
$$;
```

---

## ✅ Features Implemented

- ✅ Complete leave workflow (PENDING → APPROVED/REJECTED)
- ✅ Automatic balance tracking (reserve → use/release)
- ✅ Atomic transactions with `BEGIN ... COMMIT`
- ✅ Row-level locking (`FOR UPDATE`)
- ✅ Dynamic filters with parameterized queries
- ✅ Triple JOINs (leave_requests + employees + leave_types + approver)
- ✅ Computed columns (available balance)
- ✅ Database constraints and checks
- ✅ Seed data for leave types
- ✅ RBAC (Employee vs HR/Admin routes)
- ✅ Input validation with Zod
- ✅ Complete separation of concerns

---

## 🚀 Setup Instructions

1. **Run Schema**:
```bash
psql -U postgres -d dayflow_db -f backend/src/db/schema/leave_management.sql
```

2. **Allocate Balances** (for existing employees):
```sql
SELECT allocate_leave_balances_for_employee(id, 2026) 
FROM employees;
```

3. **API Ready**: Routes are already integrated in [app.ts](src/app.ts)

---

## 📝 Next Steps

1. Add **cancel request** functionality (employee can cancel PENDING requests)
2. Implement **email notifications** on approval/rejection
3. Add **leave calendar** view (team leave schedule)
4. **Carry-forward** unused leave to next year
5. **Half-day** leave support
6. **Clash detection** (prevent overlapping leaves)
7. **Manager hierarchy** (multi-level approval)
