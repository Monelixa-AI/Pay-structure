-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  body_html TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO email_templates (name, subject, body_html, variables, is_active) VALUES
  (
    'welcome',
    'Welcome to Monelixa',
    '<h1>Welcome {{name}},</h1><p>Your account is ready.</p><p>Login: <a href="{{login_url}}">{{login_url}}</a></p>',
    '["name","login_url"]'::jsonb,
    true
  ),
  (
    'payment_success',
    'Payment received - {{product_name}}',
    '<h1>Payment received</h1><p>Product: {{product_name}}</p><p>Amount: {{amount}} {{currency}}</p><p>Order: {{order_id}}</p>',
    '["product_name","amount","currency","order_id","customer_name"]'::jsonb,
    true
  ),
  (
    'payment_failed',
    'Payment failed - {{product_name}}',
    '<h1>Payment failed</h1><p>Product: {{product_name}}</p><p>Reason: {{reason}}</p><p>Order: {{order_id}}</p>',
    '["product_name","reason","order_id","customer_name"]'::jsonb,
    true
  ),
  (
    'subscription_created',
    'Subscription active - {{product_name}}',
    '<h1>Subscription active</h1><p>Product: {{product_name}}</p><p>Amount: {{amount}} {{currency}}</p>',
    '["product_name","amount","currency","customer_name"]'::jsonb,
    true
  ),
  (
    'subscription_cancelled',
    'Subscription cancelled',
    '<h1>Subscription cancelled</h1><p>Your subscription has been cancelled.</p>',
    '["product_name","customer_name"]'::jsonb,
    true
  ),
  (
    'subscription_renewal',
    'Subscription renewed',
    '<h1>Subscription renewed</h1><p>Amount: {{amount}} {{currency}}</p>',
    '["amount","currency","customer_name"]'::jsonb,
    true
  ),
  (
    'password_reset',
    'Reset your password',
    '<h1>Password reset</h1><p>Click to reset: <a href="{{reset_url}}">{{reset_url}}</a></p>',
    '["name","reset_url"]'::jsonb,
    true
  ),
  (
    'contact_form',
    'New contact message - {{subject}}',
    '<h1>New contact message</h1><p>From: {{name}} ({{email}})</p><p>Subject: {{subject}}</p><p>Message:</p><p>{{message}}</p>',
    '["name","email","subject","message"]'::jsonb,
    true
  ),
  (
    'contact_reply',
    'Reply: {{original_subject}}',
    '<h1>Reply</h1><p>{{reply_message}}</p><p>Original subject: {{original_subject}}</p><p>Original message:</p><p>{{original_message}}</p><p>Replied by: {{replied_by}}</p>',
    '["name","reply_message","original_subject","original_message","replied_by"]'::jsonb,
    true
  )
ON CONFLICT (name) DO NOTHING;
