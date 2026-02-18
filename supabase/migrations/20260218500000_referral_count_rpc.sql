-- Atomic RPC to increment referral_count, avoiding read-then-write race conditions.
CREATE OR REPLACE FUNCTION increment_referral_count(referral_code_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pre_launch_signups
  SET referral_count = referral_count + 1,
      updated_at = NOW()
  WHERE referral_code = referral_code_param;
END;
$$;
