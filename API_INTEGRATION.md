# Backend API Integration Guide

This document outlines the expected API endpoints and data structures for integrating the Dayflow HRMS frontend with your backend.

## 🔧 Base Configuration

**API Base URL**: Set in `.env` file
```env
VITE_API_BASE_URL=http://your-backend-url/api
```

**Authentication**: JWT Bearer Token
```
Authorization: Bearer <token>
```

---

## 📋 API Endpoints

### Authentication

#### POST `/auth/login`
Login user and get authentication token.

**Request**:
```json
{
  "email": "admin@dayflow.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "admin@dayflow.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "profilePicture": "url-to-image"
    }
  }
}
```

#### GET `/auth/me`
Get current authenticated user details.

**Headers**: 
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "admin@dayflow.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

---

### Dashboard

#### GET `/dashboard/stats`
Get dashboard statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalEmployees": 142,
    "activeEmployees": 138,
    "onLeaveToday": 4,
    "pendingLeaveRequests": 7,
    "todayAttendance": {
      "present": 125,
      "absent": 9,
      "notMarked": 8
    },
    "monthlyStats": {
      "newJoinees": 5,
      "resignations": 2,
      "averageAttendance": 92.5
    }
  }
}
```

---

### Employees

#### GET `/employees`
Get all employees with optional filtering.

**Query Parameters**:
- `search` (optional): Search term
- `status` (optional): 'active' | 'inactive' | 'on-leave'
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": "EMP001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah.j@dayflow.com",
      "phoneNumber": "+91 98765 43210",
      "department": "Engineering",
      "position": "Senior Software Engineer",
      "dateOfJoining": "2023-01-15",
      "dateOfBirth": "1990-05-20",
      "address": "123 Tech Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India",
      "status": "active",
      "employmentType": "full-time",
      "manager": "John Smith",
      "emergencyContact": {
        "name": "John Johnson",
        "relationship": "Spouse",
        "phone": "+91 98765 43211"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 15,
    "totalItems": 142,
    "itemsPerPage": 10
  }
}
```

#### GET `/employees/:id`
Get single employee details.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "employeeId": "EMP001",
    "firstName": "Sarah",
    "lastName": "Johnson",
    // ... all employee fields
    "documents": [
      {
        "id": "1",
        "name": "Aadhar Card",
        "type": "identification",
        "uploadedAt": "2023-01-15",
        "url": "https://..."
      }
    ]
  }
}
```

#### POST `/employees`
Create new employee.

**Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@dayflow.com",
  "phoneNumber": "+91 98765 43210",
  "department": "Engineering",
  "position": "Software Engineer",
  "dateOfJoining": "2026-01-15",
  "dateOfBirth": "1995-03-20",
  // ... other fields
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "143",
    "employeeId": "EMP143",
    // ... all employee fields
  },
  "message": "Employee created successfully"
}
```

#### PUT `/employees/:id`
Update employee details.

**Request**: Same as POST

**Response**:
```json
{
  "success": true,
  "data": {
    // updated employee object
  },
  "message": "Employee updated successfully"
}
```

---

### Leave Requests

#### GET `/leave-requests`
Get leave requests with optional filtering.

**Query Parameters**:
- `status` (optional): 'pending' | 'approved' | 'rejected'
- `employeeId` (optional): Filter by employee
- `page`, `limit` (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": "EMP001",
      "employeeName": "Sarah Johnson",
      "employeeEmail": "sarah.j@dayflow.com",
      "leaveType": "paid",
      "startDate": "2026-01-10",
      "endDate": "2026-01-12",
      "totalDays": 3,
      "reason": "Family vacation",
      "status": "pending",
      "appliedOn": "2026-01-03",
      "reviewedBy": null,
      "reviewedOn": null,
      "reviewComments": null
    }
  ],
  "pagination": { /* ... */ }
}
```

#### PUT `/leave-requests/:id`
Approve or reject leave request.

**Request**:
```json
{
  "status": "approved",  // or "rejected"
  "comments": "Approved. Enjoy your vacation!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    // updated leave request
    "reviewedBy": "Admin User",
    "reviewedOn": "2026-01-03T10:30:00Z"
  },
  "message": "Leave request approved successfully"
}
```

---

### Attendance

#### GET `/attendance`
Get attendance records.

**Query Parameters**:
- `date` (required): YYYY-MM-DD format
- `status` (optional): 'present' | 'absent' | 'leave' | 'half-day'
- `employeeId` (optional)
- `page`, `limit` (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": "EMP001",
      "employeeName": "Sarah Johnson",
      "date": "2026-01-03",
      "checkIn": "09:15 AM",
      "checkOut": "06:30 PM",
      "status": "present",
      "workHours": 9.25,
      "remarks": null
    }
  ],
  "pagination": { /* ... */ }
}
```

