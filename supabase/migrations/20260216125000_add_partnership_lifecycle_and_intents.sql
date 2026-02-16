-- Add collaboration intents to businesses
alter table businesses add column if not exists collaboration_intents text[] default '{}';

-- Expand partnership status to support full lifecycle: pending → active → paused → completed/cancelled/archived
alter table partnerships drop constraint if exists partnerships_status_check;
alter table partnerships add constraint partnerships_status_check
  check (status in ('pending', 'active', 'paused', 'completed', 'cancelled', 'archived'));
