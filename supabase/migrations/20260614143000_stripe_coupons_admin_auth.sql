alter table public.promotion_offers
  add column if not exists stripe_coupon_id text,
  add column if not exists stripe_promotion_code_id text,
  add column if not exists stripe_promotion_code text;

create index if not exists idx_promotion_offers_stripe_coupon on public.promotion_offers(stripe_coupon_id);
create index if not exists idx_promotion_offers_stripe_promo_code on public.promotion_offers(stripe_promotion_code_id);

create table if not exists public.admin_profiles (
  user_id uuid primary key,
  username text unique not null,
  email text unique not null,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

drop policy if exists "No direct browser reads or writes to admin profiles" on public.admin_profiles;
create policy "No direct browser reads or writes to admin profiles" on public.admin_profiles
for all using (false) with check (false);
