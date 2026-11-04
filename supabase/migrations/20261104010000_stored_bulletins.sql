-- One copy of each bulletin for a model and year, newest first, so a long list can be read page by page.
-- An exact model name wins, plus its numbered and HD versions: Silverado also covers Silverado 1500,
-- but Civic doesn't pull in Civic Hybrid. With no exact name, every model starting with it is used.
-- Runs as the caller, so the staff-only read rules on both tables still apply.
create or replace function public.stored_bulletins(p_model_key text, p_year smallint)
returns table (id bigint, number text, issued_on date, components text, summary text)
language sql
stable
security invoker
set search_path = ''
as $$
  with hits as (
    select m.bulletin_id, m.model_key
    from public.bulletin_models m
    where starts_with(m.model_key, p_model_key) and m.years @> array[p_year]
  ),
  has_exact as (
    select exists (select 1 from hits where model_key = p_model_key) as yes
  )
  select b.id, b.number, b.issued_on, b.components, b.summary
  from public.bulletins b
  where b.id in (
    select hits.bulletin_id
    from hits, has_exact
    where not has_exact.yes
      or hits.model_key = p_model_key
      or substr(hits.model_key, length(p_model_key) + 1) ~ '^([0-9]|hd)'
  )
  order by b.issued_on desc nulls last, b.id desc
$$;

revoke all on function public.stored_bulletins(text, smallint) from public, anon;
grant execute on function public.stored_bulletins(text, smallint) to authenticated;
