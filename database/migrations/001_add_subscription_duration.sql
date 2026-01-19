-- Migration: Süreli Subscription Desteği
-- Tarih: 2026-01-19

-- Products tablosuna yeni alanlar ekle
ALTER TABLE products
ADD COLUMN IF NOT EXISTS subscription_duration INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS duration_options JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS allow_payment_mode_choice BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_payment_mode VARCHAR(20) DEFAULT 'recurring';

-- Subscriptions tablosuna yeni alanlar ekle
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(20) DEFAULT 'recurring',
ADD COLUMN IF NOT EXISTS total_periods INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS completed_periods INTEGER DEFAULT 0;

-- Orders tablosuna yeni alanlar ekle (süreli subscription tracking için)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS subscription_duration INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(20) DEFAULT NULL;

-- Yorum:
-- subscription_duration: null = sınırsız, sayı = ay cinsinden
-- duration_options: [3, 6, 12] gibi JSON array
-- allow_payment_mode_choice: true ise kullanıcı recurring/upfront seçebilir
-- default_payment_mode: 'recurring' (aylık) veya 'upfront' (peşin)
-- payment_mode: 'recurring' = her ay ödeme, 'upfront' = toplu peşin ödeme
