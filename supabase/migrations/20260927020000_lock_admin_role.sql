-- Close privilege escalation: is_admin() trusted profiles.role, which any signed-in
-- user could set on their own row via profiles_update_own_or_admin.

-- 1. Admin status comes only from the server-controlled admin_profiles table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
      and active
      and role in ('admin', 'staff')
  );
$$;

-- 2. Browser roles may only edit harmless profile columns, never role.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, phone, marketing_opt_in) on public.profiles to authenticated;

-- 3. Trigger-only / helper functions should not be callable anonymously over RPC.
-- is_admin() stays executable by anon: public-read policies (e.g. appointment_blocks)
-- call it, and it only ever returns false without a session.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 4. Pin search_path on updated_at trigger functions (advisor 0011).
alter function public.set_updated_at() set search_path = public;
alter function public.set_tax_settings_updated_at() set search_path = public;
alter function public.set_payment_plan_updated_at() set search_path = public;
alter function public.set_promotion_offer_updated_at() set search_path = public;
