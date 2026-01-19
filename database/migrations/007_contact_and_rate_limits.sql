-- Contact messages and rate limits

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email
  ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages(created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  identifier VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);

CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
