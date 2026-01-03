# Dayflow HRMS - Database Migrations

This directory contains PostgreSQL database schema and migration files for the Dayflow HRMS application.

## Quick Start

### Prerequisites
- PostgreSQL 13 or higher
- psql command-line tool
- Database user with CREATE privileges

### Setup Database

1. **Create Database**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE dayflow_hrms;
CREATE USER dayflow_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;
\q
```

2. **Run Schema Migration**
```bash
# Apply the complete schema
psql -U dayflow_user -d dayflow_hrms -f schema.sql
```

3. **Verify Installation**
```bash
# Check tables
psql -U dayflow_user -d dayflow_hrms -c "\dt"

# Check enums
psql -U dayflow_user -d dayflow_hrms -c "\dT"

# Check views
psql -U dayflow_user -d dayflow_hrms -c "\dv"
```

## Schema Overview

### Core Tables

#### 1. **users** - Authentication & Authorization
- Primary user accounts with login credentials
- Links to employees table (1:1 relationship)
- Supports email verification and password reset
- Role-based access control (EMPLOYEE, HR_ADMIN, MANAGER, SUPER_ADMIN)

#### 2. **employees** - Employee Master Data
- Complete employee information (personal, contact, job details)
- References users table via `user_id`
- Stores documents as JSONB
- Tracks leave balances
- Self-referencing for manager hierarchy

#### 3. **attendance_records** - Daily Attendance
- Daily check-in/check-out records
- Auto-calculates work hours
- Tracks late arrivals
- Unique constraint: one record per employee per day

#### 4. **leave_requests** - Leave Management
- Employee leave applications
- Approval workflow (PENDING → APPROVED/REJECTED)
- Multiple leave types (PAID, SICK, CASUAL, etc.)
- Approver tracking with comments

#### 5. **salary_structures** - Salary Templates
- Reusable salary component templates
- Auto-calculates gross and net salary
- Includes allowances and deductions
- PF, tax calculations

#### 6. **payroll_records** - Monthly Payroll
- Monthly salary calculations
- Captures salary components at generation time
- Attendance-based adjustments (LOP)
- Payment status tracking
- Unique constraint: one record per employee per month

#### 7. **notifications** - User Notifications
- In-app notification system
- JSONB payload for flexible data
- Read/unread tracking
- Multiple notification types

#### 8. **audit_logs** - System Audit Trail
- Tracks all critical actions
- Stores old and new values (JSONB)
- User and IP tracking
- Compliance and security

#### 9. **system_settings** - Configuration
- System-wide settings
- Work timings, leave quotas
- Threshold configurations

### Custom Types (ENUMs)

```sql
user_role: EMPLOYEE, HR_ADMIN, MANAGER, SUPER_ADMIN
attendance_status: PRESENT, ABSENT, HALF_DAY, LEAVE, WORK_FROM_HOME, ON_DUTY
leave_type: PAID, SICK, CASUAL, UNPAID, MATERNITY, PATERNITY, BEREAVEMENT, COMPENSATORY
leave_status: PENDING, APPROVED, REJECTED, CANCELLED
employment_status: ACTIVE, INACTIVE, TERMINATED, RESIGNED, ON_NOTICE
notification_type: LEAVE_REQUEST, LEAVE_APPROVED, LEAVE_REJECTED, ATTENDANCE_ALERT, PAYROLL_GENERATED, etc.
payment_status: PENDING, PROCESSED, FAILED, CANCELLED
```

### Views

#### v_employee_details
Complete employee information with user, salary, and manager details.

#### v_monthly_attendance_summary
Monthly attendance statistics per employee (present days, absents, leaves, avg hours).

## Migration Order

The schema.sql file is designed to run sequentially:

1. **Extensions** - UUID, CITEXT
2. **ENUMs** - Custom types
3. **Tables** - In dependency order:
   - users (independent)
   - salary_structures (independent)
   - employees (depends on users, salary_structures)
   - attendance_records (depends on employees)
   - leave_requests (depends on employees)
   - payroll_records (depends on employees, salary_structures)
   - notifications (depends on users)
   - audit_logs (depends on users)
   - system_settings (independent)
4. **Triggers** - Auto-update timestamps
5. **Views** - Convenience views
6. **Initial Data** - Default settings
7. **Version Tracking** - Schema version

## Key Features

### 1. **Automatic Timestamps**
All tables with `updated_at` column automatically update on row modification.

### 2. **Generated Columns**
- `work_hours` in attendance_records (calculated from check-in/check-out)
- `gross_salary` and `net_salary` in salary_structures

### 3. **Data Integrity**
- Foreign key constraints
- Unique constraints (email, employee_id, attendance per day, payroll per month)
- Check constraints (date ranges, valid values)

### 4. **Indexing Strategy**
- Primary keys (automatic)
- Foreign keys (for joins)
- Frequently queried columns (email, date, status)
- Composite indexes for common query patterns
- GIN indexes for JSONB columns

### 5. **JSONB Usage**
- `documents` in employees (flexible document storage)
- `payload` in notifications (flexible notification data)
- `old_values`/`new_values` in audit_logs (change tracking)

## Sample Queries

### Get employee with full details
```sql
SELECT * FROM v_employee_details WHERE employee_id = 'EMP001';
```

### Get monthly attendance for an employee
```sql
SELECT * FROM v_monthly_attendance_summary 
WHERE employee_id = 1 AND year = 2026 AND month = 1;
```

### Get pending leave requests for approval
```sql
SELECT 
    lr.id,
    e.first_name || ' ' || e.last_name AS employee_name,
    lr.leave_type,
    lr.start_date,
    lr.end_date,
    lr.total_days,
    lr.remarks
