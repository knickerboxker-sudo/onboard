-- ============================================================
-- City-Based Launch System
-- Each US city unlocks independently when 50 businesses sign up.
-- Businesses may sign up from any city; discovery is limited to
-- launched cities within 50 miles of the user's location.
-- ============================================================

-- 1. Drop the FK constraint on pre_launch_signups.city so any city can be used
ALTER TABLE pre_launch_signups DROP CONSTRAINT IF EXISTS pre_launch_signups_city_fkey;

-- 2. Add city and state columns to businesses (extracted from address at onboarding)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_state ON businesses(state);

-- 3. Function: upsert a city record and optionally auto-launch it
CREATE OR REPLACE FUNCTION ensure_city_launch_status(p_city TEXT, p_state TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO city_launch_status (city, state, threshold, current_count, launched)
  VALUES (p_city, p_state, 50, 0, FALSE)
  ON CONFLICT (city) DO NOTHING;
END;
$$;

-- 4. Function: increment city count and auto-launch at threshold
CREATE OR REPLACE FUNCTION increment_city_count(p_city TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE city_launch_status
  SET
    current_count = current_count + 1,
    launched = (current_count + 1) >= threshold,
    launched_at = CASE
      WHEN (current_count + 1) >= threshold AND launched = FALSE THEN NOW()
      ELSE launched_at
    END,
    updated_at = NOW()
  WHERE city = p_city;
END;
$$;

-- 5. Trigger: when a new business is inserted with a city, create/update city record
CREATE OR REPLACE FUNCTION trigger_city_count_on_business_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.city IS NOT NULL AND NEW.state IS NOT NULL THEN
    PERFORM ensure_city_launch_status(NEW.city, NEW.state);
    PERFORM increment_city_count(NEW.city);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS city_count_on_business_insert ON businesses;
CREATE TRIGGER city_count_on_business_insert
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION trigger_city_count_on_business_insert();

-- 6. Trigger: when a pre_launch_signup is inserted, auto-create the city record
--    (count for launch is driven by businesses, not pre-launch signups)
CREATE OR REPLACE FUNCTION trigger_ensure_city_on_prelaunch()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM ensure_city_launch_status(NEW.city, NEW.state);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_city_on_prelaunch ON pre_launch_signups;
CREATE TRIGGER ensure_city_on_prelaunch
  BEFORE INSERT ON pre_launch_signups
  FOR EACH ROW EXECUTE FUNCTION trigger_ensure_city_on_prelaunch();

-- 7. RLS: anyone can read city_launch_status (public info)
ALTER TABLE city_launch_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read city launch status" ON city_launch_status;
CREATE POLICY "Anyone can read city launch status"
  ON city_launch_status FOR SELECT
  USING (true);

-- 8. RLS: only server-side functions write to city_launch_status
DROP POLICY IF EXISTS "Service role can manage city launch status" ON city_launch_status;
CREATE POLICY "Service role can manage city launch status"
  ON city_launch_status FOR ALL
  USING (auth.role() = 'service_role');

-- 9. Update existing seeded cities to use the new threshold of 50
UPDATE city_launch_status SET threshold = 50, updated_at = NOW();
