-- ============================================================================
-- Dayflow HRMS - Seed Admin User
-- ============================================================================
-- Creates a verified admin user for testing and initial access
-- Credentials: admin@dayflow.com / admin123
-- ============================================================================

-- Insert admin user (password hash is for 'admin123')
-- Generated using bcrypt with 10 salt rounds
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
    '$2b$10$YourHashedPasswordHere',  -- Replace with actual hash
    'HR_ADMIN',
    TRUE,
    TRUE
) ON CONFLICT (email) DO UPDATE 
SET 
    email_verified = TRUE,
    is_active = TRUE,
    role = 'HR_ADMIN';

-- Note: To generate the password hash, run this in your Node.js backend:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('admin123', 10);
-- console.log(hash);
