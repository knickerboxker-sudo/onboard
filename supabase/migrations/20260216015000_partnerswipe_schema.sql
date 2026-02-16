create extension if not exists "pgcrypto";

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  description text,
  business_type text not null,
  address text not null,
  lat double precision,
  lng double precision,
  photos text[] default '{}',
  products text[] default '{}',
  partnership_types text[] default '{}',
  operating_hours text,
  website text,
  social_links text[] default '{}',
  -- Social proof & demographics
  follower_count int default 0,
  email_list_size int default 0,
  monthly_foot_traffic int default 0,
  target_age_min int,
  target_age_max int,
  target_income_bracket text,
  customer_interests text[] default '{}',
  -- Verification & trust
  verified boolean default false,
  years_in_operation int,
  successful_partnerships_count int default 0,
  -- Subscription tier
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'premium')),
  daily_swipes_used int default 0,
  last_swipe_reset_at date default current_date,
  -- Activity tracking
  last_active_at timestamptz default timezone('utc', now()),
  avg_response_time_minutes int,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_business_id uuid not null references businesses(id) on delete cascade,
  swiped_business_id uuid not null references businesses(id) on delete cascade,
  direction text not null check (direction in ('left', 'right')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (swiper_business_id, swiped_business_id)
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  business_1_id uuid not null references businesses(id) on delete cascade,
  business_2_id uuid not null references businesses(id) on delete cascade,
  matched_at timestamptz not null default timezone('utc', now()),
  check (business_1_id <> business_2_id),
  unique (business_1_id, business_2_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  sender_business_id uuid not null references businesses(id) on delete cascade,
  content text not null,
  sent_at timestamptz not null default timezone('utc', now())
);

create index if not exists businesses_type_idx on businesses (business_type);
create index if not exists businesses_lat_lng_idx on businesses (lat, lng);
create index if not exists swipes_swiper_idx on swipes (swiper_business_id);
create index if not exists matches_business_1_idx on matches (business_1_id);
create index if not exists matches_business_2_idx on matches (business_2_id);
create index if not exists messages_match_id_idx on messages (match_id, sent_at desc);

alter table businesses enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;

create policy "business owners manage own business" on businesses
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "business owners manage outgoing swipes" on swipes
  for all
  using (
    exists (
      select 1
      from businesses b
      where b.id = swiper_business_id and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from businesses b
      where b.id = swiper_business_id and b.owner_id = auth.uid()
    )
  );

create policy "business owners read matches" on matches
  for select
  using (
    exists (
      select 1
      from businesses b
      where (b.id = matches.business_1_id or b.id = matches.business_2_id)
        and b.owner_id = auth.uid()
    )
  );

create policy "business owners create own matches" on matches
  for insert
  with check (
    exists (
      select 1
      from businesses b
      where b.id = matches.business_1_id and b.owner_id = auth.uid()
    )
    or exists (
      select 1
      from businesses b
      where b.id = matches.business_2_id and b.owner_id = auth.uid()
    )
  );

create policy "business owners read messages" on messages
  for select
  using (
    exists (
      select 1
      from matches m
      join businesses b on b.id = messages.sender_business_id
      where m.id = messages.match_id
        and (m.business_1_id = b.id or m.business_2_id = b.id)
        and b.owner_id = auth.uid()
    )
  );

create policy "business owners send messages" on messages
  for insert
  with check (
    exists (
      select 1
      from businesses b
      where b.id = messages.sender_business_id and b.owner_id = auth.uid()
    )
  );

-- Partnership outcomes tracking
create table if not exists partnerships (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  partnership_type text not null,
  start_date date not null default current_date,
  end_date date,
  revenue_generated decimal default 0,
  customers_acquired int default 0,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  success_rating int check (success_rating >= 1 and success_rating <= 5),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Business verification records
create table if not exists verifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  verification_type text not null check (verification_type in ('business_license', 'storefront_photo', 'tax_id', 'social_media', 'website')),
  document_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  submitted_at timestamptz not null default timezone('utc', now()),
  verified_at timestamptz
);

-- Profile views / interest signals
create table if not exists profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_business_id uuid not null references businesses(id) on delete cascade,
  viewed_business_id uuid not null references businesses(id) on delete cascade,
  viewed_at timestamptz not null default timezone('utc', now())
);

-- Reviews between partners
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid not null references partnerships(id) on delete cascade,
  reviewer_business_id uuid not null references businesses(id) on delete cascade,
  reviewed_business_id uuid not null references businesses(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Reports / blocks for safety
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_business_id uuid not null references businesses(id) on delete cascade,
  reported_business_id uuid not null references businesses(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved')),
  is_block boolean default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- Saved partnership equity assessments
create table if not exists saved_assessments (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete set null,
  creator_business_id uuid not null references businesses(id) on delete cascade,
  business_a_percent int not null,
  business_b_percent int not null,
  scenario text not null,
  proposed_split_a int,
  notes text,
  shared_with_match boolean default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists partnerships_match_id_idx on partnerships (match_id);
create index if not exists partnerships_status_idx on partnerships (status);
create index if not exists verifications_business_id_idx on verifications (business_id);
create index if not exists profile_views_viewed_idx on profile_views (viewed_business_id, viewed_at desc);
create index if not exists reviews_reviewed_idx on reviews (reviewed_business_id);
create index if not exists reports_reported_idx on reports (reported_business_id);
create index if not exists saved_assessments_creator_idx on saved_assessments (creator_business_id);

alter table partnerships enable row level security;
alter table verifications enable row level security;
alter table profile_views enable row level security;
alter table reviews enable row level security;
alter table reports enable row level security;
alter table saved_assessments enable row level security;

create policy "partnership owners manage partnerships" on partnerships
  for all
  using (
    exists (
      select 1
      from matches m
      join businesses b on (b.id = m.business_1_id or b.id = m.business_2_id)
      where m.id = partnerships.match_id and b.owner_id = auth.uid()
    )
  );

create policy "business owners manage own verifications" on verifications
  for all
  using (
    exists (
      select 1 from businesses b
      where b.id = verifications.business_id and b.owner_id = auth.uid()
    )
  );

create policy "business owners view profile views" on profile_views
  for select
  using (
    exists (
      select 1 from businesses b
      where b.id = profile_views.viewed_business_id and b.owner_id = auth.uid()
    )
  );

create policy "business owners create profile views" on profile_views
  for insert
  with check (
    exists (
      select 1 from businesses b
      where b.id = profile_views.viewer_business_id and b.owner_id = auth.uid()
    )
  );

create policy "business owners manage reviews" on reviews
  for all
  using (
    exists (
      select 1 from businesses b
      where (b.id = reviews.reviewer_business_id or b.id = reviews.reviewed_business_id) and b.owner_id = auth.uid()
    )
  );

create policy "business owners manage reports" on reports
  for all
  using (
    exists (
      select 1 from businesses b
      where b.id = reports.reporter_business_id and b.owner_id = auth.uid()
    )
  );

create policy "business owners manage saved assessments" on saved_assessments
  for all
  using (
    exists (
      select 1 from businesses b
      where b.id = saved_assessments.creator_business_id and b.owner_id = auth.uid()
    )
  );
