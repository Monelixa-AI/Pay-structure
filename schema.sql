-- MONELIXA - Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PRODUCTS (Urunler)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TRY',
    type VARCHAR(20) NOT NULL CHECK (type IN ('one_time', 'subscription')),
    billing_period VARCHAR(20) CHECK (billing_period IN ('monthly', 'yearly')),
    features JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CUSTOMERS (Musteriler)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIPTIONS (Abonelikler)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    stripe_subscription_id VARCHAR(255),
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    payment_gateway VARCHAR(50) DEFAULT 'stripe',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDERS (Siparisler/Odemeler)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    subscription_id UUID REFERENCES subscriptions(id),
    product_id UUID REFERENCES products(id),
    customer_email VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TRY',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_provider VARCHAR(50) NOT NULL,
    provider_session_id VARCHAR(255),
    provider_payment_id VARCHAR(255),
    invoice_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SETTINGS (Ayarlar)
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    category VARCHAR(100) DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO settings (key, value, type, category, description) VALUES
    ('site_name', 'Monelixa', 'string', 'general', 'Site adi'),
    ('site_description', 'Premium Odeme Platformu', 'string', 'general', 'Site aciklamasi'),
    ('logo_url', '', 'string', 'branding', 'Logo URL'),
    ('logo_dark_url', '', 'string', 'branding', 'Koyu tema logo URL'),
    ('favicon_url', '', 'string', 'branding', 'Favicon URL'),
    ('primary_color', '#ef4444', 'string', 'branding', 'Ana renk'),
    ('secondary_color', '#f97316', 'string', 'branding', 'Ikincil renk'),
    ('currency', 'TRY', 'string', 'payment', 'Para birimi'),
    ('active_gateway', 'stripe', 'string', 'payment', 'Aktif odeme yontemi'),
    ('default_payment_provider', 'stripe', 'string', 'payment', 'Varsayilan odeme saglayici'),
    ('stripe_enabled', 'true', 'boolean', 'payment', 'Stripe aktif mi'),
    ('paytr_enabled', 'false', 'boolean', 'payment', 'PayTR aktif mi'),
    ('allow_provider_switch', 'true', 'boolean', 'payment', 'Odeme saglayici secimi'),
    ('contact_email', '', 'string', 'contact', 'Iletisim email'),
    ('contact_phone', '', 'string', 'contact', 'Iletisim telefon'),
    ('support_email', '', 'string', 'contact', 'Destek email'),
    ('language', 'tr', 'string', 'general', 'Varsayilan dil'),
    ('maintenance_mode', 'false', 'boolean', 'general', 'Bakim modu'),
    ('meta_title', '', 'string', 'seo', 'Meta baslik'),
    ('meta_description', '', 'string', 'seo', 'Meta aciklama'),
    ('email_notifications', 'true', 'boolean', 'email', 'Email bildirimleri'),
    ('email_enabled', 'true', 'boolean', 'email', 'Email enabled'),
    ('email_from_name', 'Monelixa', 'string', 'email', 'Email from name'),
    ('email_from_address', 'noreply@monelixa.com', 'string', 'email', 'Email from address'),
    ('email_reply_to', 'support@monelixa.com', 'string', 'email', 'Email reply-to'),
    ('email_welcome_enabled', 'true', 'boolean', 'email', 'Welcome email enabled'),
    ('email_payment_enabled', 'true', 'boolean', 'email', 'Payment email enabled'),
    ('email_subscription_enabled', 'true', 'boolean', 'email', 'Subscription email enabled'),
    ('cloudflare_enabled', 'true', 'boolean', 'security', 'Cloudflare aktif mi');

-- ADMIN_USERS (Admin Kullanicilari)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT_LOGS (Islem Gecmisi)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTACT_MESSAGES (Iletisim Mesajlari)
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    ip_address VARCHAR(50),
    status VARCHAR(20) DEFAULT 'new',
    admin_notes TEXT,
    is_read BOOLEAN DEFAULT false,
    replied_at TIMESTAMP WITH TIME ZONE,
    replied_by UUID REFERENCES admin_users(id),
    reply_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RATE_LIMITS
CREATE TABLE rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    identifier VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMAIL_TEMPLATES (Email Sablonlari)
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WEBHOOK_LOGS
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_id VARCHAR(255),
    payload JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMAIL_LOGS
CREATE TABLE email_logs (
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

INSERT INTO email_templates (name, subject, body_html, variables) VALUES
    ('payment_success', 'Odemeniz Basariyla Alindi - {{product_name}}',
      '<h1>Merhaba {{customer_name}},</h1><p>{{product_name}} icin odemeniz basariyla alinmistir.</p><p>Tutar: {{amount}} {{currency}}</p>',
      '["customer_name", "product_name", "amount", "currency"]'::jsonb),
    ('subscription_canceled', 'Aboneliginiz Iptal Edildi',
      '<h1>Merhaba {{customer_name}},</h1><p>Aboneliginiz iptal edilmistir. Donem sonuna kadar erisiminiz devam edecektir.</p><p>Bitis: {{end_date}}</p>',
      '["customer_name", "end_date"]'::jsonb),
    ('contact_reply', 'Re: {{subject}}',
      '<h1>Merhaba {{name}},</h1><p>{{reply_message}}</p>',
      '["name", "subject", "reply_message"]'::jsonb);

-- INDEXES
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_provider_payment_id ON orders(provider_payment_id);
CREATE INDEX idx_orders_provider_session_id ON orders(provider_session_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_contact_messages_is_read ON contact_messages(is_read);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_email_logs_type ON email_logs(type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_created_at ON rate_limits(created_at);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Opsiyonel, Auth icin
-- Simdilik devre disi, gerekirse aktiflestirin
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
