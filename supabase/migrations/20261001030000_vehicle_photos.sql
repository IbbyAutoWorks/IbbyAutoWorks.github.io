-- Vehicle photos live in Storage (public read, random file names) instead of
-- inside work-order payloads, where a phone photo would blow the size limit.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-photos', 'vehicle-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Signed-in users (customers for their own car, staff on jobs) may upload; only staff
-- may replace or delete.
drop policy if exists vehicle_photos_upload on storage.objects;
create policy vehicle_photos_upload on storage.objects
  for insert to authenticated with check (bucket_id = 'vehicle-photos');

drop policy if exists vehicle_photos_staff_update on storage.objects;
create policy vehicle_photos_staff_update on storage.objects
  for update to authenticated using (bucket_id = 'vehicle-photos' and public.is_admin());

drop policy if exists vehicle_photos_staff_delete on storage.objects;
create policy vehicle_photos_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'vehicle-photos' and public.is_admin());

-- Owner-chosen default picture per make/model (key "make|model") or per year
-- (key "year|make|model"). Anyone can read so customer pages show them.
create table if not exists public.vehicle_images (
  key text primary key,
  year text not null default '',
  make text not null,
  model text not null,
  image_url text not null,
  set_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.vehicle_images enable row level security;

create policy vehicle_images_public_read on public.vehicle_images
  for select using (true);
create policy vehicle_images_owner_insert on public.vehicle_images
  for insert to authenticated with check (is_owner());
create policy vehicle_images_owner_update on public.vehicle_images
  for update to authenticated using (is_owner()) with check (is_owner());
create policy vehicle_images_owner_delete on public.vehicle_images
  for delete to authenticated using (is_owner());
