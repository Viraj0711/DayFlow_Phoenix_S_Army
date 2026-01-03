# Database Setup Guide

## Prerequisites

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, remember your postgres user password
   - Default port: 5432

## Quick Setup Steps

### Option 1: Using PowerShell (Recommended)

```powershell
# 1. Navigate to backend directory
cd D:\DayFlow\DayFlow_Phoenix_S_Army\backend

# 2. Set PostgreSQL password (replace with your actual password)
$env:PGPASSWORD="your_postgres_password"

# 3. Create database
psql -U postgres -c "CREATE DATABASE dayflow_hrms;"

# 4. Run schema files in order
psql -U postgres -d dayflow_hrms -f src/db/schema/users.sql
psql -U postgres -d dayflow_hrms -f src/db/schema/employees.sql
psql -U postgres -d dayflow_hrms -f src/db/schema/leave_management.sql

# 5. Verify setup
psql -U postgres -d dayflow_hrms -c "\dt"
psql -U postgres -d dayflow_hrms -c "SELECT * FROM users;"
```

### Option 2: Using pgAdmin (GUI)

1. Open pgAdmin
2. Create new database: `dayflow_hrms`
3. Open Query Tool
4. Load and run each SQL file in order:
   - `src/db/schema/users.sql`
   - `src/db/schema/employees.sql`
   - `src/db/schema/leave_management.sql`

### Option 3: Using psql Interactive

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dayflow_hrms;

# Connect to the database
\c dayflow_hrms

# Run each schema file
\i 'D:/DayFlow/DayFlow_Phoenix_S_Army/backend/src/db/schema/users.sql'
\i 'D:/DayFlow/DayFlow_Phoenix_S_Army/backend/src/db/schema/employees.sql'
\i 'D:/DayFlow/DayFlow_Phoenix_S_Army/backend/src/db/schema/leave_management.sql'

# Verify
\dt
SELECT * FROM users;
```

## Update .env File

After database is created, update `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dayflow_hrms
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

## Default Login Credentials

After setup, you can login with:

**Admin Account:**
- Email: `admin@dayflow.com`
- Password: `admin123`

**HR Account:**
- Email: `hr@dayflow.com`
- Password: `admin123`

**Employee Account:**
- Email: `employee@dayflow.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change these passwords in production!

## Verify Setup

```powershell
# Check if tables exist
psql -U postgres -d dayflow_hrms -c "\dt"

# Check users
psql -U postgres -d dayflow_hrms -c "SELECT employee_id, email, role FROM users;"

# Check employees
psql -U postgres -d dayflow_hrms -c "SELECT employee_id, first_name, last_name FROM employees;"
```

## Troubleshooting

### Error: "database already exists"
```sql
DROP DATABASE dayflow_hrms;
CREATE DATABASE dayflow_hrms;
```

### Error: "psql is not recognized"
Add PostgreSQL bin to PATH:
```
C:\Program Files\PostgreSQL\16\bin
```

### Error: "password authentication failed"
- Reset postgres password using pgAdmin
- Or reinstall PostgreSQL

## Next Steps

After database setup:
1. Restart the backend server
2. Try logging in at http://localhost:3000
3. Use the credentials above
