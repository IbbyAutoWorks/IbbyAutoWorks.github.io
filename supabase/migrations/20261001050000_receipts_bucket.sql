-- Private receipt storage for the tax records: owner-only upload and read (the app
-- shows receipts through short-lived signed URLs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

drop policy if exists receipts_owner_insert on storage.objects;
create policy receipts_owner_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'receipts' and public.is_owner());

drop policy if exists receipts_owner_read on storage.objects;
create policy receipts_owner_read on storage.objects
  for select to authenticated using (bucket_id = 'receipts' and public.is_owner());

drop policy if exists receipts_owner_delete on storage.objects;
create policy receipts_owner_delete on storage.objects
  for delete to authenticated using (bucket_id = 'receipts' and public.is_owner());
