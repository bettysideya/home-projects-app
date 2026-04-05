-- Add categories array to resources
alter table resources add column if not exists categories text[] not null default '{}';
