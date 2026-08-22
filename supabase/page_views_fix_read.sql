-- If you already ran the first page_views.sql, run THIS once to fix
-- refresh-always-shows-0 on /insights/notes (GET was blocked by RLS).

create or replace function public.get_page_views()
returns table (slug text, views bigint)
language sql
security definer
set search_path = public
stable
as $$
  select p.slug, p.views from public.page_views p;
$$;

drop policy if exists "Public read page_views" on public.page_views;
create policy "Public read page_views"
  on public.page_views
  for select
  using (true);

revoke all on function public.get_page_views() from public;
grant execute on function public.get_page_views() to service_role;
grant execute on function public.get_page_views() to anon, authenticated;

-- Writes were already working; keep execute available for either key type.
grant execute on function public.increment_page_view(text) to service_role;
grant execute on function public.increment_page_view(text) to anon, authenticated;
