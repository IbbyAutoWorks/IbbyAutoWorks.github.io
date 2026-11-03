-- Vehicles waiting for the nightly spec fill, and how much of the free search allowance it has used.
create table if not exists public.spec_fill_queue (
  id bigint generated always as identity primary key,
  year text not null,
  make text not null,
  model text not null,
  rank int not null default 100,
  status text not null default 'pending',
  engines_done text[] not null default '{}',
  filled int not null default 0,
  last_tried timestamptz,
  unique (year, make, model)
);
create index if not exists spec_fill_queue_next on public.spec_fill_queue (status, rank, year desc, id);

create table if not exists public.spec_fill_usage (
  day date primary key,
  credits int not null default 0
);

alter table public.spec_fill_queue enable row level security;
alter table public.spec_fill_usage enable row level security;
revoke all on public.spec_fill_queue from anon, authenticated;
revoke all on public.spec_fill_usage from anon, authenticated;

-- Common cars and trucks, newest year first. Rank 0 is kept for vehicles the shop has worked on.
insert into public.spec_fill_queue (year, make, model, rank)
select y::text, m.make, m.model, (2022 - y) * 100 + 10 + m.ord
from generate_series(2012, 2022) as y
cross join (values
  (1,'Ford','F-150'),(2,'Chevrolet','Silverado'),(3,'Ram','1500'),(4,'GMC','Sierra'),(5,'Toyota','RAV4'),
  (6,'Honda','CR-V'),(7,'Subaru','Outback'),(8,'Subaru','Forester'),(9,'Toyota','Camry'),(10,'Honda','Civic'),
  (11,'Honda','Accord'),(12,'Toyota','Corolla'),(13,'Nissan','Rogue'),(14,'Ford','Escape'),(15,'Chevrolet','Equinox'),
  (16,'Jeep','Grand Cherokee'),(17,'Jeep','Wrangler'),(18,'Jeep','Cherokee'),(19,'Toyota','Tacoma'),(20,'Toyota','Highlander'),
  (21,'Ford','Explorer'),(22,'Ford','Fusion'),(23,'Ford','Focus'),(24,'Ford','Edge'),(25,'Chevrolet','Malibu'),
  (26,'Chevrolet','Cruze'),(27,'GMC','Terrain'),(28,'Dodge','Grand Caravan'),(29,'Dodge','Charger'),(30,'Nissan','Altima'),
  (31,'Nissan','Sentra'),(32,'Hyundai','Elantra'),(33,'Hyundai','Sonata'),(34,'Hyundai','Santa Fe'),(35,'Hyundai','Tucson'),
  (36,'Kia','Sorento'),(37,'Kia','Soul'),(38,'Subaru','Impreza'),(39,'Subaru','Legacy'),(40,'Volkswagen','Jetta'),
  (41,'Mazda','CX-5'),(42,'Honda','Pilot'),(43,'Honda','Odyssey'),(44,'Toyota','Tundra'),(45,'Toyota','Sienna')
) as m(ord, make, model)
on conflict (year, make, model) do nothing;

-- Every third night, every 10 minutes from about midnight to 2 AM Maine time.
select cron.schedule('ibby-spec-fill', '*/10 5-6 */3 * *', $job$
  select net.http_post(
    url := 'https://cqdlqdzmnylywctlsklp.supabase.co/functions/v1/ibby-spec-fill',
    headers := jsonb_build_object('content-type', 'application/json', 'x-ibby-cron', (select value from public.integration_keys where name = 'cron_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 140000
  );
$job$);
