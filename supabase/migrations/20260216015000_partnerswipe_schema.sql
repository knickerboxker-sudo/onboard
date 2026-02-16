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
