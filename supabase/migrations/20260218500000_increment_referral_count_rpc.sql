-- Atomic increment of referral_count to avoid race conditions
CREATE OR REPLACE FUNCTION increment_referral_count(referral_code_input TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE pre_launch_signups
  SET referral_count = referral_count + 1,
      updated_at = NOW()
  WHERE referral_code = referral_code_input;
$$;
