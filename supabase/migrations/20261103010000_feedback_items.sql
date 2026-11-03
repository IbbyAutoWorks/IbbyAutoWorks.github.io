-- In-app problem reports and feature requests. Written only by the ibby-feedback
-- function; contact details stay here and are not copied to the public GitHub issue.

create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('issue', 'feature')),
  title text not null,
  details text not null,
  contact text not null default '',
  page text not null default '',
  github_url text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists feedback_items_created_at_idx on public.feedback_items (created_at desc);

alter table public.feedback_items enable row level security;

create policy feedback_items_owner_read on public.feedback_items
  for select to authenticated using (is_owner());
