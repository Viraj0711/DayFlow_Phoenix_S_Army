-- ============================================================================
-- Email Verification Tokens Migration
-- ============================================================================
-- Add this to your existing schema or run separately
-- Version: 1.0.1
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure only one active token per user
    CONSTRAINT unique_active_token_per_user UNIQUE(user_id, token)
);

-- Indexes for quick token lookup
CREATE INDEX idx_verification_token ON email_verification_tokens(token);
CREATE INDEX idx_verification_user ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_expires ON email_verification_tokens(expires_at);

-- Cleanup old tokens (optional scheduled job)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_tokens
    WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Update schema version
INSERT INTO schema_migrations (version) VALUES ('1.0.1')
ON CONFLICT (version) DO NOTHING;
