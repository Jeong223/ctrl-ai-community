-- Add comments, explicit authors, and non-reversible writer tags to an existing Ctrl + AI database.
-- The application stores only the HMAC-derived writer_tag; raw IP addresses are never stored.

alter table public.knowledge_posts add column if not exists writer_tag text;
alter table public.project_rooms add column if not exists author text not null default '회원';
alter table public.project_rooms add column if not exists writer_tag text;
alter table public.project_updates add column if not exists author text not null default '회원';
alter table public.project_updates add column if not exists writer_tag text;

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

drop trigger if exists knowledge_comments_set_updated_at on public.knowledge_comments;
create trigger knowledge_comments_set_updated_at before update on public.knowledge_comments for each row execute function public.set_updated_at();
drop trigger if exists project_comments_set_updated_at on public.project_comments;
create trigger project_comments_set_updated_at before update on public.project_comments for each row execute function public.set_updated_at();

create index if not exists knowledge_comments_post_id_idx on public.knowledge_comments(post_id, created_at);
create index if not exists project_comments_project_id_idx on public.project_comments(project_id, created_at);

alter table public.knowledge_comments enable row level security;
alter table public.project_comments enable row level security;

revoke all on public.knowledge_comments, public.project_comments from anon, authenticated;
grant select on public.knowledge_comments, public.project_comments to anon, authenticated;
grant all on public.knowledge_comments, public.project_comments to service_role;

drop policy if exists "community read knowledge comments" on public.knowledge_comments;
create policy "community read knowledge comments" on public.knowledge_comments for select to anon, authenticated using (true);
drop policy if exists "community read project comments" on public.project_comments;
create policy "community read project comments" on public.project_comments for select to anon, authenticated using (true);
