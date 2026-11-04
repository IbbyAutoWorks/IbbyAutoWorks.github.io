// Loads one NHTSA bulletin data file per call, on a schedule, so no single run gets too big.
// The files are public data on a GitHub release, built by scripts/build-bulletin-data.py.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("IB_SUPABASE_SECRET_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const FILES = "https://github.com/IbbyAutoWorks/IbbyAutoWorks.github.io/releases/download/data-bulletins-2026-11";
const DATABASE_STOP_BYTES = 450e6;
const BATCH = 1000;

type DataFile = {
  bulletins: [number, string, string | null, string, string, string][];
  models: [string, number[], number][];
};

async function inBatches<T>(table: string, rows: T[]) {
  for (let start = 0; start < rows.length; start += BATCH) {
    const { error } = await supabase.from(table).upsert(rows.slice(start, start + BATCH));
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

serve(async (req) => {
  const { data: token } = await supabase.from("integration_keys").select("value").eq("name", "cron_token").maybeSingle();
  if (!token?.value || req.headers.get("x-ibby-cron") !== token.value) return json(401, { ok: false, error: "Not allowed" });

  const { data: databaseBytes } = await supabase.rpc("app_db_bytes");
  if (Number(databaseBytes ?? 0) >= DATABASE_STOP_BYTES) return json(200, { ok: true, stopped: "database near its limit" });

  const { data: fileNumber, error: claimError } = await supabase.rpc("claim_bulletin_file");
  if (claimError) return json(500, { ok: false, error: claimError.message });
  if (fileNumber === null || fileNumber === undefined) return json(200, { ok: true, finished: true });

  try {
    const response = await fetch(`${FILES}/bulletins-${String(fileNumber).padStart(4, "0")}.json`);
    if (!response.ok) throw new Error(`data file ${response.status}`);
    const data = await response.json() as DataFile;
    await inBatches("bulletins", data.bulletins.map(([id, number, issued_on, kind, components, summary]) => ({ id, number, issued_on, kind, components, summary })));
    await inBatches("bulletin_models", data.models.map(([model_key, years, bulletin_id]) => ({ model_key, years, bulletin_id })));
    await supabase.from("bulletin_load").update({ status: "done", error: null }).eq("file_number", fileNumber);
    return json(200, { ok: true, file: fileNumber });
  } catch (error) {
    await supabase.from("bulletin_load").update({ status: "pending", error: String(error).slice(0, 300) }).eq("file_number", fileNumber);
    return json(200, { ok: false, file: fileNumber, error: String(error) });
  }
});
