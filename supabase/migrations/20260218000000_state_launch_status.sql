-- State-based launch system to replace city-based launch
-- Creates state_launch_status table alongside existing city_launch_status (do not drop city_launch_status)

CREATE TABLE IF NOT EXISTS state_launch_status (
  state_abbrev TEXT PRIMARY KEY,
  state_name TEXT NOT NULL,
  estimated_businesses INT NOT NULL,
  threshold INT NOT NULL,
  current_count INT NOT NULL DEFAULT 0,
  launched BOOLEAN NOT NULL DEFAULT FALSE,
  launched_at TIMESTAMPTZ,
  notifications_sent BOOLEAN NOT NULL DEFAULT FALSE,
  last_milestone_notified INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: anyone can read, only service_role can write
ALTER TABLE state_launch_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "state_launch_status_select_public"
  ON state_launch_status FOR SELECT
  USING (true);

CREATE POLICY "state_launch_status_insert_service_role"
  ON state_launch_status FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "state_launch_status_update_service_role"
  ON state_launch_status FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "state_launch_status_delete_service_role"
  ON state_launch_status FOR DELETE
  USING (auth.role() = 'service_role');

-- Seed data: 48 contiguous states + DC at 1% of estimated small business population
INSERT INTO state_launch_status (state_abbrev, state_name, estimated_businesses, threshold) VALUES
('AL', 'Alabama',          400000,  4000),
('AZ', 'Arizona',          600000,  6000),
('AR', 'Arkansas',         250000,  2500),
('CA', 'California',      4100000, 41000),
('CO', 'Colorado',         600000,  6000),
('CT', 'Connecticut',      350000,  3500),
('DE', 'Delaware',          90000,   900),
('DC', 'Washington DC',     80000,   800),
('FL', 'Florida',         2500000, 25000),
('GA', 'Georgia',         1000000, 10000),
('ID', 'Idaho',            170000,  1700),
('IL', 'Illinois',        1300000, 13000),
('IN', 'Indiana',          500000,  5000),
('IA', 'Iowa',             280000,  2800),
('KS', 'Kansas',           270000,  2700),
('KY', 'Kentucky',         350000,  3500),
('LA', 'Louisiana',        400000,  4000),
('ME', 'Maine',            140000,  1400),
('MD', 'Maryland',         550000,  5500),
('MA', 'Massachusetts',    700000,  7000),
('MI', 'Michigan',         900000,  9000),
('MN', 'Minnesota',        550000,  5500),
('MS', 'Mississippi',      240000,  2400),
('MO', 'Missouri',         520000,  5200),
('MT', 'Montana',          110000,  1100),
('NE', 'Nebraska',         190000,  1900),
('NV', 'Nevada',           300000,  3000),
('NH', 'New Hampshire',    130000,  1300),
('NJ', 'New Jersey',       860000,  8600),
('NM', 'New Mexico',       160000,  1600),
('NY', 'New York',        2200000, 22000),
('NC', 'North Carolina',   900000,  9000),
('ND', 'North Dakota',      70000,   700),
('OH', 'Ohio',             950000,  9500),
('OK', 'Oklahoma',         340000,  3400),
('OR', 'Oregon',           380000,  3800),
('PA', 'Pennsylvania',    1100000, 11000),
('RI', 'Rhode Island',     100000,  1000),
('SC', 'South Carolina',   400000,  4000),
('SD', 'South Dakota',      80000,   800),
('TN', 'Tennessee',        550000,  5500),
('TX', 'Texas',           3000000, 30000),
('UT', 'Utah',             330000,  3300),
('VT', 'Vermont',           70000,   700),
('VA', 'Virginia',         700000,  7000),
('WA', 'Washington',       620000,  6200),
('WV', 'West Virginia',    110000,  1100),
('WI', 'Wisconsin',        450000,  4500),
('WY', 'Wyoming',           60000,   600)
ON CONFLICT (state_abbrev) DO NOTHING;

-- Trigger function: auto-increment state count and auto-launch at threshold
CREATE OR REPLACE FUNCTION increment_state_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.state IS NOT NULL AND NEW.state != '' THEN
    UPDATE state_launch_status
    SET
      current_count = current_count + 1,
      launched = CASE
        WHEN (current_count + 1) >= threshold AND launched = FALSE THEN TRUE
        ELSE launched
      END,
      launched_at = CASE
        WHEN (current_count + 1) >= threshold AND launched = FALSE THEN NOW()
        ELSE launched_at
      END,
      updated_at = NOW()
    WHERE state_abbrev = NEW.state;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger on businesses table: fire after each insert
DROP TRIGGER IF EXISTS trg_increment_state_count ON businesses;
CREATE TRIGGER trg_increment_state_count
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION increment_state_count();
