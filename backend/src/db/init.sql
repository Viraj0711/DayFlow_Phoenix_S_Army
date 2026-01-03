-- ============================================================================
-- DATABASE INITIALIZATION SCRIPT
-- DayFlow HRMS - Complete Schema Setup
-- ============================================================================

-- This script should be run on a fresh PostgreSQL database
-- Run order: users.sql -> employees.sql -> leave_management.sql

-- ============================================================================
-- DATABASE SETUP
-- ============================================================================

-- Create database (run this manually if needed)
-- CREATE DATABASE dayflow_hrms;
-- \c dayflow_hrms;

-- ============================================================================
-- EXECUTE SCHEMA FILES IN ORDER
-- ============================================================================

-- 1. Users & Authentication
\i 'schema/users.sql'

-- 2. Employees
\i 'schema/employees.sql'

-- 3. Leave Management
\i 'schema/leave_management.sql'

-- ============================================================================
-- VERIFY INSTALLATION
-- ============================================================================

SELECT 'Database setup completed successfully!' AS status;

-- Show tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show seed users
SELECT employee_id, email, role, email_verified 
FROM users 
ORDER BY id;

-- Show seed employees
SELECT employee_id, first_name, last_name, department, designation 
FROM employees 
ORDER BY id;
