-- Owner's list of outside services (hosting, payments, email...). Records how to log
-- in and where the password is kept, never the password itself, plus cost data
-- that feeds the yearly tax summary.

create table if not exists public.business_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Software',
  website text not null default '',
  login_email text not null default '',
  login_method text not null default '',
  password_location text not null default '',
  plan text not null default '',
  cost_cents integer not null default 0,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'one-time', 'usage', 'free')),
  renewal_date date,
  paid_with text not null default '',
  tax_category text not null default 'Software & subscriptions',
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_services enable row level security;

create policy business_services_owner_all on public.business_services
  for all to authenticated using (is_owner()) with check (is_owner());

create trigger business_services_set_updated_at
  before update on public.business_services
  for each row execute function public.set_updated_at();

-- Services the app is known to run on. Logins/costs are left for the owner to fill.
insert into public.business_services (name, category, website, login_email, login_method, plan, billing_cycle, notes)
select * from (values
  ('Supabase', 'Hosting & database', 'https://supabase.com/dashboard/project/cqdlqdzmnylywctlsklp', '', '', '', 'monthly', 'Database, sign-in, file storage, edge functions (payments, Stripe webhook).'),
  ('Stripe', 'Payments', 'https://dashboard.stripe.com', '', '', '', 'usage', 'Card payments. Fees are per transaction; webhook goes to ibby-stripe-webhook.'),
  ('Vercel', 'Hosting', 'https://vercel.com/ibbyautoworks-projects', '', '', '', 'monthly', 'Hosts the website from the GitHub repo.'),
  ('GitHub', 'Code', 'https://github.com/IbbyAutoWorks', '', '', '', 'free', 'App source code (IbbyAutoWorks.github.io); GitHub Pages copy of the site.'),
  ('Gmail / Google account', 'Email', 'https://mail.google.com', 'ibbyautoworks@gmail.com', 'Google login', '', 'free', 'Business email; planned for calendar and notification email.'),
  ('Google Cloud', 'Cloud services', 'https://console.cloud.google.com', 'ibbyautoworks@gmail.com', 'Google login', '', 'usage', 'OAuth for Gmail/Calendar automation.'),
  ('Cloudflare', 'DNS & security', 'https://dash.cloudflare.com', '', '', '', 'free', 'Domain DNS and site protection.')
) as seed(name, category, website, login_email, login_method, plan, billing_cycle, notes)
where not exists (select 1 from public.business_services);
