-- Owner settings every device needs (prices, coupons, payment options, branding).
-- business_settings is publicly readable, so nothing secret may be stored this way.
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
  if setting_name not in ('pricing', 'marketing', 'payment', 'theme', 'branding', 'prayer', 'taxBooks') then
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

revoke all on function public.save_shared_setting(text, jsonb) from public, anon;
grant execute on function public.save_shared_setting(text, jsonb) to authenticated;

-- Maine: separately stated labor is not taxed (MRS Instructional Bulletin 1).
update public.tax_settings set labor_taxable = false, diagnostic_taxable = false where id = 'maine-default';
