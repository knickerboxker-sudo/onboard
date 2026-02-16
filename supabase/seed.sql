-- Seed data: 15 pre-launch signups for Ann Arbor
-- Spread across the last 7 days with a mix of business types

INSERT INTO pre_launch_signups (email, business_name, business_type, city, state, partnership_interests, referral_code, status, created_at) VALUES
  ('maria@bloomflorals.com', 'Bloom Florals', 'Retail', 'Ann Arbor', 'MI', ARRAY['Cross-promotion', 'Event collaborations'], 'BLM1A2B3', 'waiting', NOW() - INTERVAL '7 days'),
  ('james@peakfitness.com', 'Peak Fitness Studio', 'Fitness', 'Ann Arbor', 'MI', ARRAY['Cross-promotion', 'Bundle deals'], 'PKF4C5D6', 'waiting', NOW() - INTERVAL '6 days'),
  ('aisha@dailygrind.com', 'The Daily Grind Café', 'Food & Beverage', 'Ann Arbor', 'MI', ARRAY['Bundle deals', 'Consignment'], 'DGC7E8F9', 'waiting', NOW() - INTERVAL '6 days'),
  ('tom@mainstreetbooks.com', 'Main Street Books', 'Retail', 'Ann Arbor', 'MI', ARRAY['Cross-promotion', 'Event collaborations'], 'MSB1G2H3', 'waiting', NOW() - INTERVAL '5 days'),
  ('nina@zenflowstudio.com', 'ZenFlow Yoga Studio', 'Fitness', 'Ann Arbor', 'MI', ARRAY['Cross-promotion', 'Bundle deals'], 'ZFY4I5J6', 'waiting', NOW() - INTERVAL '5 days'),
  ('derek@awoodworks.com', 'Arbor Woodworks', 'Services', 'Ann Arbor', 'MI', ARRAY['Consignment', 'Commission splits'], 'AWW7K8L9', 'waiting', NOW() - INTERVAL '4 days'),
  ('lisa@sweetspot.com', 'Sweet Spot Bakery', 'Food & Beverage', 'Ann Arbor', 'MI', ARRAY['Bundle deals', 'Cross-promotion'], 'SSB1M2N3', 'waiting', NOW() - INTERVAL '4 days'),
  ('marcus@techrepairaa.com', 'A2 Tech Repair', 'Services', 'Ann Arbor', 'MI', ARRAY['Cross-promotion'], 'ATR4O5P6', 'waiting', NOW() - INTERVAL '3 days'),
  ('sam@greenlightgallery.com', 'Greenlight Gallery', 'Arts & Entertainment', 'Ann Arbor', 'MI', ARRAY['Event collaborations', 'Cross-promotion'], 'GLG7Q8R9', 'waiting', NOW() - INTERVAL '3 days'),
  ('rachel@puppersparadise.com', 'Puppers Paradise', 'Pets', 'Ann Arbor', 'MI', ARRAY['Cross-promotion', 'Bundle deals'], 'PPD1S2T3', 'waiting', NOW() - INTERVAL '2 days'),
  ('kevin@detroitdenim.com', 'Michigan Denim Co.', 'Retail', 'Ann Arbor', 'MI', ARRAY['Consignment', 'Cross-promotion'], 'MDC4U5V6', 'waiting', NOW() - INTERVAL '2 days'),
  ('jade@cleancandle.com', 'Clean Candle Co.', 'Retail', 'Ann Arbor', 'MI', ARRAY['Consignment', 'Bundle deals'], 'CCC7W8X9', 'waiting', NOW() - INTERVAL '1 day'),
  ('omar@a2barbers.com', 'A2 Barbers', 'Services', 'Ann Arbor', 'MI', ARRAY['Cross-promotion'], 'A2B1Y2Z3', 'waiting', NOW() - INTERVAL '1 day'),
  ('emily@huronroasters.com', 'Huron Roasters', 'Food & Beverage', 'Ann Arbor', 'MI', ARRAY['Bundle deals', 'Consignment'], 'HRR4A5B6', 'waiting', NOW() - INTERVAL '12 hours'),
  ('dan@michiganmade.com', 'Michigan Made Goods', 'Retail', 'Ann Arbor', 'MI', ARRAY['Consignment', 'Cross-promotion', 'Event collaborations'], 'MMG7C8D9', 'waiting', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- Update Ann Arbor city count to match seed data
UPDATE city_launch_status SET current_count = 15 WHERE city = 'Ann Arbor';
