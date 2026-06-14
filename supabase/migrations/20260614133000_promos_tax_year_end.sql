create table if not exists public.promotion_offers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  offer_type text not null check (offer_type in ('free_service','discount_amount','discount_percent','bundle_bonus','manual_review')),
  summary text not null default '',
  applies_to text not null default 'service',
  discount_cents integer not null default 0 check (discount_cents >= 0),
  discount_percent numeric(5,2) not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  requires_purchase text not null default '',
  code text unique,
  active boolean not null default true,
  taxable_note text not null default 'Discount should reduce taxable receipt when applied before payment; verify treatment with accountant/Maine Revenue Services.',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_promotion_offers_active on public.promotion_offers(active);
create index if not exists idx_promotion_offers_applies_to on public.promotion_offers(applies_to);

create table if not exists public.tax_settings (
  id text primary key default 'maine-default',
  state text not null default 'ME',
  label text not null default 'Maine sales tax',
  sales_tax_rate numeric(6,4) not null default 0.0550,
  local_tax_rate numeric(6,4) not null default 0,
  parts_taxable boolean not null default true,
  labor_taxable boolean not null default true,
  diagnostic_taxable boolean not null default true,
  shop_supplies_taxable boolean not null default true,
  tire_fees_note text not null default 'Track tire/disposal/environmental fees separately from sales tax when charged.',
  disclaimer text not null default 'Maine generally uses a 5.5% sales tax with no local sales tax. Auto parts and repair/installation services may be taxable; verify final filing treatment with Maine Revenue Services or a tax professional.',
  updated_at timestamptz not null default now()
);

create table if not exists public.business_expense_records (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  vendor text not null default '',
  category text not null default 'supplies',
  description text not null default '',
  amount_cents integer not null default 0 check (amount_cents >= 0),
  payment_method text not null default '',
  receipt_url text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_business_expense_records_date on public.business_expense_records(expense_date);
create index if not exists idx_business_expense_records_category on public.business_expense_records(category);

create or replace function public.set_promotion_offer_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists promotion_offers_set_updated_at on public.promotion_offers;
create trigger promotion_offers_set_updated_at
before update on public.promotion_offers
for each row execute function public.set_promotion_offer_updated_at();

create or replace function public.set_tax_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tax_settings_set_updated_at on public.tax_settings;
create trigger tax_settings_set_updated_at
before update on public.tax_settings
for each row execute function public.set_tax_settings_updated_at();

alter table public.promotion_offers enable row level security;
alter table public.tax_settings enable row level security;
alter table public.business_expense_records enable row level security;

drop policy if exists "Public can read active promotion offers" on public.promotion_offers;
create policy "Public can read active promotion offers" on public.promotion_offers
for select using (active = true);

drop policy if exists "Public can read tax settings" on public.tax_settings;
create policy "Public can read tax settings" on public.tax_settings
for select using (true);

drop policy if exists "No direct browser writes to promotion offers" on public.promotion_offers;
create policy "No direct browser writes to promotion offers" on public.promotion_offers
for all using (false) with check (false);

drop policy if exists "No direct browser writes to tax settings" on public.tax_settings;
create policy "No direct browser writes to tax settings" on public.tax_settings
for all using (false) with check (false);

drop policy if exists "No direct browser reads or writes to expenses" on public.business_expense_records;
create policy "No direct browser reads or writes to expenses" on public.business_expense_records
for all using (false) with check (false);

insert into public.tax_settings (id,state,label,sales_tax_rate,local_tax_rate,parts_taxable,labor_taxable,diagnostic_taxable,shop_supplies_taxable)
values ('maine-default','ME','Maine sales tax',0.0550,0,true,true,true,true)
on conflict (id) do update set
  state = excluded.state,
  label = excluded.label,
  sales_tax_rate = excluded.sales_tax_rate,
  local_tax_rate = excluded.local_tax_rate,
  parts_taxable = excluded.parts_taxable,
  labor_taxable = excluded.labor_taxable,
  diagnostic_taxable = excluded.diagnostic_taxable,
  shop_supplies_taxable = excluded.shop_supplies_taxable;

insert into public.promotion_offers (slug,title,offer_type,summary,applies_to,discount_cents,discount_percent,requires_purchase,code,active,taxable_note)
values
  ('free-pre-inspection','Free pre-inspection','free_service','Free quick pre-inspection/visual check before a full estimate.','inspection',0,100,'New service request or approved quote follow-up','PRECHECK',true,'Free service; no taxable receipt when charged at $0.'),
  ('free-diagnostic-with-repair','Free diagnostic with approved repair','bundle_bonus','Diagnostic charge waived when the customer approves the related repair.','diagnostic',0,100,'Customer approves the related repair work','DIAGFREE',true,'Diagnostic discount should reduce the taxable diagnostic receipt when applied before payment.'),
  ('discounted-oil-change','Discounted oil change','discount_amount','Promotional discount on standard oil change service.','maintenance',1500,0,'Standard oil change appointment','OIL15',true,'Apply discount before calculating Maine sales tax when the discount is honored by the shop.'),
  ('free-tire-rotation-with-set','Free tire rotation with tire set','bundle_bonus','Free tire rotation with purchase of a full set of tires.','tires',0,100,'Purchase of a set of four tires','ROTATEFREE',true,'Free bundled service; track tire sale and any disposal/environmental fees separately.'),
  ('first-time-customer-welcome','First-time customer welcome credit','discount_amount','Small first-time-customer credit toward approved service.','service',1000,0,'First completed Ibby Auto Works service','WELCOME10',true,'Apply credit before tax when it reduces the customer charge.'),
  ('roadside-member-priority','Roadside member priority check','bundle_bonus','Priority quick check for active roadside/monthly plan members.','roadside',0,100,'Active roadside assistance plan','ROADREADY',true,'Membership/plan tax handling should be reviewed before live recurring billing.'),
  ('bundle-saver','Multi-job bundle saver','discount_percent','Percent discount when multiple approved maintenance jobs are bundled together.','bundle',0,10,'Two or more approved jobs on one estimate','BUNDLE10',true,'Apply discount to taxable line items before calculating Maine sales tax.')
on conflict (slug) do update set
  title = excluded.title,
  offer_type = excluded.offer_type,
  summary = excluded.summary,
  applies_to = excluded.applies_to,
  discount_cents = excluded.discount_cents,
  discount_percent = excluded.discount_percent,
  requires_purchase = excluded.requires_purchase,
  code = excluded.code,
  active = excluded.active,
  taxable_note = excluded.taxable_note;
