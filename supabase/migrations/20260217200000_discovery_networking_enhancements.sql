-- ============================================================
-- Sortir Discovery & Networking Enhancements Migration
-- ============================================================

-- 1. Enhanced Business Profiles: Add new profile sections
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS looking_for text[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS can_offer text[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS partnership_ideas text[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS partnership_interest_tags text[] DEFAULT '{}';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_story text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_goals text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_values text[] DEFAULT '{}';

-- 2. Connection Requests table
CREATE TABLE IF NOT EXISTS connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  receiver_business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_request CHECK (sender_business_id <> receiver_business_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_sender ON connection_requests(sender_business_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver ON connection_requests(receiver_business_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

-- RLS for connection_requests
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connection requests"
  ON connection_requests FOR SELECT
  USING (
    sender_business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR receiver_business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can create connection requests from their business"
  ON connection_requests FOR INSERT
  WITH CHECK (
    sender_business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update connection requests they received"
  ON connection_requests FOR UPDATE
  USING (
    receiver_business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- 3. Success stories table for partnership idea generator
CREATE TABLE IF NOT EXISTS success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  business_a_type text NOT NULL,
  business_b_type text NOT NULL,
  partnership_description text NOT NULL,
  results text,
  submitter_name text,
  approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved success stories"
  ON success_stories FOR SELECT
  USING (approved = true OR submitter_business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Authenticated users can submit success stories"
  ON success_stories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
