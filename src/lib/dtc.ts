import { getSupabaseBrowserClient } from "@/lib/supabase-client";

// Trouble-code meanings from public.dtc_definitions (Wal33D/dtc-database, MIT).
// The same P1xxx code can mean different things per manufacturer, so lookups
// prefer the selected vehicle's make (and its parent/sister brands).

type DtcRow = { code: string; manufacturer: string; description: string; is_generic: boolean };

export type DtcMeaning = { manufacturer: string; description: string };

export type DtcLookup = {
  code: string;
  system: string;
  manufacturerSpecific: boolean;
  // Best meaning for the selected vehicle, or null when the database has none for this make.
  primary: DtcMeaning | null;
  primarySource: "make" | "related-make" | "generic" | null;
  generic: DtcMeaning | null;
  otherMakes: DtcMeaning[];
};

const systems: Record<string, string> = { P: "Powertrain", B: "Body", C: "Chassis", U: "Network" };

// Database manufacturer names to try for each make, most specific first.
const makeAliases: Record<string, string[]> = {
  ACURA: ["ACURA", "HONDA"],
  AUDI: ["AUDI", "VOLKSWAGEN"],
  BMW: ["BMW"],
  BUICK: ["BUICK", "GM"],
  CADILLAC: ["CADILLAC", "GM"],
  CHEVROLET: ["CHEVY", "GM"],
  CHEVY: ["CHEVY", "GM"],
  CHRYSLER: ["CHRYSLER"],
  DODGE: ["DODGE", "CHRYSLER"],
  GEO: ["GEO", "CHEVY", "GM"],
  GMC: ["GMC", "GM"],
  HONDA: ["HONDA"],
  INFINITI: ["INFINITI", "NISSAN"],
  JAGUAR: ["JAGUAR"],
  JEEP: ["JEEP", "CHRYSLER"],
  KIA: ["KIA"],
  LEXUS: ["LEXUS", "TOYOTA"],
  LINCOLN: ["LINCOLN", "FORD"],
  MAZDA: ["MAZDA"],
  "MERCEDES-BENZ": ["MERCEDES"],
  MERCEDES: ["MERCEDES"],
  MERCURY: ["MERCURY", "FORD"],
  MINI: ["BMW"],
  MITSUBISHI: ["MITSUBISHI"],
  NISSAN: ["NISSAN"],
  OLDSMOBILE: ["OLDSMOBILE", "GM"],
  PLYMOUTH: ["PLYMOUTH", "CHRYSLER"],
  PONTIAC: ["PONTIAC", "GM"],
  RAM: ["DODGE", "CHRYSLER"],
  SATURN: ["SATURN", "GM"],
  SCION: ["TOYOTA"],
  SUBARU: ["SUBARU"],
  SUZUKI: ["SUZUKI"],
  TOYOTA: ["TOYOTA"],
  VOLKSWAGEN: ["VOLKSWAGEN"],
  VW: ["VOLKSWAGEN"],
  FORD: ["FORD"]
};

export function makeToDtcManufacturers(make: string) {
  const key = make.trim().toUpperCase();
  return makeAliases[key] ?? (key ? [key] : []);
}

// "p0300, P1101 c0035" -> ["P0300", "P1101", "C0035"]
export function parseDtcCodes(input: string) {
  const codes = input.toUpperCase().match(/\b[PBCU][0-9A-F]{4}\b/g) ?? [];
  return [...new Set(codes)];
}

// SAE J2012: second character 1 (and P3000-P33FF) is manufacturer-controlled.
function isManufacturerSpecific(code: string) {
  const second = code[1];
  if (second === "1") return true;
  if (code[0] === "P" && second === "3") return code[2] <= "3";
  return code[0] !== "P" && (second === "2" || second === "3");
}

export async function lookupDtcCodes(codes: string[], make: string): Promise<DtcLookup[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !codes.length) return [];
  const { data, error } = await supabase
    .from("dtc_definitions")
    .select("code,manufacturer,description,is_generic")
    .in("code", codes);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as DtcRow[];
  const preferred = makeToDtcManufacturers(make);

  return codes.map((code) => {
    const matches = rows.filter((row) => row.code === code);
    const generic = matches.find((row) => row.manufacturer === "GENERIC") ?? null;
    const exact = preferred[0] ? matches.find((row) => row.manufacturer === preferred[0]) : undefined;
    const related = exact ? undefined : preferred.slice(1).map((name) => matches.find((row) => row.manufacturer === name)).find(Boolean);
    const specific = isManufacturerSpecific(code);

    // Generic codes read the same on every vehicle; manufacturer codes only trust this make's own entry.
    let primary: DtcRow | null = null;
    let primarySource: DtcLookup["primarySource"] = null;
    if (exact) { primary = exact; primarySource = "make"; }
    else if (related) { primary = related; primarySource = "related-make"; }
    else if (!specific && generic) { primary = generic; primarySource = "generic"; }

    const shown = new Set([primary?.manufacturer, "GENERIC"]);
    return {
      code,
      system: systems[code[0]] ?? "Unknown",
      manufacturerSpecific: specific,
      primary: primary ? { manufacturer: primary.manufacturer, description: primary.description } : null,
      primarySource,
      generic: generic ? { manufacturer: "GENERIC", description: generic.description } : null,
      otherMakes: matches
        .filter((row) => !shown.has(row.manufacturer) && row.manufacturer !== "OTHER")
        .map((row) => ({ manufacturer: row.manufacturer, description: row.description }))
    };
  });
}
