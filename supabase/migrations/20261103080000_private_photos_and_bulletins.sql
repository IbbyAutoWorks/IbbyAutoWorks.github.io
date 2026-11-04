-- Customer car photos move to a private folder. The public folder keeps only the owner's default pictures.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-photos', 'customer-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create or replace function public.app_storage_bytes()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum((metadata->>'size')::bigint), 0)::bigint from storage.objects;
$$;
revoke all on function public.app_storage_bytes() from public, anon;
grant execute on function public.app_storage_bytes() to authenticated, service_role;

-- Whoever uploaded it, shop staff, and the customer whose work order uses it can see a photo.
create or replace function public.can_read_customer_photo(photo_name text, photo_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
    or photo_owner = auth.uid()
    or exists (
      select 1 from public.work_orders w
      where w.user_id = auth.uid() and w.payload->>'vehicleImage' = 'private:' || photo_name
    );
$$;
revoke all on function public.can_read_customer_photo(text, uuid) from public, anon;
grant execute on function public.can_read_customer_photo(text, uuid) to authenticated;

drop policy if exists customer_photos_read on storage.objects;
create policy customer_photos_read on storage.objects for select to authenticated
  using (bucket_id = 'customer-photos' and public.can_read_customer_photo(name, owner));

drop policy if exists customer_photos_upload on storage.objects;
create policy customer_photos_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'customer-photos' and public.app_storage_bytes() < 900000000);

drop policy if exists customer_photos_staff_delete on storage.objects;
create policy customer_photos_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'customer-photos' and public.is_admin());

-- Only the owner can put a picture where the public can see it.
drop policy if exists vehicle_photos_upload on storage.objects;
create policy vehicle_photos_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'vehicle-photos' and public.is_owner() and public.app_storage_bytes() < 900000000);

-- NHTSA manufacturer bulletins, each stored once, with the models and years it applies to.
create table if not exists public.bulletins (
  id bigint primary key,
  number text not null default '',
  issued_on date,
  kind text not null default '',
  components text not null default '',
  summary text not null default ''
);

create table if not exists public.bulletin_models (
  model_key text not null,
  bulletin_id bigint not null references public.bulletins (id) on delete cascade,
  years smallint[] not null,
  primary key (model_key, bulletin_id)
);

alter table public.bulletins enable row level security;
alter table public.bulletin_models enable row level security;
revoke all on public.bulletins from anon, authenticated;
revoke all on public.bulletin_models from anon, authenticated;
grant select on public.bulletins, public.bulletin_models to authenticated;

drop policy if exists bulletins_staff_read on public.bulletins;
create policy bulletins_staff_read on public.bulletins for select to authenticated using (public.is_admin());
drop policy if exists bulletin_models_staff_read on public.bulletin_models;
create policy bulletin_models_staff_read on public.bulletin_models for select to authenticated using (public.is_admin());

-- Tracks which data files have loaded, so a failed file gets another try.
create table if not exists public.bulletin_load (
  file_number int primary key,
  status text not null default 'pending',
  tries int not null default 0,
  started_at timestamptz,
  error text
);
alter table public.bulletin_load enable row level security;
revoke all on public.bulletin_load from anon, authenticated;

insert into public.bulletin_load (file_number)
select n from generate_series(0, 81) as n
on conflict (file_number) do nothing;

create or replace function public.claim_bulletin_file()
returns int
language sql
security definer
set search_path = ''
as $$
  update public.bulletin_load
  set status = 'running', tries = tries + 1, started_at = now()
  where file_number = (
    select file_number from public.bulletin_load
    where tries < 5 and (status = 'pending' or (status = 'running' and started_at < now() - interval '5 minutes'))
    order by file_number
    limit 1
    for update skip locked
  )
  returning file_number;
$$;
revoke all on function public.claim_bulletin_file() from public, anon, authenticated;
grant execute on function public.claim_bulletin_file() to service_role;

-- Loads up to 4 files a minute until they're all in. The job does nothing after that.
select cron.schedule('ibby-bulletin-load', '* * * * *', $job$
  select net.http_post(
    url := 'https://cqdlqdzmnylywctlsklp.supabase.co/functions/v1/ibby-bulletin-load',
    headers := jsonb_build_object('content-type', 'application/json', 'x-ibby-cron', (select value from public.integration_keys where name = 'cron_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  ) from generate_series(1, 4);
$job$);
