-- Home Projects Kanban — initial schema

create type project_column as enum ('backlog', 'active', 'done');

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  column      project_column not null default 'backlog',
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  description text,
  completed   boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table projects enable row level security;
alter table tasks enable row level security;

-- Open policies (adjust for auth later)
create policy "Allow all on projects" on projects for all using (true) with check (true);
create policy "Allow all on tasks" on tasks for all using (true) with check (true);

-- Index for ordering
create index idx_projects_column_position on projects(column, position);
create index idx_tasks_project_position on tasks(project_id, position);
