-- Remove state-based launch system entirely.
-- The city-based system in city_launch_status is the only launch mechanism.

DROP TRIGGER IF EXISTS trg_increment_state_count ON businesses;
DROP FUNCTION IF EXISTS increment_state_count();
DROP TABLE IF EXISTS state_launch_status;
