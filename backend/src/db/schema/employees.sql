-- ============================================================================
-- EMPLOYEES SCHEMA
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS employees CASCADE;

-- ============================================================================
-- EMPLOYEES TABLE
-- ============================================================================

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    
    -- Employment Details
    designation VARCHAR(100),
    department VARCHAR(100),
    joining_date DATE NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
    employment_status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Reporting Structure
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Salary Information
    salary_amount DECIMAL(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT employees_gender_check CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    CONSTRAINT employees_employment_type_check CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')),
    CONSTRAINT employees_employment_status_check CHECK (employment_status IN ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE'))
);

-- Create indexes
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - Sample Employees
-- ============================================================================

-- Admin Employee
INSERT INTO employees (user_id, employee_id, first_name, last_name, designation, department, joining_date, employment_type, employment_status, salary_amount, created_at)
SELECT 
    u.id,
    'ADMIN001',
    'Admin',
    'User',
    'System Administrator',
    'IT',
    '2024-01-01',
    'FULL_TIME',
    'ACTIVE',
    120000.00,
    CURRENT_TIMESTAMP
FROM users u
WHERE u.employee_id = 'ADMIN001'
ON CONFLICT (employee_id) DO NOTHING;

-- HR Employee
INSERT INTO employees (user_id, employee_id, first_name, last_name, designation, department, joining_date, employment_type, employment_status, salary_amount, created_at)
SELECT 
    u.id,
    'HR001',
    'HR',
    'Manager',
    'HR Manager',
    'Human Resources',
    '2024-01-01',
    'FULL_TIME',
    'ACTIVE',
    95000.00,
    CURRENT_TIMESTAMP
FROM users u
WHERE u.employee_id = 'HR001'
ON CONFLICT (employee_id) DO NOTHING;

-- Regular Employee
INSERT INTO employees (user_id, employee_id, first_name, last_name, designation, department, joining_date, employment_type, employment_status, salary_amount, manager_id, created_at)
SELECT 
    u.id,
    'EMP001',
    'John',
    'Doe',
    'Software Engineer',
    'Engineering',
    '2024-02-01',
    'FULL_TIME',
    'ACTIVE',
    85000.00,
    (SELECT id FROM employees WHERE employee_id = 'ADMIN001' LIMIT 1),
    CURRENT_TIMESTAMP
FROM users u
WHERE u.employee_id = 'EMP001'
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE employees IS 'Stores detailed employee information';
COMMENT ON COLUMN employees.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN employees.employee_id IS 'Unique employee identifier matching users.employee_id';
COMMENT ON COLUMN employees.manager_id IS 'Reference to manager (another employee)';
