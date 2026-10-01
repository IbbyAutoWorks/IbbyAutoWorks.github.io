import { getCurrentSupabaseSession, getSupabaseBrowserClient } from "@/lib/supabase-client";
import { engineLabel, vehicleSpecKey, type VehicleConfig } from "@/lib/vehicle-data";

// Shop spec library (public.vehicle_specs): one sheet per year/make/model/engine,
// filled in once by whoever looks it up and reused on every later job.

export type SpecValue = { value: string; source: string; sourceUrl: string; by: string; at: string };
export type SpecSheet = Record<string, SpecValue>;

export type SpecField = { id: string; label: string; group: string; search: string };

// `search` is appended to the vehicle for the one-tap research query.
export const specFields: SpecField[] = [
  { id: "oilCapacity", label: "Engine oil capacity (with filter)", group: "Oil service", search: "oil capacity with filter" },
  { id: "oilType", label: "Oil viscosity / spec", group: "Oil service", search: "oil type viscosity" },
  { id: "oilFilter", label: "Oil filter part #", group: "Oil service", search: "oil filter part number" },
  { id: "drainPlugTorque", label: "Drain plug torque / gasket", group: "Oil service", search: "oil drain plug torque" },
  { id: "oilInterval", label: "Oil change interval", group: "Oil service", search: "oil change interval maintenance schedule" },
  { id: "lugTorque", label: "Lug nut torque", group: "Wheels & tires", search: "lug nut torque" },
  { id: "tireSize", label: "Tire size", group: "Wheels & tires", search: "tire size" },
  { id: "tirePressure", label: "Tire pressure (front / rear)", group: "Wheels & tires", search: "tire pressure psi front rear" },
  { id: "brakeFluid", label: "Brake fluid", group: "Brakes", search: "brake fluid type" },
  { id: "caliperBracketTorque", label: "Caliper bracket bolt torque", group: "Brakes", search: "brake caliper bracket bolt torque" },
  { id: "caliperPinTorque", label: "Caliper guide pin / mounting bolt torque", group: "Brakes", search: "brake caliper bolt torque" },
  { id: "rotorMinThickness", label: "Rotor minimum thickness (F / R)", group: "Brakes", search: "brake rotor minimum thickness" },
  { id: "coolantType", label: "Coolant type", group: "Fluids", search: "coolant type" },
  { id: "coolantCapacity", label: "Coolant capacity", group: "Fluids", search: "coolant capacity" },
  { id: "transFluid", label: "Transmission fluid type", group: "Fluids", search: "transmission fluid type" },
  { id: "transCapacity", label: "Transmission capacity (drain & fill / total)", group: "Fluids", search: "transmission fluid capacity drain and fill" },
  { id: "diffFluid", label: "Differential / transfer case fluid + capacity", group: "Fluids", search: "differential transfer case fluid type capacity" },
  { id: "powerSteering", label: "Power steering fluid", group: "Fluids", search: "power steering fluid type" },
  { id: "refrigerant", label: "A/C refrigerant type & charge", group: "Fluids", search: "ac refrigerant type capacity" },
  { id: "sparkPlugs", label: "Spark plug part # / gap / torque", group: "Tune-up", search: "spark plug part number gap torque" },
  { id: "airFilter", label: "Engine air filter #", group: "Tune-up", search: "engine air filter part number" },
  { id: "cabinFilter", label: "Cabin air filter #", group: "Tune-up", search: "cabin air filter part number" },
  { id: "serpentineBelt", label: "Serpentine belt #", group: "Tune-up", search: "serpentine belt part number" },
  { id: "timingService", label: "Timing belt / chain service interval", group: "Tune-up", search: "timing belt or chain replacement interval" },
  { id: "battery", label: "Battery group size / CCA", group: "Electrical", search: "battery group size" },
  { id: "wipers", label: "Wiper blade sizes (driver / passenger / rear)", group: "Electrical", search: "wiper blade size" },
  { id: "bulbs", label: "Bulb numbers (headlight / brake / turn)", group: "Electrical", search: "headlight bulb size brake light bulb" },
  { id: "notes", label: "Shop notes", group: "Notes", search: "common problems" }
];

export function specQuery(config: VehicleConfig, field?: SpecField) {
  return [config.year, config.make, config.model, engineLabel(config), field?.search].filter(Boolean).join(" ");
}

// One-tap research links for this exact vehicle (opened in a new tab).
export function researchLinks(config: VehicleConfig) {
  const vehicle = [config.year, config.make, config.model].filter(Boolean).join(" ");
  const withEngine = specQuery(config);
  const q = encodeURIComponent;
  return [
    { label: "Google: specs & capacities", url: `https://www.google.com/search?q=${q(`${withEngine} specs fluid capacities torque`)}` },
    { label: "Owner's manual (PDF)", url: `https://www.google.com/search?q=${q(`${vehicle} owner's manual pdf`)}` },
    { label: "CarCareKiosk", url: `https://www.google.com/search?q=${q(`site:carcarekiosk.com ${vehicle}`)}` },
    { label: "StartMyCar", url: `https://www.google.com/search?q=${q(`site:startmycar.com ${vehicle}`)}` },
    { label: "iFixit guides", url: `https://www.ifixit.com/Search?query=${q(`${config.make} ${config.model}`)}` },
    { label: "Maintenance schedule", url: `https://www.google.com/search?q=${q(`${vehicle} maintenance schedule`)}` },
    { label: "YouTube how-to", url: `https://www.youtube.com/results?search_query=${q(withEngine)}` },
    { label: "NHTSA recalls & TSBs", url: `https://www.nhtsa.gov/recalls?vin=${q(config.vin)}` }
  ].filter((link) => link.label !== "NHTSA recalls & TSBs" || config.vin.length === 17);
}

export async function loadSpecSheet(config: VehicleConfig): Promise<SpecSheet> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {};
  const { data, error } = await supabase.from("vehicle_specs").select("specs").eq("key", vehicleSpecKey(config)).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.specs ?? {}) as SpecSheet;
}

export async function saveSpecValue(config: VehicleConfig, fieldId: string, entry: Omit<SpecValue, "by" | "at">): Promise<SpecSheet> {
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (!supabase || !session?.user) throw new Error("Sign in as staff to save specs.");
  const key = vehicleSpecKey(config);
  // Re-read before writing so two techs saving different fields don't erase each other.
  const current = await loadSpecSheet(config);
  const specs: SpecSheet = { ...current, [fieldId]: { ...entry, by: session.user.email ?? "staff", at: new Date().toISOString() } };
  if (!entry.value.trim()) delete specs[fieldId];
  const { error } = await supabase.from("vehicle_specs").upsert({
    key,
    year: config.year,
    make: config.make,
    model: config.model,
    engine: engineLabel(config),
    specs,
    updated_by: session.user.id
  });
  if (error) throw new Error(error.message);
  return specs;
}

export type Recall = { campaign: string; component: string; summary: string; remedy: string; date: string };

export async function fetchRecalls(config: VehicleConfig): Promise<Recall[]> {
  if (!config.year || !config.make || !config.model) return [];
  const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(config.make)}&model=${encodeURIComponent(config.model)}&modelYear=${encodeURIComponent(config.year)}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json() as { results?: Array<Record<string, string>> };
  return (data.results ?? []).map((row) => ({
    campaign: row.NHTSACampaignNumber,
    component: row.Component,
    summary: row.Summary,
    remedy: row.Remedy,
    date: row.ReportReceivedDate
  }));
}
