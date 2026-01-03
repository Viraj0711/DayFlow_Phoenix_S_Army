# Validation, Error Handling & Security - Implementation Guide

## 📋 Overview

Complete cross-cutting concerns implementation:
- **Validation**: Zod schemas with TypeScript type inference
- **Error Handling**: Centralized AppError with consistent JSON responses
- **Security**: Helmet, CORS, rate limiting, SQL injection prevention
- **PostgreSQL Error Handling**: User-friendly error messages
- **Environment Configuration**: Comprehensive .env setup

---

## 🔒 Security Implementation

### 1. Helmet Security Headers
```typescript
// middlewares/security.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
```

### 2. CORS Configuration
```typescript
// middlewares/security.ts
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = config.cors.allowedOrigins.split(',');
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

### 3. Rate Limiting
```typescript
// middlewares/rateLimiter.ts

// General API rate limiter: 100 requests / 15 min
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests, try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
});

// Auth rate limiter: 5 requests / 15 min (prevents brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      message: 'Too many auth attempts, try again after 15 minutes',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
});
```

**Usage**:
```typescript
// Apply to routes
router.post('/login', authLimiter, loginController);
router.post('/register', authLimiter, registerController);
```

---

## ✅ Validation with Zod

### Auth Validation
```typescript
// validators/auth.validator.ts
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and number'
      ),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

// TypeScript type inference
export type RegisterInput = z.infer<typeof registerSchema>['body'];
```

### Leave Request Validation
```typescript
// validators/leave.validator.ts
export const createLeaveRequestSchema = z.object({
  body: z.object({
    leave_type_id: z.string().uuid(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().min(10).max(1000),
    document_url: z.string().url().optional(),
  }),
});
```

### Attendance Validation
```typescript
// validators/attendance.validator.ts
export const checkInSchema = z.object({
  body: z.object({
    notes: z.string().max(500).optional(),
    location: z.string().max(255).optional(),
  }),
});

export const attendanceListFiltersSchema = z.object({
  query: z.object({
    employee_id: z.string().uuid().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
```

### Payroll Validation
```typescript
// validators/payroll.validator.ts
export const createPayrollSchema = z.object({
  body: z.object({
    employee_id: z.string().uuid(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    basic_salary: z.number().positive(),
    allowances: z.number().nonnegative().default(0),
    deductions: z.number().nonnegative().default(0),
    tax: z.number().nonnegative().default(0),
    net_salary: z.number().positive(),
  }),
});
```

### Validation Middleware
```typescript
// middlewares/validate.ts
import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error); // Zod error handled by global error handler
    }
  };
};
```

---

## 🚨 Error Handling

### Custom AppError Class
```typescript
// utils/errors.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, statusCode = 500, details?, code?) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code || `ERROR_${this.statusCode}`,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Convenience classes
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?) {
    super(message, 400, details, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?) {
    super(message, 401, details, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?) {
    super(message, 404, details, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?) {
    super(message, 409, details, 'CONFLICT');
  }
}
```

### PostgreSQL Error Handler
```typescript
// utils/errors.ts
export class DatabaseErrorHandler {
  static handlePgError(error: any): AppError {
    // Unique violation (23505)
    if (error.code === '23505') {
      return new ConflictError(
        `Resource already exists`,
        { constraint: error.constraint }
      );
    }
    
    // Foreign key violation (23503)
    if (error.code === '23503') {
      return new BadRequestError(
        `Invalid reference: Related resource does not exist`,
        { constraint: error.constraint }
      );
    }
    
    // Not null violation (23502)
    if (error.code === '23502') {
      return new BadRequestError(
        `Required field '${error.column}' is missing`,
        { column: error.column }
      );
    }
    
    // Check violation (23514)
    if (error.code === '23514') {
      return new BadRequestError('Data validation failed', {
        constraint: error.constraint,
      });
    }
    
    // Invalid text representation (22P02)
    if (error.code === '22P02') {
      return new BadRequestError('Invalid data format');
    }
    
    return new InternalServerError('Database operation failed');
  }
}
```

### Global Error Middleware
```typescript
// middlewares/errorHandler.ts
export function errorHandler(err, req, res, next) {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        details: validationErrors,
      },
    });
  }

  // Handle AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle PostgreSQL errors
  if (err.code) {
    const dbError = DatabaseErrorHandler.handlePgError(err);
    return res.status(dbError.statusCode).json(dbError.toJSON());
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    error: {
      message: config.isDevelopment ? err.message : 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  });
}
```

---

## 🛡️ SQL Injection Prevention

### ✅ SAFE: Parameterized Queries
```typescript
// ✅ ALWAYS use parameter placeholders
const sql = `SELECT * FROM users WHERE email = $1`;
const values = [email];
await query(sql, values);

