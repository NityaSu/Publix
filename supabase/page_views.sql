-- Blog view counters (rauchg.com style).
-- Run once in the Supabase SQL editor (or re-run safely — idempotent).

create table if not exists public.page_views (
  slug text primary key,
  views bigint not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.increment_page_view(page_slug text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into public.page_views (slug, views)
  values (page_slug, 1)
  on conflict (slug)
  do update set
    views = public.page_views.views + 1,
    updated_at = now()
  returning views into new_count;

  return new_count;
end;
$$;

-- Read path used by GET /api/views — bypasses RLS so the notes list
-- can load counts even when the table has RLS and no broad grants.
create or replace function public.get_page_views()
returns table (slug text, views bigint)
language sql
security definer
set search_path = public
stable
as $$
  select p.slug, p.views from public.page_views p;
$$;

alter table public.page_views enable row level security;

-- Public blog counts: anyone may read. Writes only via increment_page_view.
drop policy if exists "Public read page_views" on public.page_views;
create policy "Public read page_views"
  on public.page_views
  for select
  using (true);

revoke all on function public.increment_page_view(text) from public;
revoke all on function public.get_page_views() from public;

grant execute on function public.increment_page_view(text) to service_role;
grant execute on function public.get_page_views() to service_role;
-- Allow anon too if SUPABASE_KEY is the anon key in some envs.
grant execute on function public.increment_page_view(text) to anon, authenticated;
grant execute on function public.get_page_views() to anon, authenticated;
