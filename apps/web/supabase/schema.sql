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

-- Phase 2 extension: projects, habits, recurring tasks

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('active', 'on_hold', 'completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'habit_frequency') then
    create type habit_frequency as enum ('daily', 'weekly');
  end if;

  if not exists (select 1 from pg_type where typname = 'recurrence_pattern') then
    create type recurrence_pattern as enum ('daily', 'weekly', 'monthly');
  end if;
end $$;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  context task_context not null default 'general',
  status project_status not null default 'active',
  progress int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  context task_context not null default 'general',
  frequency habit_frequency not null default 'daily',
  streak_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique(habit_id, completed_on)
);

alter table tasks add column if not exists project_id uuid references projects(id) on delete set null;
alter table tasks add column if not exists is_recurring boolean not null default false;
alter table tasks add column if not exists recurrence_pattern recurrence_pattern;

create index if not exists projects_user_id_idx on projects(user_id);
create index if not exists habits_user_id_idx on habits(user_id);
create index if not exists habit_logs_user_id_idx on habit_logs(user_id);
create index if not exists tasks_project_id_idx on tasks(project_id);

alter table projects enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;

drop policy if exists "projects_select_own" on projects;
drop policy if exists "projects_insert_own" on projects;
drop policy if exists "projects_update_own" on projects;
drop policy if exists "projects_delete_own" on projects;

create policy "projects_select_own" on projects
for select using (auth.uid() = user_id);

create policy "projects_insert_own" on projects
for insert with check (auth.uid() = user_id);

create policy "projects_update_own" on projects
for update using (auth.uid() = user_id);

create policy "projects_delete_own" on projects
for delete using (auth.uid() = user_id);

drop policy if exists "habits_select_own" on habits;
drop policy if exists "habits_insert_own" on habits;
drop policy if exists "habits_update_own" on habits;
drop policy if exists "habits_delete_own" on habits;

create policy "habits_select_own" on habits
for select using (auth.uid() = user_id);

create policy "habits_insert_own" on habits
for insert with check (auth.uid() = user_id);

create policy "habits_update_own" on habits
for update using (auth.uid() = user_id);

create policy "habits_delete_own" on habits
for delete using (auth.uid() = user_id);

drop policy if exists "habit_logs_select_own" on habit_logs;
drop policy if exists "habit_logs_insert_own" on habit_logs;
drop policy if exists "habit_logs_delete_own" on habit_logs;

create policy "habit_logs_select_own" on habit_logs
for select using (auth.uid() = user_id);

create policy "habit_logs_insert_own" on habit_logs
for insert with check (auth.uid() = user_id);

create policy "habit_logs_delete_own" on habit_logs
for delete using (auth.uid() = user_id);

-- Recurring task automation helper (for Supabase cron/job)
create or replace function public.roll_over_recurring_tasks()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int := 0;
begin
  update tasks
  set due_date =
    case recurrence_pattern
      when 'daily' then due_date + interval '1 day'
      when 'weekly' then due_date + interval '7 days'
      when 'monthly' then due_date + interval '1 month'
      else due_date
    end,
    updated_at = now()
  where is_recurring = true
    and is_completed = false
    and due_date is not null
    and due_date::date < now()::date;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- Phase 3+ extension: goals, analytics support, collaboration foundations

do $$
begin
  if not exists (select 1 from pg_type where typname = 'goal_status') then
    create type goal_status as enum ('active', 'completed', 'paused');
  end if;

  if not exists (select 1 from pg_type where typname = 'workspace_visibility') then
    create type workspace_visibility as enum ('private', 'team');
  end if;
end $$;

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  context task_context not null default 'general',
  target_value int not null default 1,
  current_value int not null default 0,
  status goal_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  visibility workspace_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create index if not exists goals_user_id_idx on goals(user_id);
create index if not exists workspaces_owner_id_idx on workspaces(owner_id);
create index if not exists workspace_members_workspace_id_idx on workspace_members(workspace_id);

alter table goals enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;

drop policy if exists "goals_select_own" on goals;
drop policy if exists "goals_insert_own" on goals;
drop policy if exists "goals_update_own" on goals;
drop policy if exists "goals_delete_own" on goals;

create policy "goals_select_own" on goals
for select using (auth.uid() = user_id);

create policy "goals_insert_own" on goals
for insert with check (auth.uid() = user_id);

create policy "goals_update_own" on goals
for update using (auth.uid() = user_id);

create policy "goals_delete_own" on goals
for delete using (auth.uid() = user_id);

drop policy if exists "workspaces_select_own" on workspaces;
drop policy if exists "workspaces_insert_own" on workspaces;
drop policy if exists "workspaces_update_own" on workspaces;
drop policy if exists "workspaces_delete_own" on workspaces;

create policy "workspaces_select_own" on workspaces
for select using (auth.uid() = owner_id);

create policy "workspaces_insert_own" on workspaces
for insert with check (auth.uid() = owner_id);

create policy "workspaces_update_own" on workspaces
for update using (auth.uid() = owner_id);

create policy "workspaces_delete_own" on workspaces
for delete using (auth.uid() = owner_id);

drop policy if exists "workspace_members_select_access" on workspace_members;
drop policy if exists "workspace_members_insert_owner" on workspace_members;
drop policy if exists "workspace_members_delete_owner" on workspace_members;

create policy "workspace_members_select_access" on workspace_members
for select using (
  exists (
    select 1
    from workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
  or workspace_members.user_id = auth.uid()
);

create policy "workspace_members_insert_owner" on workspace_members
for insert with check (
  exists (
    select 1
    from workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
);

create policy "workspace_members_delete_owner" on workspace_members
for delete using (
  exists (
    select 1
    from workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
);
