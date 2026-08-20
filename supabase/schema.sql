-- Ctrl + AI shared database schema
-- Run this file first in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default '기타' check (category in ('정기모임', '지원비', '프로젝트', '교육', '행사', '회칙', '기타')),
  pinned boolean not null default false,
  author text not null default '운영진',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  links text[] not null default '{}',
  author text not null default '운영진',
  writer_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  author text not null default '회원',
  writer_tag text,
  members text[] not null default '{}',
  status text not null default '아이디어' check (status in ('아이디어', '기획', '진행중', '완료', '보류')),
  goal text not null default '',
  next_action text not null default '',
  resources jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  meeting_notes text not null default '',
  result_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project_rooms(id) on delete cascade,
  title text not null,
  content text not null,
  author text not null default '회원',
  writer_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.knowledge_posts(id) on delete cascade,
  author text not null,
  content text not null,
  writer_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.project_rooms(id) on delete cascade,
  author text not null,
  content text not null,
  writer_tag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Re-running this file upgrades databases created with an earlier schema.
alter table public.knowledge_posts add column if not exists writer_tag text;
alter table public.project_rooms add column if not exists author text not null default '회원';
alter table public.project_rooms add column if not exists writer_tag text;
alter table public.project_updates add column if not exists author text not null default '회원';
alter table public.project_updates add column if not exists writer_tag text;

create table if not exists public.gatherings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time text,
  place text,
  memo text,
  attendees text[] not null default '{}',
  map_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  interest text,
  ai_tools text[] not null default '{}',
  projects text[] not null default '{}',
  bio text,
  initials text not null default 'AI',
  color text not null default 'blue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key check (key in ('dashboard', 'about')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notices_set_updated_at on public.notices;
create trigger notices_set_updated_at before update on public.notices for each row execute function public.set_updated_at();
drop trigger if exists knowledge_posts_set_updated_at on public.knowledge_posts;
create trigger knowledge_posts_set_updated_at before update on public.knowledge_posts for each row execute function public.set_updated_at();
drop trigger if exists project_rooms_set_updated_at on public.project_rooms;
create trigger project_rooms_set_updated_at before update on public.project_rooms for each row execute function public.set_updated_at();
drop trigger if exists project_updates_set_updated_at on public.project_updates;
create trigger project_updates_set_updated_at before update on public.project_updates for each row execute function public.set_updated_at();
drop trigger if exists knowledge_comments_set_updated_at on public.knowledge_comments;
create trigger knowledge_comments_set_updated_at before update on public.knowledge_comments for each row execute function public.set_updated_at();
drop trigger if exists project_comments_set_updated_at on public.project_comments;
create trigger project_comments_set_updated_at before update on public.project_comments for each row execute function public.set_updated_at();
drop trigger if exists gatherings_set_updated_at on public.gatherings;
create trigger gatherings_set_updated_at before update on public.gatherings for each row execute function public.set_updated_at();
drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at before update on public.members for each row execute function public.set_updated_at();
drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

create index if not exists project_updates_project_id_idx on public.project_updates(project_id);
create index if not exists knowledge_comments_post_id_idx on public.knowledge_comments(post_id, created_at);
create index if not exists project_comments_project_id_idx on public.project_comments(project_id, created_at);
create index if not exists notices_created_at_idx on public.notices(created_at desc);
create index if not exists knowledge_posts_created_at_idx on public.knowledge_posts(created_at desc);
create index if not exists gatherings_date_idx on public.gatherings(date);

alter table public.notices enable row level security;
alter table public.knowledge_posts enable row level security;
alter table public.project_rooms enable row level security;
alter table public.project_updates enable row level security;
alter table public.knowledge_comments enable row level security;
alter table public.project_comments enable row level security;
alter table public.gatherings enable row level security;
alter table public.members enable row level security;
alter table public.site_settings enable row level security;

revoke all on public.notices, public.knowledge_posts, public.knowledge_comments, public.project_rooms, public.project_updates, public.project_comments, public.gatherings, public.members, public.site_settings from anon, authenticated;
grant select on public.notices, public.knowledge_posts, public.knowledge_comments, public.project_rooms, public.project_updates, public.project_comments, public.gatherings, public.members, public.site_settings to anon, authenticated;
grant all on public.notices, public.knowledge_posts, public.knowledge_comments, public.project_rooms, public.project_updates, public.project_comments, public.gatherings, public.members, public.site_settings to service_role;

drop policy if exists "community read notices" on public.notices;
create policy "community read notices" on public.notices for select to anon, authenticated using (true);
drop policy if exists "community read knowledge" on public.knowledge_posts;
create policy "community read knowledge" on public.knowledge_posts for select to anon, authenticated using (true);
drop policy if exists "community read knowledge comments" on public.knowledge_comments;
create policy "community read knowledge comments" on public.knowledge_comments for select to anon, authenticated using (true);
drop policy if exists "community read projects" on public.project_rooms;
create policy "community read projects" on public.project_rooms for select to anon, authenticated using (true);
drop policy if exists "community read project updates" on public.project_updates;
create policy "community read project updates" on public.project_updates for select to anon, authenticated using (true);
drop policy if exists "community read project comments" on public.project_comments;
create policy "community read project comments" on public.project_comments for select to anon, authenticated using (true);
drop policy if exists "community read gatherings" on public.gatherings;
create policy "community read gatherings" on public.gatherings for select to anon, authenticated using (true);
drop policy if exists "community read members" on public.members;
create policy "community read members" on public.members for select to anon, authenticated using (true);
drop policy if exists "community read settings" on public.site_settings;
create policy "community read settings" on public.site_settings for select to anon, authenticated using (true);

-- No INSERT/UPDATE/DELETE policy is created for anon or authenticated.
-- All writes must pass a Next.js session-role check and use the server-only service role client.
-- Members may create knowledge posts, create/edit project rooms, and add comments/project updates.
-- Member records and all deletes remain admin-only.
