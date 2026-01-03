-- ============================================================================
-- USERS & AUTHENTICATION SCHEMA
-- ============================================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_role_check CHECK (role IN ('EMPLOYEE', 'HR_ADMIN', 'SUPER_ADMIN')),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- VERIFICATION TOKENS TABLE
-- ============================================================================

CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT verification_tokens_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_expires_at ON verification_tokens(expires_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - Initial Admin User
-- ============================================================================

-- Password is 'admin123' (hashed with bcrypt)
-- You should change this in production!
INSERT INTO users (employee_id, email, password_hash, role, is_active, email_verified, created_at)
VALUES 
    ('ADMIN001', 'admin@dayflow.com', '$2b$10$mCGaZCgcFVH/paT2zhGrNOQAnzu2dXsCaKieBgYahOHZrNJGZ6LYW', 'SUPER_ADMIN', true, true, CURRENT_TIMESTAMP),
    ('HR001', 'hr@dayflow.com', '$2b$10$mCGaZCgcFVH/paT2zhGrNOQAnzu2dXsCaKieBgYahOHZrNJGZ6LYW', 'HR_ADMIN', true, true, CURRENT_TIMESTAMP),
    ('EMP001', 'employee@dayflow.com', '$2b$10$mCGaZCgcFVH/paT2zhGrNOQAnzu2dXsCaKieBgYahOHZrNJGZ6LYW', 'EMPLOYEE', true, true, CURRENT_TIMESTAMP)
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================================
-- VIEWS (Optional - for easier querying)
-- ============================================================================

CREATE OR REPLACE VIEW active_users AS
SELECT 
    id,
    employee_id,
    email,
    role,
    email_verified,
    last_login,
    created_at
FROM users
WHERE is_active = true;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user authentication and basic profile information';
COMMENT ON COLUMN users.employee_id IS 'Unique employee identifier (e.g., EMP001)';
COMMENT ON COLUMN users.email IS 'User email address (must be unique)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.role IS 'User role: EMPLOYEE, HR_ADMIN, or SUPER_ADMIN';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email';

COMMENT ON TABLE verification_tokens IS 'Email verification tokens';
COMMENT ON COLUMN verification_tokens.token IS 'Unique verification token sent to user email';
COMMENT ON COLUMN verification_tokens.expires_at IS 'Token expiration timestamp';
COMMENT ON COLUMN verification_tokens.is_used IS 'Whether the token has been used';
