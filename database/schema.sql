-- ============================================================================
-- Dayflow HRMS - PostgreSQL Database Schema
-- ============================================================================
-- Migration Version: 1.0.0
-- Description: Initial database schema for Dayflow HRMS
-- Run order: Execute this file sequentially from top to bottom
-- Usage: psql -U your_user -d dayflow_hrms -f schema.sql
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text comparison
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM (
    'EMPLOYEE',
    'HR_ADMIN',
    'MANAGER',
    'SUPER_ADMIN'
);

-- Attendance status
CREATE TYPE attendance_status AS ENUM (
    'PRESENT',
    'ABSENT',
    'HALF_DAY',
    'LEAVE',
    'WORK_FROM_HOME',
    'ON_DUTY'
);

-- Leave types
CREATE TYPE leave_type AS ENUM (
    'PAID',
    'SICK',
    'CASUAL',
    'UNPAID',
    'MATERNITY',
    'PATERNITY',
    'BEREAVEMENT',
    'COMPENSATORY'
);

-- Leave request status
CREATE TYPE leave_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);

-- Employment status
CREATE TYPE employment_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'TERMINATED',
    'RESIGNED',
    'ON_NOTICE'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'LEAVE_REQUEST',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'ATTENDANCE_ALERT',
    'PAYROLL_GENERATED',
    'PROFILE_UPDATE',
    'SYSTEM_ANNOUNCEMENT',
    'DOCUMENT_UPLOADED'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'PROCESSED',
    'FAILED',
    'CANCELLED'
);

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- Core authentication and authorization table
-- Links to employees table via one-to-one relationship

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- TABLE: salary_structures
-- ============================================================================
-- Defines salary components and structure templates
-- Must be created before employees table due to FK constraint

CREATE TABLE salary_structures (
    id SERIAL PRIMARY KEY,
    structure_name VARCHAR(100) NOT NULL,
    basic_salary DECIMAL(12, 2) NOT NULL,
    hra DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    transport_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    medical_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    special_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    provident_fund_percent DECIMAL(5, 2) NOT NULL DEFAULT 12.00,
    professional_tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    income_tax_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    gross_salary DECIMAL(12, 2) GENERATED ALWAYS AS (
        basic_salary + hra + transport_allowance + medical_allowance + special_allowance
    ) STORED,
    net_salary DECIMAL(12, 2) GENERATED ALWAYS AS (
        basic_salary + hra + transport_allowance + medical_allowance + special_allowance -
        (basic_salary * provident_fund_percent / 100) - professional_tax - other_deductions
    ) STORED,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for salary_structures
CREATE INDEX idx_salary_structures_active ON salary_structures(is_active);

-- ============================================================================
-- TABLE: employees
-- ============================================================================
-- Stores detailed employee information
-- One-to-one relationship with users table

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    blood_group VARCHAR(10),
    
    -- Contact Information
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    personal_email CITEXT,
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Job Information
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    date_of_joining DATE NOT NULL,
    employment_status employment_status NOT NULL DEFAULT 'ACTIVE',
    reporting_manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Salary Information
    salary_structure_id INTEGER REFERENCES salary_structures(id) ON DELETE SET NULL,
    
    -- Additional Information
    profile_picture_url TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    -- Documents (stored as JSONB)
    -- Example: {"aadhar": "url", "pan": "url", "resume": "url"}
    documents JSONB DEFAULT '{}',
    
    -- Leave Balance
    paid_leave_balance INTEGER NOT NULL DEFAULT 20,
    sick_leave_balance INTEGER NOT NULL DEFAULT 10,
    casual_leave_balance INTEGER NOT NULL DEFAULT 7,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for employees table
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_designation ON employees(designation);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_manager ON employees(reporting_manager_id);
CREATE INDEX idx_employees_joining_date ON employees(date_of_joining);
CREATE INDEX idx_employees_documents ON employees USING GIN(documents);

-- ============================================================================
-- TABLE: attendance_records
-- ============================================================================
-- Tracks daily attendance for all employees

CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_at TIMESTAMP WITH TIME ZONE,
    check_out_at TIMESTAMP WITH TIME ZONE,
    status attendance_status NOT NULL DEFAULT 'ABSENT',
    work_hours DECIMAL(4, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN check_in_at IS NOT NULL AND check_out_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (check_out_at - check_in_at)) / 3600
            ELSE 0
        END
    ) STORED,
    remarks TEXT,
    is_late BOOLEAN DEFAULT FALSE,
    late_by_minutes INTEGER DEFAULT 0,
    location_check_in VARCHAR(255),
    location_check_out VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per employee per day
    CONSTRAINT unique_attendance_per_day UNIQUE(employee_id, date)
);

-- Indexes for attendance_records
CREATE INDEX idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date_range ON attendance_records(date DESC);

-- ============================================================================
-- TABLE: leave_requests
-- ============================================================================
-- Manages employee leave requests and approvals

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    remarks TEXT,
    status leave_status NOT NULL DEFAULT 'PENDING',
    
    -- Approval Information
    approver_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    approver_comment TEXT,
    decided_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_total_days CHECK (total_days > 0)
);