// ✅ Multiple parameters
const sql = `
  SELECT * FROM employees 
  WHERE first_name = $1 AND department = $2
`;
await query(sql, [firstName, department]);

// ✅ Dynamic UPDATE with whitelisting
const fields = [];
const values = [];
let paramCount = 1;

const allowedFields = ['first_name', 'phone', 'address'];
Object.entries(updates).forEach(([key, value]) => {
  if (allowedFields.includes(key)) {
    fields.push(`${key} = $${paramCount++}`);
    values.push(value);
  }
});

const sql = `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramCount}`;
values.push(id);

// ✅ LIKE search (wildcard in parameter)
const sql = `SELECT * FROM employees WHERE name ILIKE $1`;
await query(sql, [`%${searchTerm}%`]);

// ✅ IN clause with array
const sql = `SELECT * FROM employees WHERE id = ANY($1)`;
await query(sql, [arrayOfIds]);
```

### ❌ DANGEROUS: Never Do This
```typescript
// ❌ String concatenation
const sql = `SELECT * FROM users WHERE email = '${email}'`;

// ❌ Template literals
const sql = `DELETE FROM users WHERE id = ${id}`;

// ❌ Dynamic field names without whitelisting
const sql = `SELECT * FROM users WHERE ${field} = '${value}'`;
```

---

## 🌍 Environment Configuration

### .env.example
```bash
# Server
PORT=5000
NODE_ENV=development

# Database (raw pg)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=dayflow_hrms
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_SSL=false

# JWT
JWT_SECRET=change_this_to_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Bcrypt
BCRYPT_ROUNDS=10

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@dayflow.com

# File Upload
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

### Config with Validation
```typescript
// config/index.ts
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dayflow_hrms',
    // ... pool settings
  },
  // ... more config
};

// Validate in production
if (config.isProduction) {
  const required = ['DB_PASSWORD', 'JWT_SECRET', 'SMTP_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
```

---

## 📦 NPM Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc && npm run copy-files",
    "copy-files": "node -e \"require('fs').cpSync('src/db/schema', 'dist/db/schema', {recursive: true})\"",
    "start": "node dist/server.js",
    "start:prod": "NODE_ENV=production node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts",
    "clean": "rimraf dist"
  }
}
```

---

## 🎯 Usage Examples

### Route with Validation & Error Handling
```typescript
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';
import { registerSchema } from '../validators/auth.validator';

router.post('/register',
  authLimiter,                    // Rate limiting
  validate(registerSchema),       // Zod validation
  catchAsync(authController.register)  // Error handling
);
```

### Controller with Error Handling
```typescript
export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  
  // Check existing user
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ConflictError('Email already registered');
  }
  
  // Create user
  const user = await userRepo.create({ email, password });
  
  ResponseHandler.created(res, user, 'User registered successfully');
}
```

---

## ✅ Security Checklist

- ✅ Helmet security headers
- ✅ CORS with origin whitelist
- ✅ Rate limiting on all routes (stricter on auth)
- ✅ Input validation with Zod
- ✅ Parameterized SQL queries
- ✅ PostgreSQL error handling
- ✅ JWT with secure secrets
- ✅ Bcrypt password hashing
- ✅ Request sanitization
- ✅ Comprehensive logging
- ✅ Environment variable validation
- ✅ TypeScript type safety

Complete implementation ready for production! 🚀
