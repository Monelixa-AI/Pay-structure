-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  message_id VARCHAR(255),
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

-- Contact replies fields
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS replied_by UUID REFERENCES admin_users(id),
  ADD COLUMN IF NOT EXISTS reply_message TEXT;

-- Email Settings
INSERT INTO settings (key, value) VALUES
  ('email_enabled', 'true'),
  ('email_from_name', 'Monelixa'),
  ('email_from_address', 'noreply@monelixa.com'),
  ('email_reply_to', 'support@monelixa.com'),
  ('email_welcome_enabled', 'true'),
  ('email_payment_enabled', 'true'),
  ('email_subscription_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
