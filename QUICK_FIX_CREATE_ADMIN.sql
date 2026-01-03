-- ============================================================================
-- Quick Fix: Create Admin User with Pre-Generated Hash
-- ============================================================================
-- Run this in pgAdmin Query Tool or psql
-- This creates an admin user that can login immediately
-- ============================================================================

-- Password: admin123
-- Hash generated with bcrypt, 10 rounds
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

-- Verify the user was created
SELECT id, employee_id, email, role, email_verified, is_active, created_at
FROM users 
WHERE email = 'admin@dayflow.com';
