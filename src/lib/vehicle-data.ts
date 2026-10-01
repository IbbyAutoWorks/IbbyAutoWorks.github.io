// Full year/make/model/engine catalog from free government sources:
// - NHTSA vPIC: clean model names for every make/year (incl. heavy-duty trucks and vans)
//   and VIN decoding.
// - fueleconomy.gov (EPA): engine / transmission / drivetrain versions for 1984+
//   passenger vehicles and light trucks.
// Both allow browser requests, so no backend is needed. Responses are cached per session.

export type VehicleConfig = {
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  displacement: string;
  cylinders: string;
  drive: string;
  transmission: string;
  fuel: string;
  body: string;
  vin: string;
  epaOptionId?: string;
  source: "vin" | "catalog" | "manual";
};

export type EngineOption = {
  id: string;
  label: string;
  epaModel: string;
  displacement: string;
  cylinders: string;
  transmission: string;
  drive: string;
  fuel: string;
};

export const emptyVehicleConfig: VehicleConfig = {
  year: "", make: "", model: "", trim: "", engine: "", displacement: "", cylinders: "",
  drive: "", transmission: "", fuel: "", body: "", vin: "", source: "manual"
};

const VPIC = "https://vpic.nhtsa.dot.gov/api/vehicles";
const EPA = "https://www.fueleconomy.gov/ws/rest/vehicle/menu";
const memory = new Map<string, unknown>();