FROM leave_requests lr
JOIN employees e ON lr.employee_id = e.id
WHERE lr.status = 'PENDING'
ORDER BY lr.created_at;
```

### Get current month payroll summary
```sql
SELECT 
    e.first_name || ' ' || e.last_name AS employee_name,
    pr.gross_salary,
    pr.total_deductions,
    pr.net_salary,
    pr.payment_status
FROM payroll_records pr
JOIN employees e ON pr.employee_id = e.id
WHERE pr.year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND pr.month = EXTRACT(MONTH FROM CURRENT_DATE);
```

### Get unread notifications for a user
```sql
SELECT * FROM notifications
WHERE user_id = 'uuid-here' AND is_read = FALSE
ORDER BY created_at DESC;
```

## Backup and Restore

### Backup
```bash
# Full database backup
pg_dump -U dayflow_user -d dayflow_hrms -F c -f dayflow_hrms_backup.dump

# Schema only
pg_dump -U dayflow_user -d dayflow_hrms --schema-only -f schema_backup.sql

# Data only
pg_dump -U dayflow_user -d dayflow_hrms --data-only -f data_backup.sql
```

### Restore
```bash
# From custom format
pg_restore -U dayflow_user -d dayflow_hrms -c dayflow_hrms_backup.dump

# From SQL file
psql -U dayflow_user -d dayflow_hrms -f schema_backup.sql
```

## Performance Tuning

### Analyze Tables
```sql
ANALYZE;
```

### Check Index Usage
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

### Find Missing Indexes
```sql
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY abs(correlation) DESC;
```

## Security Best Practices

1. **Never use the postgres superuser** for application connections
2. **Use strong passwords** for database users
3. **Enable SSL/TLS** for database connections in production
4. **Regular backups** - automated daily backups
5. **Audit logs** - monitor all sensitive operations
6. **Row-level security** - implement if multi-tenant setup needed
7. **Parameterized queries** - prevent SQL injection

## Troubleshooting

### Common Issues

**Issue: Permission denied**
```sql
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dayflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dayflow_user;
```

**Issue: Extension not available**
```bash
# Install PostgreSQL contrib package
sudo apt-get install postgresql-contrib
```

**Issue: Connection refused**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection settings in postgresql.conf
listen_addresses = 'localhost'
port = 5432
```

## Future Migrations

To add new migrations, create separate migration files:

```
database/
  ├── schema.sql (initial schema)
  ├── migrations/
  │   ├── 001_initial_schema.sql
  │   ├── 002_add_biometric_attendance.sql
  │   ├── 003_add_performance_reviews.sql
  │   └── README.md
  └── README.md (this file)
```

Track applied migrations in the `schema_migrations` table.

## Support

For issues or questions:
1. Check this README
2. Review schema.sql comments
3. Check PostgreSQL documentation
4. Open an issue in the project repository
