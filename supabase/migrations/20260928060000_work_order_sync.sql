-- Shared work-order board: every device reads and writes the same work_orders rows.
-- Before this, work_orders.id was a uuid while the app uses ids like "C123456", so
-- every browser sync attempt failed and the board only lived in one browser.

-- 1. Use the app's work-order ids directly (tables are empty at this point).
alter table public.email_events drop constraint if exists email_events_work_order_id_fkey;
alter table public.appointment_blocks drop constraint if exists appointment_blocks_work_order_id_fkey;

alter table public.work_orders alter column id drop default;
alter table public.work_orders alter column id type text using id::text;
alter table public.email_events alter column work_order_id type text using work_order_id::text;
alter table public.appointment_blocks alter column work_order_id type text using work_order_id::text;

alter table public.email_events
  add constraint email_events_work_order_id_fkey foreign key (work_order_id) references public.work_orders(id) on delete cascade;
alter table public.appointment_blocks
  add constraint appointment_blocks_work_order_id_fkey foreign key (work_order_id) references public.work_orders(id) on delete set null;

-- 2. Full client order document plus the client-side edit time used for last-write-wins merges.
alter table public.work_orders
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists client_updated_at timestamptz not null default now();

alter table public.work_orders drop constraint if exists work_orders_payload_size;
alter table public.work_orders add constraint work_orders_payload_size check (octet_length(payload::text) < 500000);

alter table public.work_orders drop constraint if exists work_orders_status_check;
alter table public.work_orders add constraint work_orders_status_check
  check (status in ('draft', 'requested', 'confirmed', 'in_progress', 'awaiting_payment', 'completed', 'cancelled'));

-- 3. Access: anyone may submit a new request (guest intake), only staff may change orders.
drop policy if exists work_orders_customer_insert on public.work_orders;
drop policy if exists work_orders_own_or_admin_update on public.work_orders;

create policy work_orders_submit_request on public.work_orders
  for insert to anon, authenticated
  with check (
    is_admin()
    or (status = 'requested' and (user_id is null or user_id = auth.uid()))
  );

create policy work_orders_staff_update on public.work_orders
  for update to authenticated
  using (is_admin())
  with check (is_admin());

-- 4. Queue the "request received" email server-side (browsers cannot write email_events).
create or replace function public.queue_request_received_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'requested' and coalesce(new.email, '') ~ '^\S+@\S+\.\S+$' then
    insert into public.email_events (user_id, work_order_id, event_type, recipient_email, subject, payload)
    values (
      new.user_id,
      new.id,
      'appointment_requested',
      new.email,
      'Ibby Auto Works request received',
      jsonb_build_object(
        'customerName', new.customer_name,
        'vehicle', new.vehicle->>'label',
        'services', new.service_type,
        'preferredWindow', new.requested_time_window
      )
    );
  end if;
  return new;
end;
$$;

revoke execute on function public.queue_request_received_email() from public, anon, authenticated;

drop trigger if exists work_orders_queue_request_email on public.work_orders;
create trigger work_orders_queue_request_email
  after insert on public.work_orders
  for each row execute function public.queue_request_received_email();

-- 5. Push row changes to signed-in boards (Realtime respects the select policy above).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'work_orders'
  ) then
    alter publication supabase_realtime add table public.work_orders;
  end if;
end $$;
