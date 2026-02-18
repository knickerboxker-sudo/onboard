-- Add geocoordinates to city_launch_status for nearby-city lookups.

ALTER TABLE city_launch_status ADD COLUMN IF NOT EXISTS lat FLOAT;
ALTER TABLE city_launch_status ADD COLUMN IF NOT EXISTS lng FLOAT;

-- RPC: return all cities within p_radius_miles of the given city
-- using the Haversine formula (Earth radius ≈ 3958.8 miles).
CREATE OR REPLACE FUNCTION get_nearby_cities(p_city TEXT, p_radius_miles FLOAT DEFAULT 50)
RETURNS TABLE (
  city        TEXT,
  state       TEXT,
  current_count INT,
  threshold   INT,
  launched    BOOLEAN,
  distance_miles FLOAT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c2.city,
    c2.state,
    c2.current_count,
    c2.threshold,
    c2.launched,
    (
      3958.8 * acos(
        LEAST(1.0,
          cos(radians(c1.lat)) * cos(radians(c2.lat)) *
          cos(radians(c2.lng) - radians(c1.lng)) +
          sin(radians(c1.lat)) * sin(radians(c2.lat))
        )
      )
    )::FLOAT AS distance_miles
  FROM city_launch_status c1
  JOIN city_launch_status c2 ON c2.city <> c1.city
  WHERE c1.city ILIKE p_city
    AND c1.lat IS NOT NULL AND c1.lng IS NOT NULL
    AND c2.lat IS NOT NULL AND c2.lng IS NOT NULL
    AND (
      3958.8 * acos(
        LEAST(1.0,
          cos(radians(c1.lat)) * cos(radians(c2.lat)) *
          cos(radians(c2.lng) - radians(c1.lng)) +
          sin(radians(c1.lat)) * sin(radians(c2.lat))
        )
      )
    ) <= p_radius_miles
  ORDER BY distance_miles;
$$;
