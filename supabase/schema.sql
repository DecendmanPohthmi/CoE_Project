-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> Run

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  description  text not null default '' check (char_length(description) <= 2000),
  completed    boolean not null default false,
  priority     text not null default 'medium'
               check (priority in ('low', 'medium', 'high', 'urgent')),
  category     text not null default 'General'
               check (category in ('Work', 'Personal', 'Study', 'Health', 'Finance', 'General')),
  due_date     text not null default '',
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at desc);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Row Level Security: every user can only see and change their own tasks
alter table public.tasks enable row level security;

drop policy if exists "Users read own tasks"   on public.tasks;
drop policy if exists "Users insert own tasks" on public.tasks;
drop policy if exists "Users update own tasks" on public.tasks;
drop policy if exists "Users delete own tasks" on public.tasks;

create policy "Users read own tasks"   on public.tasks
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own tasks" on public.tasks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own tasks" on public.tasks
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own tasks" on public.tasks
  for delete to authenticated using (auth.uid() = user_id);
