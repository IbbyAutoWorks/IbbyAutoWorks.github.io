-- Working days, hours, blocked dates and service area join the shared settings.
create or replace function public.save_shared_setting(setting_name text, setting_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_owner() then
    raise exception 'Only the owner can change shared settings';
  end if;
  if setting_name not in ('pricing', 'marketing', 'payment', 'theme', 'branding', 'prayer', 'taxBooks', 'schedule') then
    raise exception 'Unknown setting %', setting_name;
  end if;
  update business_settings
    set metadata = jsonb_set(
      coalesce(metadata, '{}'::jsonb),
      '{shared}',
      coalesce(metadata -> 'shared', '{}'::jsonb) || jsonb_build_object(setting_name, setting_value)
    )
    where id = 'default';
end;
$$;