async function cachedJson<T>(url: string): Promise<T> {
  if (memory.has(url)) return memory.get(url) as T;
  try {
    const saved = window.sessionStorage.getItem(`ibby-vehicle:${url}`);
    if (saved) {
      const parsed = JSON.parse(saved) as T;
      memory.set(url, parsed);
      return parsed;
    }
  } catch { /* storage unavailable */ }
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Vehicle data request failed (${response.status})`);
  const data = await response.json() as T;
  memory.set(url, data);
  try { window.sessionStorage.setItem(`ibby-vehicle:${url}`, JSON.stringify(data)); } catch { /* quota */ }
  return data;
}

type EpaMenu = { menuItem?: { text: string; value: string } | Array<{ text: string; value: string }> };
function menuItems(menu: EpaMenu) {
  if (!menu.menuItem) return [];
  return Array.isArray(menu.menuItem) ? menu.menuItem : [menu.menuItem];
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function titleCaseMake(make: string) {
  const special: Record<string, string> = { BMW: "BMW", GMC: "GMC", RAM: "Ram", MINI: "MINI", "MERCEDES-BENZ": "Mercedes-Benz", "LAND ROVER": "Land Rover", "ALFA ROMEO": "Alfa Romeo" };
  const upper = make.trim().toUpperCase();
  return special[upper] ?? upper.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function vehicleYears() {
  const newest = new Date().getFullYear() + 1;
  return Array.from({ length: newest - 1980 + 1 }, (_, index) => String(newest - index));
}

const fallbackMakes = ["Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Mercury", "MINI", "Mitsubishi", "Nissan", "Pontiac", "Ram", "Saturn", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"];

export async function listMakes(year: string): Promise<string[]> {
  if (Number(year) < 1984) return fallbackMakes;
  try {
    const makes = menuItems(await cachedJson<EpaMenu>(`${EPA}/make?year=${year}`)).map((item) => item.text);
    return makes.length ? makes : fallbackMakes;
  } catch {
    return fallbackMakes;
  }
}

export async function listModels(year: string, make: string): Promise<string[]> {
  const models = new Set<string>();
  // vPIC matches the make name loosely ("Ford" also returns "Bradford Built" trailers),
  // so keep exact make matches and road-vehicle types only.
  const types = ["car", "truck", "multipurpose passenger vehicle (mpv)"];
  await Promise.all(types.map(async (type) => {
    try {
      const vpic = await cachedJson<{ Results?: Array<{ Make_Name: string; Model_Name: string }> }>(
        `${VPIC}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}/vehicletype/${encodeURIComponent(type)}?format=json`
      );
      for (const row of vpic.Results ?? []) {
        const name = row.Model_Name?.trim() ?? "";
        // Skip registry oddities such as replica-car entries named "'34".
        if (row.Make_Name?.trim().toLowerCase() === make.trim().toLowerCase() && /^[A-Za-z0-9]/.test(name)) models.add(name);
      }
    } catch { /* fall back to EPA below */ }
  }));
  if (!models.size && Number(year) >= 1984) {
    try {
      for (const item of menuItems(await cachedJson<EpaMenu>(`${EPA}/model?year=${year}&make=${encodeURIComponent(make)}`))) models.add(item.text);
    } catch { /* offline */ }
  }
  return [...models].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function driveFromText(text: string) {
  const match = text.match(/\b(AWD|4WD|4x4|2WD|FWD|RWD)\b/i);
  return match ? match[1].toUpperCase().replace("4X4", "4WD") : "";
}

// "Auto (S8), 4 cyl, 2.5 L, SIDI & PFI; Stop-Start" -> parts
function parseEpaOption(text: string) {
  const [transmission = "", cylinderPart = "", displacementPart = ""] = text.split(",").map((part) => part.trim());
  const cylinders = cylinderPart.match(/(\d+)\s*cyl/i)?.[1] ?? "";
  const displacement = displacementPart.match(/([\d.]+)\s*L/i)?.[1] ?? "";
  const fuel = /electric|EV/i.test(text) && !cylinders ? "Electric" : /diesel/i.test(text) ? "Diesel" : /hybrid/i.test(text) ? "Hybrid" : "";
  return { transmission, cylinders, displacement, fuel };
}

// EPA versions (drivetrain/trim splits plus engine+transmission) that belong to this model.
export async function listEngineOptions(year: string, make: string, model: string): Promise<EngineOption[]> {
  if (Number(year) < 1984 || !model) return [];
  let epaModels: string[] = [];
  try {
    epaModels = menuItems(await cachedJson<EpaMenu>(`${EPA}/model?year=${year}&make=${encodeURIComponent(make)}`)).map((item) => item.text);
  } catch {
    return [];
  }
  const target = normalize(model);
  const matching = epaModels.filter((epaModel) => {
    const candidate = normalize(epaModel);
    return candidate.startsWith(target) || target.startsWith(candidate);
  }).slice(0, 12);

  const options: EngineOption[] = [];
  await Promise.all(matching.map(async (epaModel) => {
    try {
      const menu = await cachedJson<EpaMenu>(`${EPA}/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(epaModel)}`);
      for (const item of menuItems(menu)) {
        const parsed = parseEpaOption(item.text);
        options.push({
          id: item.value,
          label: `${epaModel} - ${item.text}`,
          epaModel,
          drive: driveFromText(epaModel),
          ...parsed
        });
      }
    } catch { /* skip this version */ }
  }));
  // EPA sometimes lists two versions with identical descriptions; one entry is enough.
  const unique = [...new Map(options.map((option) => [option.label, option])).values()];
  return unique.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

export function engineLabel(config: Pick<VehicleConfig, "displacement" | "cylinders" | "engine" | "fuel">) {
  if (config.engine) return config.engine;
  const parts = [config.displacement ? `${config.displacement}L` : "", config.cylinders ? `${config.cylinders}-cyl` : "", config.fuel && config.fuel !== "Gasoline" ? config.fuel : ""];
  return parts.filter(Boolean).join(" ");
}

export function vehicleConfigLabel(config: VehicleConfig) {
  return [config.year, config.make, config.model, config.trim].filter(Boolean).join(" ").trim();
}

// Library key for specs: one spec sheet per year/make/model/engine.
export function vehicleSpecKey(config: Pick<VehicleConfig, "year" | "make" | "model" | "displacement" | "cylinders" | "engine">) {
  const engine = config.displacement ? `${Number(config.displacement).toFixed(1)}l${config.cylinders ? `-${config.cylinders}` : ""}` : normalize(config.engine);
  return [config.year, normalize(config.make), normalize(config.model), engine || "any"].join("|");
}

export function applyEngineOption(config: VehicleConfig, option: EngineOption | null): VehicleConfig {
  if (!option) return { ...config, epaOptionId: undefined };
  return {
    ...config,
    epaOptionId: option.id,
    displacement: option.displacement || config.displacement,
    cylinders: option.cylinders || config.cylinders,
    transmission: option.transmission || config.transmission,
    drive: option.drive || config.drive,
    fuel: option.fuel || config.fuel,
    engine: ""
  };
}

// Pick the EPA version that best matches what the VIN told us.
export function bestEngineMatch(options: EngineOption[], config: VehicleConfig): EngineOption | null {
  if (!options.length) return null;
  const scored = options.map((option) => {
    let score = 0;
    if (config.displacement && option.displacement && Math.abs(Number(option.displacement) - Number(config.displacement)) < 0.15) score += 4;
    if (config.cylinders && option.cylinders === config.cylinders) score += 3;
    if (config.drive && option.drive && config.drive.includes(option.drive)) score += 2;
    if (config.drive && !option.drive && /2WD|FWD|RWD/.test(config.drive)) score += 1;
    if (config.trim && normalize(option.epaModel).includes(normalize(config.trim))) score += 1;
    return { option, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0].score >= 4 ? scored[0].option : null;
}

function driveFromVpic(value: string) {
  if (/4x4|4WD|4-Wheel/i.test(value)) return "4WD";
  if (/AWD|All-Wheel/i.test(value)) return "AWD";
  if (/FWD|Front-Wheel/i.test(value)) return "FWD";
  if (/RWD|Rear-Wheel/i.test(value)) return "RWD";
  return value;
}

export async function decodeVinToConfig(vin: string): Promise<VehicleConfig> {
  const clean = vin.trim().toUpperCase();
  const payload = await cachedJson<{ Results?: Array<Record<string, string>> }>(`${VPIC}/DecodeVinValues/${encodeURIComponent(clean)}?format=json`);
  const row = payload.Results?.[0];
  // vPIC returns warnings (e.g. "1,..." for a bad check digit) yet still decodes; only fail on no make.
  if (!row || !row.Make) throw new Error(row?.ErrorText || "VIN could not be decoded.");
  const displacement = row.DisplacementL ? String(Math.round(Number(row.DisplacementL) * 10) / 10) : "";
  return {
    ...emptyVehicleConfig,
    vin: clean,
    year: row.ModelYear || "",
    make: titleCaseMake(row.Make),
    model: row.Model || "",
    trim: [row.Trim, row.Series].filter(Boolean).join(" ").trim(),
    displacement,
    cylinders: row.EngineCylinders || "",
    drive: driveFromVpic(row.DriveType || ""),
    transmission: [row.TransmissionStyle, row.TransmissionSpeeds ? `${row.TransmissionSpeeds}-speed` : ""].filter(Boolean).join(" "),
    fuel: row.FuelTypePrimary || "",
    body: row.BodyClass || "",
    engine: row.EngineModel ? `${displacement ? `${displacement}L ` : ""}${row.EngineCylinders ? `${row.EngineCylinders}-cyl ` : ""}(${row.EngineModel})`.trim() : "",
    source: "vin"
  };
}
