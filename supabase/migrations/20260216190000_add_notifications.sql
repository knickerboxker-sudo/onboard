-- Notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('match', 'message', 'partnership_update', 'verification', 'system')),
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notifications_user_id_idx on notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx on notifications (user_id) where read = false;

alter table notifications enable row level security;

create policy "users manage own notifications" on notifications
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Add notification preferences to businesses table
alter table businesses add column if not exists notification_preferences jsonb default '{"email": true, "push": true, "in_app": true}'::jsonb;
