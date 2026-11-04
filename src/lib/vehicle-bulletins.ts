import type { Bulletin } from "@/lib/nhtsa-issues";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { VehicleConfig } from "@/lib/vehicle-data";

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

type Row = { bulletins: { id: number; number: string; issued_on: string | null; components: string; summary: string } | null };

// The shop's own copy of NHTSA's bulletins. An exact model name wins; otherwise every model starting
// with that name is used, since the picker's Silverado is NHTSA's SILVERADO 1500, 2500 and so on.
export async function fetchStoredBulletins(config: Pick<VehicleConfig, "year" | "make" | "model">): Promise<Bulletin[]> {
  const supabase = getSupabaseBrowserClient();
  const year = Number(config.year);
  if (!supabase || !year || !config.make || !config.model) return [];
  const key = `${squash(config.make)}|${squash(config.model)}`;
  const columns = "bulletins(id,number,issued_on,components,summary)";

  const exact = await supabase.from("bulletin_models").select(columns).eq("model_key", key).contains("years", [year]).limit(1000);
  let rows = (exact.data ?? []) as unknown as Row[];
  if (!rows.length) {
    const close = await supabase.from("bulletin_models").select(columns).like("model_key", `${key}%`).contains("years", [year]).limit(1000);
    rows = (close.data ?? []) as unknown as Row[];
  }
  return rows.flatMap(({ bulletins: item }) => (item ? [{ id: item.id, number: item.number, date: item.issued_on ?? "", summary: item.summary, component: item.components }] : []));
}
