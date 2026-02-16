-- Referral tracking
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_business_id uuid not null references businesses(id) on delete cascade,
  referred_email text not null,
  referred_business_id uuid references businesses(id) on delete set null,
  status text not null default 'invited' check (status in ('invited', 'signed_up', 'first_match', 'active_partnership')),
  reward_earned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists referrals_referrer_idx on referrals (referrer_business_id);
create index if not exists referrals_email_idx on referrals (referred_email);

alter table referrals enable row level security;

create policy "referral owners manage referrals" on referrals
  for all
  using (
    exists (
      select 1 from businesses b
      where b.id = referrals.referrer_business_id and b.owner_id = auth.uid()
    )
  );

-- Add referral_code to businesses
alter table businesses add column if not exists referral_code text unique;
