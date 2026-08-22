-- Blog view counters (rauchg.com style).
-- Run once in the Supabase SQL editor.

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

alter table public.page_views enable row level security;
revoke all on function public.increment_page_view(text) from public;
grant execute on function public.increment_page_view(text) to service_role;
