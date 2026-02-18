-- ============================================================
-- Verification system + city threshold update
-- ============================================================

-- 1. Add business_category and verification_status to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_category TEXT
  CHECK (business_category IN ('brick-and-mortar', 'online', 'freelancer', 'entrepreneur', 'service-provider'));

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS places_match_confidence FLOAT;

-- 2. Manual verification requests table (for online/freelancer/entrepreneur businesses)
CREATE TABLE IF NOT EXISTS manual_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  business_category TEXT NOT NULL,
  website TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE (business_id)
);

CREATE INDEX IF NOT EXISTS idx_manual_verification_status ON manual_verification_requests(status);

ALTER TABLE manual_verification_requests ENABLE ROW LEVEL SECURITY;

-- Businesses can insert/read their own requests
CREATE POLICY "business owners manage own verification requests"
  ON manual_verification_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_id AND b.owner_id = auth.uid()
    )
  );

-- Service role (admin) can manage all
CREATE POLICY "service role manages all verification requests"
  ON manual_verification_requests
  FOR ALL
  USING (auth.role() = 'service_role');

-- 3. Update city threshold to 100 businesses
UPDATE city_launch_status SET threshold = 100 WHERE threshold = 50;

-- Also update the ensure_city_launch_status function to default to 100
CREATE OR REPLACE FUNCTION ensure_city_launch_status(p_city TEXT, p_state TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO city_launch_status (city, state, threshold, current_count, launched)
  VALUES (p_city, p_state, 100, 0, FALSE)
  ON CONFLICT (city) DO NOTHING;
END;
$$;
