# Quick Fix Guide for Login Issue

## Problem
Login fails with "Login failed. Please try again." error.

## Root Cause
1. Backend modified to skip email verification in development mode ✅
2. Database connection credentials updated in .env ✅  
3. **Admin user doesn't exist in database** ❌ ← THIS IS THE ISSUE

## Solution Options

### Option 1: Run SQL Manually in pgAdmin (EASIEST)

1. **Open pgAdmin**
   - Find it in Start Menu → PostgreSQL → pgAdmin

2. **Connect to your database**
   - Navigate to: Servers → PostgreSQL → Databases → dayflow_hrms

3. **Open Query Tool**
   - Right-click on `dayflow_hrms` → Query Tool

4. **Run this SQL**:
   ```sql
   -- Create admin user with password: admin123
   INSERT INTO users (
       employee_id,
       email,
       password_hash,
       role,
       email_verified,
       is_active
   ) VALUES (
       'EMP001',
       'admin@dayflow.com',
       '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQbgi9/MPaGOskngdiwu.',
       'HR_ADMIN',
       TRUE,
       TRUE
   ) ON CONFLICT (email) DO UPDATE 
   SET 
       email_verified = TRUE,
       is_active = TRUE,
       role = 'HR_ADMIN',
       password_hash = EXCLUDED.password_hash;
   ```

5. **Click Execute (F5)**

6. **Try logging in again** with:
   - Email: admin@dayflow.com
   - Password: admin123

### Option 2: Use the SQL File

1. Open the file: `QUICK_FIX_CREATE_ADMIN.sql`
2. Copy all contents
3. Paste into pgAdmin Query Tool
4. Execute

### Option 3: Use Signup API (if database is working)

Open PowerShell and run:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -ContentType "application/json" -Body (@{
    employeeId = "EMP001"
    email = "admin@dayflow.com"
    password = "admin123"
    role = "HR_ADMIN"
} | ConvertTo-Json)
```

Then login with: admin@dayflow.com / admin123

## Troubleshooting

### "Table 'users' doesn't exist"
Run the database schema first:
1. Open pgAdmin Query Tool
2. Open file: `database/schema.sql`
3. Execute it

### "Port 5000 connection refused"
Backend isn't running. In terminal:
```powershell
cd backend
npm run dev
```

### "Database connection failed"
1. Check if PostgreSQL is running:
   ```powershell
   Get-Service postgresql*
   ```
2. Check `.env` file in backend folder has correct password:
   ```
   DB_USER=postgres
   DB_PASSWORD=admin  # or your postgres password
   ```

### Still not working?
Check:
1. Is PostgreSQL installed and running?
2. Does the `dayflow_hrms` database exist?
3. Run the setup script: `.\setup-database.ps1`

## Login Credentials After Fix
- **Email**: admin@dayflow.com
- **Password**: admin123

## What Was Changed
1. ✅ Modified `backend/src/controllers/auth.controller.ts` to skip email verification in development
2. ✅ Updated `backend/.env` with postgres credentials
3. ✅ Created SQL script to insert admin user
4. ⏳ **WAITING**: You to run the SQL to create the admin user

Once you run the SQL in pgAdmin, you should be able to login immediately!
