-- TaskOrbit Phase 1 schema (Supabase/PostgreSQL)
-- Apply via Supabase SQL editor.

create type task_context as enum ('work', 'personal', 'general');
create type task_priority as enum ('low', 'medium', 'high');
create type task_status as enum ('todo', 'in_progress', 'done');
create type workspace_mode as enum ('personal', 'office');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  mode workspace_mode not null default 'personal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  context task_context not null default 'general',
  due_date timestamptz,
  estimated_minutes int not null default 30,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  mode workspace_mode not null default 'personal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists tasks_context_idx on tasks(context);

alter table profiles enable row level security;
alter table tasks enable row level security;
alter table settings enable row level security;

create policy "profiles_select_own" on profiles
for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
for update using (auth.uid() = id);

create policy "profiles_insert_own" on profiles
for insert with check (auth.uid() = id);

create policy "tasks_select_own" on tasks
for select using (auth.uid() = user_id);

create policy "tasks_insert_own" on tasks
for insert with check (auth.uid() = user_id);

create policy "tasks_update_own" on tasks
for update using (auth.uid() = user_id);

create policy "tasks_delete_own" on tasks
for delete using (auth.uid() = user_id);

create policy "settings_select_own" on settings
for select using (auth.uid() = user_id);

create policy "settings_insert_own" on settings
for insert with check (auth.uid() = user_id);

create policy "settings_update_own" on settings
for update using (auth.uid() = user_id);
