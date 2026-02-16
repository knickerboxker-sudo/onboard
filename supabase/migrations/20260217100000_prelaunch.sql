-- Pre-launch waitlist infrastructure for city-by-city density-based launches

-- City launch status table
CREATE TABLE IF NOT EXISTS city_launch_status (
  city TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  threshold INT NOT NULL DEFAULT 50,
  current_count INT NOT NULL DEFAULT 0,
  launched BOOLEAN NOT NULL DEFAULT FALSE,
  launched_at TIMESTAMPTZ,
  target_launch_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-launch signups table
CREATE TABLE IF NOT EXISTS pre_launch_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  city TEXT NOT NULL REFERENCES city_launch_status(city),
  state TEXT NOT NULL,
  partnership_interests TEXT[] DEFAULT '{}',
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  referral_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'invited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- City requests table for users requesting new cities
CREATE TABLE IF NOT EXISTS city_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pre_launch_signups_city ON pre_launch_signups(city);
CREATE INDEX IF NOT EXISTS idx_pre_launch_signups_referral_code ON pre_launch_signups(referral_code);
CREATE INDEX IF NOT EXISTS idx_pre_launch_signups_referred_by ON pre_launch_signups(referred_by);
CREATE INDEX IF NOT EXISTS idx_pre_launch_signups_email ON pre_launch_signups(email);
CREATE INDEX IF NOT EXISTS idx_pre_launch_signups_created_at ON pre_launch_signups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_requests_city ON city_requests(city, state);

-- Seed initial cities
INSERT INTO city_launch_status (city, state, threshold) VALUES
  ('Ann Arbor', 'MI', 50),
  ('Detroit', 'MI', 100),
  ('Grand Rapids', 'MI', 100)
ON CONFLICT (city) DO NOTHING;
