-- Keys the owner enters on the Connections page. Only edge functions (service role)
-- can read them: RLS is on with no policies, and browsers only learn "set / not set".
create table if not exists public.integration_keys (
  name text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.integration_keys enable row level security;
revoke all on public.integration_keys from anon, authenticated;

insert into public.integration_keys (name, value)
values ('cron_token', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (name) do nothing;

-- Customer emails for job updates, only when the customer asked for them.
create or replace function public.queue_status_emails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_status text := new.payload ->> 'status';
  wants_updates boolean := (new.payload -> 'customerPreferences' ->> 'notifications') = 'true';
  appointment text := new.payload ->> 'appointmentDate';
  details jsonb;
begin
  if next_status is not distinct from (old.payload ->> 'status')
     or not wants_updates
     or coalesce(new.email, '') !~ '^\S+@\S+\.\S+$' then
    return new;
  end if;

  details := jsonb_build_object(
    'customerName', new.customer_name,
    'vehicle', new.payload ->> 'vehicle',
    'services', new.payload ->> 'service',
    'preferredWindow', new.payload ->> 'preferredWindow'
  );

  if next_status = 'Scheduled' then
    insert into email_events (user_id, work_order_id, event_type, recipient_email, subject, payload)
    values (new.user_id, new.id, 'appointment_confirmed', new.email, 'Your Ibby Auto Works appointment', details);
    if appointment ~ '^\d{4}-\d{2}-\d{2}$' and appointment::date - 1 >= current_date then
      insert into email_events (user_id, work_order_id, event_type, recipient_email, subject, payload, scheduled_for)
      values (new.user_id, new.id, 'appointment_reminder', new.email, 'Reminder: Ibby Auto Works is coming tomorrow', details,
              ((appointment::date - 1)::timestamp + time '12:00') at time zone 'America/New_York');
    end if;
  elsif next_status = 'En Route' then
    insert into email_events (user_id, work_order_id, event_type, recipient_email, subject, payload)
    values (new.user_id, new.id, 'en_route', new.email, 'Your technician is on the way', details);
  elsif next_status = 'Complete' then
    insert into email_events (user_id, work_order_id, event_type, recipient_email, subject, payload)
    values (new.user_id, new.id, 'work_complete', new.email, 'Your Ibby Auto Works service is complete', details);
    insert into email_events (user_id, work_order_id, event_type, recipient_email, subject, payload, scheduled_for)
    values (new.user_id, new.id, 'next_service', new.email, 'Time to check in on your vehicle', details, now() + interval '6 months');
  end if;
  return new;
end;
$$;

revoke execute on function public.queue_status_emails() from public, anon, authenticated;

drop trigger if exists work_orders_queue_status_emails on public.work_orders;
create trigger work_orders_queue_status_emails
  after update of payload on public.work_orders
  for each row execute function public.queue_status_emails();

-- Every 5 minutes, ask the automation function to send what's due.
create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.schedule('ibby-send-customer-email', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://cqdlqdzmnylywctlsklp.supabase.co/functions/v1/ibby-automation',
    headers := jsonb_build_object('content-type', 'application/json', 'x-ibby-cron', (select value from public.integration_keys where name = 'cron_token')),
    body := '{}'::jsonb
  );
$job$);
