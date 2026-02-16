-- Audit logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  business_id uuid REFERENCES businesses(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  amount decimal NOT NULL,
  currency text DEFAULT 'USD',
  status text CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id text,
  subscription_tier text,
  created_at timestamptz DEFAULT now()
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email_type text NOT NULL,
  recipient text NOT NULL,
  subject text,
  status text CHECK (status IN ('sent', 'failed', 'bounced')),
  resend_id text,
  created_at timestamptz DEFAULT now()
);

-- Add Stripe columns to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Missing indexes
CREATE INDEX IF NOT EXISTS idx_businesses_verified ON businesses(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_businesses_tier ON businesses(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_partnerships_dates ON partnerships(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipes_direction ON swipes(direction) WHERE direction = 'right';
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses USING gin(to_tsvector('english', name || ' ' || business_type || ' ' || COALESCE(description, '')));

-- RLS policies for new tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can view own email logs"
  ON email_logs FOR SELECT
  USING (user_id = auth.uid());

-- Trigger function for automated audit logging
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to key tables
CREATE TRIGGER audit_businesses
  AFTER INSERT OR UPDATE OR DELETE ON businesses
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_partnerships
  AFTER INSERT OR UPDATE OR DELETE ON partnerships
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_partnership_agreements
  AFTER INSERT OR UPDATE OR DELETE ON partnership_agreements
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