#### GET `/attendance/overview`
Get attendance overview for a specific date.

**Query Parameters**:
- `date` (required): YYYY-MM-DD format

**Response**:
```json
{
  "success": true,
  "data": {
    "totalEmployees": 142,
    "present": 125,
    "absent": 9,
    "onLeave": 4,
    "halfDay": 4,
    "date": "2026-01-03"
  }
}
```

---

### Payroll

#### GET `/payroll`
Get payroll records.

**Query Parameters**:
- `month` (required): MM format
- `year` (required): YYYY format
- `employeeId` (optional)
- `page`, `limit` (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": "EMP001",
      "employeeName": "Sarah Johnson",
      "month": "01",
      "year": 2026,
      "salaryStructure": {
        "basicSalary": 50000,
        "houseRentAllowance": 15000,
        "medicalAllowance": 5000,
        "transportAllowance": 3000,
        "otherAllowances": 2000,
        "providentFund": 6000,
        "professionalTax": 200,
        "incomeTax": 8000,
        "otherDeductions": 0
      },
      "grossSalary": 75000,
      "totalDeductions": 14200,
      "netSalary": 60800,
      "paymentStatus": "paid",
      "paymentDate": "2026-01-01",
      "workingDays": 22,
      "presentDays": 22,
      "leaves": 0
    }
  ],
  "pagination": { /* ... */ }
}
```

#### PUT `/payroll/:id/salary`
Update employee salary structure.

**Request**:
```json
{
  "basicSalary": 55000,
  "houseRentAllowance": 16500,
  "medicalAllowance": 5500,
  "transportAllowance": 3500,
  "otherAllowances": 2000,
  "providentFund": 6600,
  "professionalTax": 200,
  "incomeTax": 9000,
  "otherDeductions": 0
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    // updated payroll record
  },
  "message": "Salary structure updated successfully"
}
```

---

### Reports

#### GET `/reports/attendance`
Get attendance report for employees.

**Query Parameters**:
- `month` (required): MM format
- `year` (required): YYYY format
- `department` (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "employeeId": "EMP001",
      "employeeName": "Sarah Johnson",
      "department": "Engineering",
      "totalDays": 22,
      "presentDays": 22,
      "absentDays": 0,
      "leaveDays": 0,
      "halfDays": 0,
      "attendancePercentage": 100
    }
  ]
}
```

#### GET `/reports/salary-slips`
Get salary slips.

**Query Parameters**:
- `month` (required): MM format
- `year` (required): YYYY format
- `employeeId` (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "employeeId": "EMP001",
      "employeeName": "Sarah Johnson",
      "employeeEmail": "sarah.j@dayflow.com",
      "month": "01",
      "year": 2026,
      "salaryStructure": { /* ... */ },
      "grossSalary": 75000,
      "netSalary": 60800,
      "generatedOn": "2026-01-01",
      "pdfUrl": "https://..."
    }
  ]
}
```

---

## 🔒 Error Handling

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔑 Authorization

The frontend automatically includes the JWT token in all requests:

```javascript
// Automatically added by axios interceptor
headers: {
  'Authorization': 'Bearer <token>'
}
```

On 401 responses, the user is automatically redirected to login.

---

## 🧪 Testing Endpoints

Use the following tools to test your backend:
- **Postman**: Import the endpoints
- **cURL**: Command-line testing
- **Thunder Client**: VS Code extension

Example cURL:
```bash
curl -X GET "http://localhost:5000/api/employees" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

---

## 📝 Implementation Checklist

- [ ] Implement all authentication endpoints
- [ ] Implement dashboard stats endpoint
- [ ] Implement employee CRUD endpoints
- [ ] Implement leave request endpoints
- [ ] Implement attendance endpoints
- [ ] Implement payroll endpoints
- [ ] Implement reports endpoints
- [ ] Set up JWT authentication
- [ ] Configure CORS for frontend URL
- [ ] Add input validation
- [ ] Add error handling
- [ ] Test all endpoints
- [ ] Update frontend API URL

---

## 🚀 Quick Integration Steps

1. **Set up backend project** with your preferred stack
2. **Implement authentication** (JWT recommended)
3. **Create database models** matching the data structures above
4. **Implement API endpoints** one by one
5. **Test with Postman** or similar tool
6. **Update frontend `.env`** with your backend URL
7. **Test integration** with the frontend
8. **Deploy** both frontend and backend

---

For any questions or clarifications, refer to the type definitions in `src/types/index.ts`.
