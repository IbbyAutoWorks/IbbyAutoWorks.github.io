import type { Bulletin } from "@/lib/nhtsa-issues";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { VehicleConfig } from "@/lib/vehicle-data";

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const PAGE = 1000; // The most Supabase returns in one call.

type Row = { id: number; number: string; issued_on: string | null; components: string; summary: string };

// The shop's own copy of NHTSA's bulletins, newest first. The database decides which model names count.
// Every page is read so that searching the list covers all of them.
export async function fetchStoredBulletins(config: Pick<VehicleConfig, "year" | "make" | "model">): Promise<Bulletin[]> {
  const supabase = getSupabaseBrowserClient();
  const year = Number(config.year);
  if (!supabase || !year || !config.make || !config.model) return [];
  const args = { p_model_key: `${squash(config.make)}|${squash(config.model)}`, p_year: year };

  const rows: Row[] = [];
  for (;;) {
    const { data, error } = await supabase.rpc("stored_bulletins", args).range(rows.length, rows.length + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []) as Row[]);
    if ((data ?? []).length < PAGE) break;
  }
  return rows.map((item) => ({ id: item.id, number: item.number, date: item.issued_on ?? "", summary: item.summary, component: item.components }));
}
