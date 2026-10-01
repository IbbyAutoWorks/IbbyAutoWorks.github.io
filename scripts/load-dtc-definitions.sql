-- Reload public.dtc_definitions from supabase/seed/dtc_definitions.json in this repo.
-- Needs the http extension for the duration of the load; drop it again afterwards.
create extension if not exists http with schema extensions;
insert into public.dtc_definitions (code, manufacturer, description, type, is_generic)
select r->>0, r->>1, r->>2, r->>3, (r->>4)::boolean
from jsonb_array_elements((
  select content::jsonb from extensions.http_get(
    'https://raw.githubusercontent.com/IbbyAutoWorks/IbbyAutoWorks.github.io/main/supabase/seed/dtc_definitions.json')
)) as r
on conflict (code, manufacturer) do update set description = excluded.description, type = excluded.type, is_generic = excluded.is_generic;
drop extension if exists http;
