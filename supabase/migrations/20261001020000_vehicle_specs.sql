-- Shop spec library: one row per year/make/model/engine. Each spec value keeps its
-- source (URL + name) and who entered it, so techs can see how much to trust it.
-- specs jsonb shape: { "<fieldId>": { "value": "...", "source": "...", "sourceUrl": "...",
--                                     "by": "<email>", "at": "<iso time>" } }

create table if not exists public.vehicle_specs (
  key text primary key,
  year text not null,
  make text not null,
  model text not null,
  engine text not null default '',
  specs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.vehicle_specs add constraint vehicle_specs_size check (octet_length(specs::text) < 200000);

alter table public.vehicle_specs enable row level security;

create policy vehicle_specs_staff_read on public.vehicle_specs
  for select to authenticated using (is_admin());
create policy vehicle_specs_staff_insert on public.vehicle_specs
  for insert to authenticated with check (is_admin());
create policy vehicle_specs_staff_update on public.vehicle_specs
  for update to authenticated using (is_admin()) with check (is_admin());

create trigger vehicle_specs_set_updated_at
  before update on public.vehicle_specs
  for each row execute function public.set_updated_at();
