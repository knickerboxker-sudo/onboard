-- Partnership agreements storage
create table if not exists partnership_agreements (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete set null,
  partnership_id uuid references partnerships(id) on delete set null,
  creator_business_id uuid not null references businesses(id) on delete cascade,
  partner_business_id uuid references businesses(id) on delete set null,
  title text not null,
  partnership_type text not null,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'approved', 'signed', 'expired')),
  content jsonb not null default '{}'::jsonb,
  version int not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists partnership_agreements_creator_idx on partnership_agreements (creator_business_id);
create index if not exists partnership_agreements_match_idx on partnership_agreements (match_id);

alter table partnership_agreements enable row level security;

create policy "agreement owners manage agreements" on partnership_agreements
  for all
  using (
    exists (
      select 1 from businesses b
      where (b.id = partnership_agreements.creator_business_id or b.id = partnership_agreements.partner_business_id)
        and b.owner_id = auth.uid()
    )
  );