-- Indexes for leave_requests
CREATE INDEX idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_type ON leave_requests(leave_type);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_approver ON leave_requests(approver_id);
CREATE INDEX idx_leave_created ON leave_requests(created_at DESC);

-- ============================================================================
-- TABLE: payroll_records
-- ============================================================================
-- Stores monthly payroll calculations and payment records

CREATE TABLE payroll_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_structure_id INTEGER REFERENCES salary_structures(id) ON DELETE SET NULL,
    
    -- Period Information
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    
    -- Salary Components (captured at time of generation)
    basic_salary DECIMAL(12, 2) NOT NULL,
    hra DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    transport_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    medical_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    special_allowance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Deductions
    provident_fund DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    professional_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    income_tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Attendance-based adjustments
    days_present INTEGER NOT NULL DEFAULT 0,
    days_absent INTEGER NOT NULL DEFAULT 0,
    days_leave INTEGER NOT NULL DEFAULT 0,
    loss_of_pay_days INTEGER NOT NULL DEFAULT 0,
    loss_of_pay_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Bonuses and Incentives
    bonus DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    incentive DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Calculated Totals
    gross_salary DECIMAL(12, 2) NOT NULL,
    total_deductions DECIMAL(12, 2) NOT NULL,
    net_salary DECIMAL(12, 2) NOT NULL,
    
    -- Payment Information
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    payment_date DATE,
    payment_reference VARCHAR(255),
    
    -- Metadata
    generated_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure one payroll record per employee per month
    CONSTRAINT unique_payroll_per_month UNIQUE(employee_id, month, year)
);

-- Indexes for payroll_records
CREATE INDEX idx_payroll_employee ON payroll_records(employee_id);
CREATE INDEX idx_payroll_period ON payroll_records(year, month);
CREATE INDEX idx_payroll_status ON payroll_records(payment_status);
CREATE INDEX idx_payroll_generated ON payroll_records(generated_at DESC);

-- ============================================================================
-- TABLE: notifications
-- ============================================================================
-- Stores system notifications for users

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Additional data stored as JSONB
    -- Example: {"leave_id": 123, "approver_name": "John Doe"}
    payload JSONB DEFAULT '{}',
    
    -- Notification state
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_payload ON notifications USING GIN(payload);

-- ============================================================================
-- TABLE: audit_logs
-- ============================================================================
-- Tracks all important system actions for compliance

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================================
-- TABLE: system_settings
-- ============================================================================
-- Stores system-wide configuration

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_structure_updated_at BEFORE UPDATE ON salary_structures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Complete employee information with user details
CREATE VIEW v_employee_details AS
SELECT 
    e.id,
    e.user_id,
    u.employee_id,
    u.email,
    u.role,
    e.first_name,
    e.middle_name,
    e.last_name,
    CONCAT(e.first_name, ' ', e.last_name) AS full_name,
    e.phone,
    e.designation,
    e.department,
    e.date_of_joining,
    e.employment_status,
    e.profile_picture_url,
    s.structure_name AS salary_structure,
    s.gross_salary,
    s.net_salary,
    manager.first_name || ' ' || manager.last_name AS manager_name,
    e.paid_leave_balance,
    e.sick_leave_balance,
    e.casual_leave_balance
FROM employees e
JOIN users u ON e.user_id = u.id
LEFT JOIN salary_structures s ON e.salary_structure_id = s.id
LEFT JOIN employees manager ON e.reporting_manager_id = manager.id;

-- View: Monthly attendance summary
CREATE VIEW v_monthly_attendance_summary AS
SELECT 
    employee_id,
    EXTRACT(YEAR FROM date) AS year,
    EXTRACT(MONTH FROM date) AS month,
    COUNT(*) FILTER (WHERE status = 'PRESENT') AS present_days,
    COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent_days,
    COUNT(*) FILTER (WHERE status = 'HALF_DAY') AS half_days,
    COUNT(*) FILTER (WHERE status = 'LEAVE') AS leave_days,
    COUNT(*) FILTER (WHERE is_late = TRUE) AS late_days,
    ROUND(AVG(work_hours), 2) AS avg_work_hours
FROM attendance_records
GROUP BY employee_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date);

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('work_start_time', '09:00:00', 'Standard work start time'),
    ('work_end_time', '18:00:00', 'Standard work end time'),
    ('late_threshold_minutes', '15', 'Minutes after which employee is marked late'),
    ('half_day_hours', '4', 'Minimum hours for half day'),
    ('full_day_hours', '8', 'Minimum hours for full day'),
    ('paid_leave_annual', '20', 'Annual paid leave quota'),
    ('sick_leave_annual', '10', 'Annual sick leave quota'),
    ('casual_leave_annual', '7', 'Annual casual leave quota');

-- ============================================================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dayflow_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dayflow_app_user;

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

CREATE TABLE schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES ('1.0.0');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
