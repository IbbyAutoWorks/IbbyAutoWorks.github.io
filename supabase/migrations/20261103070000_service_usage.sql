-- Running counts of outside services, so the owner can see usage and the app can stop before a limit.
create table if not exists public.service_usage (
  day date not null default (now() at time zone 'utc')::date,
  service text not null,
  used int not null default 0,
  primary key (day, service)
);
alter table public.service_usage enable row level security;
revoke all on public.service_usage from anon, authenticated;

create or replace function public.bump_usage(service_name text, amount int default 1)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.service_usage (service, used) values (service_name, amount)
  on conflict (day, service) do update set used = public.service_usage.used + excluded.used;
$$;

create or replace function public.app_db_bytes()
returns bigint
language sql
security definer
set search_path = ''
as $$
  select pg_catalog.pg_database_size(pg_catalog.current_database());
$$;

revoke all on function public.bump_usage(text, int) from public, anon, authenticated;
revoke all on function public.app_db_bytes() from public, anon, authenticated;
grant execute on function public.bump_usage(text, int) to service_role;
grant execute on function public.app_db_bytes() to service_role;
