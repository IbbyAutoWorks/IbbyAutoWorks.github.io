-- Technician (staff) accounts: they work the shared job board but cannot change
-- business settings or other people's profiles. The owner role is 'admin'.

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and active and role = 'admin'
  );
$$;

-- Lets the browser decide which workspaces to show; data access is still enforced by RLS.
create or replace function public.my_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_profiles
  where user_id = auth.uid() and active
  limit 1;
$$;

revoke execute on function public.my_staff_role() from public, anon;
grant execute on function public.my_staff_role() to authenticated;

drop policy if exists business_settings_admin_write on public.business_settings;
create policy business_settings_owner_write on public.business_settings
  for all using (is_owner()) with check (is_owner());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_owner on public.profiles
  for update using (id = auth.uid() or is_owner()) with check (id = auth.uid() or is_owner());

create or replace function public.list_staff()
returns table (user_id uuid, email text, role text, active boolean, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not is_owner() then
    raise exception 'Owner access required';
  end if;
  return query
    select a.user_id, a.email, a.role, a.active, a.created_at
    from public.admin_profiles a
    order by a.role, a.email;
end;
$$;

-- Grants or removes technician access for an existing account (the tech signs up first).
create or replace function public.set_staff_role(target_email text, make_staff boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
  target_address text;
begin
  if not is_owner() then
    raise exception 'Owner access required';
  end if;

  select u.id, u.email into target_id, target_address
  from auth.users u
  where lower(u.email) = lower(trim(target_email))
  limit 1;

  if target_id is null then
    raise exception 'No account uses %. Have the technician create an account on the Account page first.', target_email;
  end if;

  if exists (select 1 from public.admin_profiles where user_id = target_id and role = 'admin') then
    raise exception 'Owner accounts cannot be changed here.';
  end if;

  if make_staff then
    insert into public.admin_profiles (user_id, username, email, role, active)
    values (target_id, target_address, target_address, 'staff', true)
    on conflict (user_id) do update set role = 'staff', active = true, updated_at = now();
  else
    delete from public.admin_profiles where user_id = target_id and role = 'staff';
  end if;
end;
$$;

revoke execute on function public.list_staff() from public, anon;
revoke execute on function public.set_staff_role(text, boolean) from public, anon;
grant execute on function public.list_staff() to authenticated;
grant execute on function public.set_staff_role(text, boolean) to authenticated;
