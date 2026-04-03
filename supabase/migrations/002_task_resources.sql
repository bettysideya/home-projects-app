-- Task Resources junction table

create table if not exists task_resources (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id) on delete cascade,
  resource_id uuid not null references resources(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (task_id, resource_id)
);

-- Enable Row Level Security
alter table task_resources enable row level security;

-- Open policy (adjust for auth later)
create policy "Allow all on task_resources" on task_resources for all using (true) with check (true);

-- Index for fast lookup by task
create index idx_task_resources_task_id on task_resources(task_id);
