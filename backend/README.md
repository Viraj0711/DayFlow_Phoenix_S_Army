# Dayflow HRMS - Backend API

Complete authentication system with TypeScript, Express, PostgreSQL, and JWT.

## Features

✅ **User Registration & Login**
- Email/password authentication
- Password complexity validation
- Bcrypt password hashing (12 salt rounds)

✅ **Email Verification**
- Secure token generation
- 24-hour expiration
- Verification email with HTML template

✅ **JWT Authentication**
- Role-based access control
- 7-day token expiration
- Secure token signing

✅ **Security**
- Helmet for security headers
- CORS configuration
- Rate limiting
- SQL injection protection (parameterized queries)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dayflow_hrms
DB_USER=dayflow_user
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Database Setup

```bash
# Create database and run migrations
psql -U postgres -c "CREATE DATABASE dayflow_hrms;"
psql -U dayflow_user -d dayflow_hrms -f ../database/schema.sql
psql -U dayflow_user -d dayflow_hrms -f ../database/migrations/001_email_verification_tokens.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:5000`

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints

#### POST /api/v1/auth/signup
Register a new user.

**Request:**
```json
{
  "employeeId": "EMP001",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "EMPLOYEE"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "uuid",
      "employee_id": "EMP001",
      "email": "user@example.com",
      "role": "EMPLOYEE",
      "email_verified": false,
      "is_active": true,
      "created_at": "2026-01-03T..."
    }
  }
}
```

#### POST /api/v1/auth/login
User login.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "employee_id": "EMP001",
      "email": "user@example.com",
      "role": "EMPLOYEE",
      "email_verified": true,
      "is_active": true,
      "created_at": "2026-01-03T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/v1/auth/request-verification
Request a new verification email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

#### GET /api/v1/auth/verify-email?token=xxx
Verify email with token.

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

### Protected Endpoints

#### GET /api/v1/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "employee_id": "EMP001",
      "email": "user@example.com",
      "role": "EMPLOYEE",
      "email_verified": true,
      "is_active": true,
      "created_at": "2026-01-03T..."
    }
  }
}
```

## Password Requirements

- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

## JWT Token Structure

```json
{
  "userId": "uuid",
  "employeeId": "EMP001",
  "email": "user@example.com",
  "role": "EMPLOYEE",
  "iat": 1704297600,
  "exp": 1704902400
}
```

## Middleware Usage

### Authentication Middleware

```typescript
import { authMiddleware } from './middleware/auth.middleware';

// Protect a route
router.get('/protected', authMiddleware, (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

### Role-Based Authorization

```typescript
import { authMiddleware, requireRole } from './middleware/auth.middleware';
import { UserRole } from './types/auth.types';

// Admin-only route
router.get('/admin/dashboard',
  authMiddleware,
  requireRole([UserRole.HR_ADMIN, UserRole.SUPER_ADMIN]),
  adminDashboardController
);
```

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "role": "EMPLOYEE"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User (with token)
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection pool
│   ├── controllers/
│   │   └── auth.controller.ts   # Auth endpoint handlers
│   ├── middleware/
│   │   └── auth.middleware.ts   # JWT & role middleware
│   ├── repositories/
│   │   └── user.repository.ts   # Raw SQL queries
│   ├── routes/
│   │   └── auth.routes.ts       # Route definitions
│   ├── services/
│   │   └── email.service.ts     # Email sending
│   ├── types/
│   │   └── auth.types.ts        # TypeScript interfaces
│   ├── utils/
│   │   ├── jwt.utils.ts         # JWT sign/verify
│   │   └── password.utils.ts    # Password hashing
│   └── server.ts                # Express app setup
├── package.json
├── tsconfig.json
└── .env.example
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate email/employee ID)
- `500` - Internal Server Error

## Security Best Practices

✅ Passwords hashed with bcrypt (12 rounds)
✅ JWT tokens with expiration
✅ Rate limiting (100 requests per 15 min)
✅ Helmet for security headers
✅ CORS configured
✅ Parameterized SQL queries (no SQL injection)
✅ Input validation
✅ Email verification required
✅ No sensitive data in responses

## Email Configuration (Gmail)

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `.env`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

## Development

### Watch Mode
```bash
npm run dev
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

## Production Deployment

1. Set environment variables
2. Build TypeScript: `npm run build`
3. Run compiled code: `npm start`
4. Use process manager (PM2):
   ```bash
   pm2 start dist/server.js --name dayflow-api
   ```

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Email Not Sending
- Check email configuration
- Verify app password (not regular password)
- Check firewall/network settings

### JWT Token Invalid
- Check JWT_SECRET matches
- Verify token hasn't expired
- Ensure Bearer prefix in Authorization header

## Next Steps

- [ ] Add refresh tokens
- [ ] Implement password reset
- [ ] Add OAuth providers (Google, Microsoft)
- [ ] Implement 2FA
- [ ] Add session management
- [ ] Create audit logging
- [ ] Add API documentation (Swagger)
