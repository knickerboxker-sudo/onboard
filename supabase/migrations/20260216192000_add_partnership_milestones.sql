-- Partnership milestones tracking
create table if not exists partnership_milestones (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid not null references partnerships(id) on delete cascade,
  type text not null check (type in ('first_sale', 'revenue_threshold', 'customer_goal', 'duration_milestone', 'custom')),
  title text not null,
  description text,
  target_value decimal not null default 0,
  current_value decimal not null default 0,
  completed_at timestamptz,
  celebrated boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists partnership_milestones_partnership_idx on partnership_milestones (partnership_id);

alter table partnership_milestones enable row level security;

create policy "partnership milestone owners manage milestones" on partnership_milestones
  for all
  using (
    exists (
      select 1
      from partnerships p
      join matches m on m.id = p.match_id
      join businesses b on (b.id = m.business_1_id or b.id = m.business_2_id)
      where p.id = partnership_milestones.partnership_id and b.owner_id = auth.uid()
    )
  );
