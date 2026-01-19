-- Customer and billing updates

-- Ensure optional columns exist
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'customers'
      AND policyname = 'Users can read own customer profile'
  ) THEN
    CREATE POLICY "Users can read own customer profile"
      ON customers
      FOR SELECT
      USING (auth.uid() = auth_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'customers'
      AND policyname = 'Users can update own customer profile'
  ) THEN
    CREATE POLICY "Users can update own customer profile"
      ON customers
      FOR UPDATE
      USING (auth.uid() = auth_user_id);
  END IF;
END $$;
