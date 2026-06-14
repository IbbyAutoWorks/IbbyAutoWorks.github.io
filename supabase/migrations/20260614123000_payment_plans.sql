create extension if not exists pgcrypto;

create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null check (category in ('service','parts','tires','roadside','bundle','custom')),
  summary text not null default '',
  deposit_label text not null default '',
  terms text not null default '',
  amount_cents integer not null default 0 check (amount_cents >= 0),
  currency text not null default 'usd',
  mode text not null default 'payment' check (mode in ('payment','subscription')),
  active boolean not null default true,
  stripe_product_id text,
  stripe_price_id text,
  stripe_payment_link_id text,
  stripe_payment_link_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payment_plans_active on public.payment_plans(active);
create index if not exists idx_payment_plans_category on public.payment_plans(category);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  stripe_event_id text unique,
  event_type text not null,
  work_order_id text,
  customer_email text,
  amount_cents integer,
  currency text default 'usd',
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_events_work_order on public.payment_events(work_order_id);
create index if not exists idx_payment_events_type on public.payment_events(event_type);

create or replace function public.set_payment_plan_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payment_plans_set_updated_at on public.payment_plans;
create trigger payment_plans_set_updated_at
before update on public.payment_plans
for each row execute function public.set_payment_plan_updated_at();

alter table public.payment_plans enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "Public can read active payment plans" on public.payment_plans;
create policy "Public can read active payment plans" on public.payment_plans
for select using (active = true);

drop policy if exists "No direct browser writes to payment plans" on public.payment_plans;
create policy "No direct browser writes to payment plans" on public.payment_plans
for all using (false) with check (false);

drop policy if exists "No direct browser reads or writes to payment events" on public.payment_events;
create policy "No direct browser reads or writes to payment events" on public.payment_events
for all using (false) with check (false);

insert into public.payment_plans (slug,title,category,summary,deposit_label,terms,amount_cents,mode,active)
values
  ('service-split-pay','Service Split-Pay','service','Split approved labor and service cost into a deposit plus scheduled balance payments.','25% service deposit','Suggested: 25% deposit, remaining balance split over 2-4 payments before final release.',10000,'payment',true),
  ('parts-ease','Parts Ease Plan','parts','Helps customers cover required parts before the job starts without hiding the true parts cost.','Parts ordering deposit','Suggested: parts deposit before ordering, remaining parts balance due before install or delivery.',10000,'payment',true),
  ('tire-flex','Tire Flex Plan','tires','For tire purchases when the customer needs the tires but cannot cover the full set immediately.','Tire hold/order deposit','Suggested: per-tire or axle-pair schedule, final balance due before mounting/balancing completion.',10000,'payment',true),
  ('roadside-assist-monthly','Roadside Assist Monthly','roadside','Optional roadside help package for local emergency service, jump starts, spare swaps, and mobile triage.','Plan activation payment','Test monthly roadside support placeholder.',1900,'subscription',true),
  ('multi-job-bundle','Multi-Job Bundle','bundle','Package multiple approved maintenance or repair jobs together with staged payments.','Bundle deposit','Suggested: quote the full bundle, collect deposit, then unlock each job stage as payments clear.',25000,'payment',true)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  deposit_label = excluded.deposit_label,
  terms = excluded.terms,
  amount_cents = excluded.amount_cents,
  mode = excluded.mode,
  active = excluded.active;
