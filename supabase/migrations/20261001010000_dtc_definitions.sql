-- Diagnostic trouble code lookup. Data: Wal33D/dtc-database (MIT), ~9.4k generic
-- SAE J2012 definitions plus manufacturer-specific definitions for 33 makes.
-- Rows are loaded separately (see scripts/load-dtc-definitions.py).

create table if not exists public.dtc_definitions (
  code text not null,
  manufacturer text not null,
  description text not null,
  type text not null,
  is_generic boolean not null default false,
  primary key (code, manufacturer)
);

create index if not exists dtc_definitions_code_idx on public.dtc_definitions (code);

alter table public.dtc_definitions enable row level security;

drop policy if exists dtc_definitions_public_read on public.dtc_definitions;
create policy dtc_definitions_public_read on public.dtc_definitions
  for select using (true);

revoke insert, update, delete on public.dtc_definitions from anon, authenticated;
