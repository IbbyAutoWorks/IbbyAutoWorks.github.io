import { readPricingSettings, type PricingSettings } from "@/lib/pricing-settings";

export type PartTier = "low" | "mid" | "high";

export type PartSupplierCandidate = {
  name: string;
  type: "Local pickup" | "Online" | "Tire";
  url: string;
  priceNote: string;
  imageNote: string;
  fulfillment: string;
};

export type RetailerJobPartResult = EstimatedJobPart & {
  url: string;
  retailerPrice: PriceRange;
};

export type RetailerEstimateResult = {
  name: string;
  type: "Local pickup" | "Online" | "Tire";
  color: string;
  fulfillment: string;
  url: string;
  parts: RetailerJobPartResult[];
  selectedParts: PriceRange;
  possibleParts: PriceRange;
  shipping: PriceRange;
  labor: PriceRange;
  marketLabor: PriceRange;
  selectedTotal: PriceRange;
  fullPartsTotal: PriceRange;
  marketTotal: PriceRange;
  average: number;
};

export type PriceRange = { min: number; max: number };

export type EstimatedJobPart = {
  name: string;
  qty: number;
  status: "selected" | "possible";
  unitPrice: PriceRange;
  totalPrice: PriceRange;
  lookupQuery: string;
};

export type ServiceEstimate = {
  service: string;
  label: string;
  parts: EstimatedJobPart[];
  selectedParts: PriceRange;
  possibleParts: PriceRange;
  partsTotal: PriceRange;
  laborHours: number;
  labor: PriceRange;
  marketLabor: PriceRange;
  total: PriceRange;
  marketTotal: PriceRange;
  savings: { amount: number; percent: number };
};


const supplierSearchBases = [
  { name: "O'Reilly Auto Parts", type: "Local pickup" as const, color: "#14964d", base: "https://www.oreillyauto.com/search?q=", fulfillment: "Local pickup or delivery where available" },
  { name: "Advance Auto Parts", type: "Local pickup" as const, color: "#f2a600", base: "https://shop.advanceautoparts.com/web/SearchResults?searchTerm=", fulfillment: "Local pickup or ship-to-home" },
  { name: "NAPA Auto Parts", type: "Local pickup" as const, color: "#145bd7", base: "https://www.napaonline.com/en/search?text=", fulfillment: "Local store pickup or PROLink when connected" },
  { name: "AutoZone", type: "Local pickup" as const, color: "#dc2b26", base: "https://www.autozone.com/searchresult?searchText=", fulfillment: "Local pickup or AutoZonePro when connected" },
  { name: "Pep Boys", type: "Local pickup" as const, color: "#d8272f", base: "https://www.pepboys.com/search?text=", fulfillment: "Local pickup/service options where available" },
  { name: "Walmart Auto", type: "Local pickup" as const, color: "#0071ce", base: "https://www.walmart.com/search?q=", fulfillment: "Local pickup or ship-to-home for common maintenance items" },
  { name: "1A Auto", type: "Online" as const, color: "#234f9b", base: "https://www.1aauto.com/search?q=", fulfillment: "Online order, how-to supported fitment check" },
  { name: "RockAuto", type: "Online" as const, color: "#7f1d1d", base: "https://www.rockauto.com/en/partsearch/?partnum=", fulfillment: "Online order, shipping time required" }
];

const tireSearchBases = [
  { name: "VIP Tires & Service", type: "Tire" as const, color: "#2f6fbd", base: "https://www.vipauto.com/tires/search?query=", fulfillment: "Regional tire/service lookup, local install confirmation required" },
  { name: "Sullivan Tire", type: "Tire" as const, color: "#b6202b", base: "https://www.sullivantire.com/search?query=", fulfillment: "Regional tire source, pickup/service confirmation required" },
  { name: "NTW", type: "Tire" as const, color: "#4c5b6b", base: "https://www.ntw.com/search?query=", fulfillment: "Wholesale tire source, account/availability confirmation required" },
  { name: "Max Finkelstein", type: "Tire" as const, color: "#6c4f9b", base: "https://www.maxfinkelstein.com/search?query=", fulfillment: "Wholesale/local distributor lookup when account access is connected" },
  { name: "Tire Rack", type: "Tire" as const, color: "#cc2530", base: "https://www.tirerack.com/tires/tires.jsp?keyword=", fulfillment: "Online tire order, installer/pickup planning required" },
  { name: "Discount Tire", type: "Tire" as const, color: "#d71920", base: "https://www.discounttire.com/search?q=", fulfillment: "Online/local tire lookup where available" },
  { name: "Mavis Discount Tire", type: "Tire" as const, color: "#1168b3", base: "https://www.mavis.com/search?q=", fulfillment: "Regional tire/service lookup" },
  { name: "Town Fair Tire", type: "Tire" as const, color: "#1f4b8f", base: "https://www.townfairtire.com/search?q=", fulfillment: "Regional tire/service lookup" },
  { name: "Tire Warehouse", type: "Tire" as const, color: "#344256", base: "https://www.tirewarehouse.net/search?query=", fulfillment: "Regional tire source, pickup/service confirmation required" }
];


export type EstimatePartCategory = {
  label: string;
  query: string;
  groups?: Array<{ label: string; parts: string[] }>;
  parts?: string[];
};

export const estimatePartCategories: EstimatePartCategory[] = [
  { label: "Brakes", query: "brakes", groups: [
    { label: "Front brakes", parts: ["front brake pads", "front brake rotors", "front brake calipers"] },
    { label: "Rear brakes", parts: ["rear brake pads", "rear brake rotors", "rear brake calipers"] },
    { label: "Brake fluids", parts: ["brake fluid"] }
  ] },
  { label: "Oil & filters", query: "oil change", parts: ["oil", "oil filter", "engine air filter", "cabin air filter", "fuel filter"] },
  { label: "Engine", query: "engine", groups: [
    { label: "Ignition and tune-up", parts: ["spark plugs", "ignition coils", "pcv valve"] },
    { label: "Belts and brackets", parts: ["serpentine belt", "drive belt tensioner", "idler pulley", "engine mount"] },
    { label: "Engine sensors", parts: ["camshaft sensor", "crankshaft sensor", "mass air flow sensor", "oxygen sensor"] }
  ] },
  { label: "Transmission", query: "transmission", groups: [
    { label: "Transmission fluids", parts: ["transmission fluid", "transmission filter", "transmission pan gasket"] },
    { label: "Transmission sensors and lines", parts: ["shift solenoid", "transmission mount", "transmission cooler line", "transmission speed sensor"] }
  ] },
  { label: "Cooling", query: "cooling", groups: [
    { label: "Fluids and caps", parts: ["coolant", "thermostat", "radiator cap"] },
    { label: "Hoses", parts: ["upper radiator hose", "lower radiator hose", "coolant hose clamps"] },
    { label: "Cooling parts and sensors", parts: ["radiator", "water pump", "cooling fan assembly", "coolant temperature sensor"] }
  ] },
  { label: "Suspension", query: "suspension", groups: [
    { label: "Front suspension", parts: ["front struts", "front shocks", "front lower control arm", "front upper control arm", "front lower ball joint", "front upper ball joint", "front sway bar links", "front sway bar bushings"] },
    { label: "Rear suspension", parts: ["rear struts", "rear shocks", "rear lower control arm", "rear upper control arm", "rear lower ball joint", "rear upper ball joint", "rear sway bar links", "rear sway bar bushings"] },
    { label: "Wheel end", parts: ["front wheel bearing hub assembly", "rear wheel bearing hub assembly"] }
  ] },
  { label: "Steering", query: "steering", groups: [
    { label: "Front steering", parts: ["front outer tie rod end", "front inner tie rod end", "rack and pinion steering rack", "steering rack boot"] },
    { label: "Power steering", parts: ["power steering pump", "power steering pressure hose", "power steering return hose", "power steering fluid"] }
  ] },
  { label: "Drivetrain", query: "drivetrain", groups: [
    { label: "Front drivetrain", parts: ["front cv axle", "front axle seal", "front wheel bearing hub assembly"] },
    { label: "Rear drivetrain", parts: ["rear cv axle", "rear axle seal", "rear wheel bearing hub assembly"] },
    { label: "Shafts and differential", parts: ["drive shaft", "u-joint", "center support bearing", "differential fluid"] }
  ] },
  { label: "Exhaust", query: "exhaust", parts: ["oxygen sensor", "catalytic converter", "exhaust manifold gasket", "exhaust flex pipe", "muffler", "resonator"] },
  { label: "Fuel", query: "fuel system", groups: [
    { label: "Fuel parts", parts: ["fuel pump", "fuel injector", "fuel pressure regulator", "gas cap"] },
    { label: "Fuel sensors and fuses", parts: ["fuel pump relay", "fuel pump fuse", "fuel pressure sensor"] },
    { label: "EVAP sensors and valves", parts: ["evap purge valve", "evap vent valve"] }
  ] },
  { label: "HVAC", query: "hvac", groups: [
    { label: "HVAC electrical", parts: ["blower motor", "blower motor resistor", "hvac blend door actuator", "ac fuse"] },
    { label: "A/C components", parts: ["ac compressor", "ac condenser", "ac expansion valve"] },
    { label: "HVAC hoses and seals", parts: ["heater core", "heater hose", "ac line o-rings"] }
  ] },
  { label: "Electrical", query: "electrical", groups: [
    { label: "Starting and charging", parts: ["battery", "alternator", "starter", "starter relay"] },
    { label: "Fuses and connectors", parts: ["main fuse", "fuse assortment", "battery terminals", "ground strap"] },
    { label: "Switches", parts: ["ignition switch"] }
  ] },
  { label: "Diagnostics", query: "engine diagnostics", parts: ["free code light check", "detailed diagnostics", "check engine light diagnostic", "ABS light diagnostic", "SRS airbag diagnostic"] },
  { label: "Lighting", query: "light bulbs", parts: ["low beam bulb", "high beam bulb", "fog light bulb", "license plate bulb", "brake light bulb", "turn signal bulb", "running light bulb", "reverse light bulb"] },
  { label: "Wipers", query: "wiper blades", parts: ["front wiper blades", "rear wiper blade", "windshield washer pump", "washer fluid reservoir", "wiper arm", "wiper motor"] },
  { label: "Tires", query: "tire fitment", parts: ["TPMS System", "P Rated", "LT Rated", "Staggered Fit", "single tire repair", "tire replacement", "tire rotation"] },
  { label: "Fluids & hoses", query: "automotive fluids hoses", groups: [
    { label: "Fluids", parts: ["brake fluid", "coolant", "transmission fluid", "power steering fluid", "differential fluid", "washer fluid"] },
    { label: "Hoses", parts: ["upper radiator hose", "lower radiator hose", "heater hose", "power steering pressure hose", "power steering return hose", "transmission cooler line"] }
  ] },
  { label: "Sensors, belts & fuses", query: "automotive sensors belts fuses", groups: [
    { label: "Sensors", parts: ["oxygen sensor", "camshaft sensor", "crankshaft sensor", "mass air flow sensor", "coolant temperature sensor", "transmission speed sensor"] },
    { label: "Belts", parts: ["serpentine belt", "drive belt tensioner", "idler pulley"] },
    { label: "Fuses and relays", parts: ["main fuse", "starter relay", "fuel pump relay", "fuse assortment"] }
  ] },
  { label: "Hardware", query: "hardware", groups: [
    { label: "Brake hardware", parts: ["brake caliper bracket bolts", "brake caliper slide pins", "brake caliper pin boot kit", "brake pad abutment clips", "brake bleeder screws"] },
    { label: "Oil and filter hardware", parts: ["engine oil drain plug", "oil drain plug gasket crush washer", "oil filter housing cap", "oil filter housing gasket", "oil pan bolts"] },
    { label: "Filter hardware", parts: ["air box clips", "cabin filter cover clips", "fuel filter clips", "fuel line quick connect clips"] },
    { label: "Wheel hardware", parts: ["wheel lug nuts", "wheel lug studs", "wheel locks", "wheel spacers", "hub centric rings"] },
    { label: "Suspension hardware", parts: ["strut mount nuts", "strut pinch bolts", "control arm bolts", "ball joint pinch bolt", "sway bar link nuts"] },
    { label: "Steering hardware", parts: ["tie rod jam nuts", "steering rack mounting bolts", "power steering line o-rings", "cotter pins"] },
    { label: "Drivetrain hardware", parts: ["cv axle nut", "axle snap ring", "driveshaft flange bolts", "u-joint straps", "differential cover bolts"] },
    { label: "Exhaust hardware", parts: ["exhaust flange bolts nuts", "exhaust manifold studs", "exhaust spring bolts", "exhaust hanger", "exhaust clamp"] },
    { label: "Cooling hardware", parts: ["radiator mounting clips", "coolant hose clamps", "thermostat housing bolts", "water pump bolts", "cooling fan clips"] },
    { label: "Fuel hardware", parts: ["fuel line clips", "fuel pump lock ring", "fuel injector o-rings", "fuel rail bolts"] },
    { label: "HVAC hardware", parts: ["ac line o-rings", "hvac case screws", "blower motor screws", "heater hose clamps"] },
    { label: "Body hardware", parts: ["body clips retainers", "push pins", "fender liner clips", "bumper cover clips", "door panel clips"] },
    { label: "Hose and line hardware", parts: ["hose clamps", "fuel line clips", "brake line clips", "vacuum hose connectors", "coolant hose clamps"] },
    { label: "Electrical hardware", parts: ["electrical connector clips", "battery terminal bolts", "ground strap bolts", "wire loom clips", "fuse assortment"] },
    { label: "General shop hardware", parts: ["metric bolt assortment", "metric nut assortment", "washer assortment", "cotter pins", "thread locker"] }
  ] }
];

export const popularEstimateQueries = [
  "front brake pads", "rear brake pads", "oil change", "front wiper blades", "low beam bulb", "battery", "single tire repair", "tire replacement", "check engine light diagnostic", "cooling", "transmission", "suspension", "exhaust", "hardware"
];

export function flatEstimateCategoryParts() {
  return estimatePartCategories.flatMap((category) => [
    ...(category.parts ?? []),
    ...(category.groups ?? []).flatMap((group) => group.parts)
  ]);
}

export function isEstimateCategoryPart(part: string) {
  const clean = String(part || "").trim().toLowerCase();
  return flatEstimateCategoryParts().some((item) => item.toLowerCase() === clean);
}

export function quantityForCategoryPart(part: string) {
  const clean = String(part || "").toLowerCase();
  if (/rotors?|calipers?|struts?|shocks?|control arm|ball joint|sway bar links?|tie rod|cv axle|wheel bearing|hub assembly|oxygen sensor|bulbs?|wiper blades/.test(clean)) return 2;
  if (/spark plugs?|ignition coils?/.test(clean)) return 4;
  if (/tire replacement|p rated|lt rated|staggered fit/.test(clean)) return 4;
  return 1;
}

export function estimateCategoryPartUnitPrice(part: string): PriceRange {
  if (/free code light check/i.test(part)) return { min: 0, max: 0 };
  if (/diagnostic trace flat rate/i.test(part)) return { min: 100, max: 100 };
  const oilQuartMatch = String(part).match(/\b(\d+(?:\.\d+)?)\s*quart\b/i);
  if (/full synthetic engine oil|motor oil|engine oil/i.test(part) && oilQuartMatch) {
    const quarts = Number(oilQuartMatch[1]) || 5;
    return { min: Math.round(quarts * 6), max: Math.round(quarts * 13) };
  }
  const bucket = priceCatalog.find((entry) => entry.match.test(part)) ?? { min: 18, max: 96 };
  return { min: bucket.min, max: bucket.max };
}

export function estimateCategoryPartTotal(part: string): PriceRange {
  return multiplyPrice(estimateCategoryPartUnitPrice(part), quantityForCategoryPart(part));
}

const priceCatalog: Array<{ match: RegExp; min: number; max: number }> = [
  { match: /strut|shock|coilover/i, min: 58, max: 184 },
  { match: /brake.*pad|pads/i, min: 24, max: 89 },
  { match: /rotor|disc/i, min: 34, max: 124 },
  { match: /caliper/i, min: 62, max: 216 },
  { match: /caliper.*bracket.*bolt|caliper.*bolt/i, min: 8, max: 28 },
  { match: /slide pin|guide pin/i, min: 7, max: 24 },
  { match: /pin boot|caliper boot/i, min: 5, max: 18 },
  { match: /abutment|pad clip|brake.*hardware|hardware kit|spring kit/i, min: 8, max: 32 },
  { match: /brake.*fluid|dot 3|dot 4/i, min: 7, max: 18 },
  { match: /alternator/i, min: 132, max: 374 },
  { match: /starter/i, min: 92, max: 286 },
  { match: /battery/i, min: 119, max: 259 },
  { match: /diagnostic trace flat rate/i, min: 100, max: 100 },
  { match: /free code light check|diagnostic scan|code scan/i, min: 0, max: 0 },
  { match: /ball joint/i, min: 22, max: 92 },
  { match: /wheel speed sensor/i, min: 22, max: 118 },
  { match: /clock spring/i, min: 68, max: 286 },
  { match: /seat belt buckle/i, min: 48, max: 214 },
  { match: /gas cap/i, min: 8, max: 32 },
  { match: /evap purge valve|evap vent valve/i, min: 24, max: 126 },
  { match: /mass air flow|maf sensor/i, min: 48, max: 186 },
  { match: /fuel pressure regulator/i, min: 34, max: 142 },
  { match: /tie rod|drag link|center link/i, min: 18, max: 88 },
  { match: /rack and pinion|steering rack/i, min: 188, max: 684 },
  { match: /power steering pump/i, min: 78, max: 246 },
  { match: /power steering hose|steering line/i, min: 28, max: 148 },
  { match: /cv axle|half shaft|drive axle/i, min: 76, max: 238 },
  { match: /drive shaft|driveshaft/i, min: 148, max: 486 },
  { match: /u-?joint|universal joint/i, min: 16, max: 64 },
  { match: /axle seal|pinion seal/i, min: 8, max: 42 },
  { match: /tire|tyre/i, min: 88, max: 248 },
  { match: /tpms/i, min: 28, max: 82 },
  { match: /engine oil|motor oil|synthetic oil/i, min: 26, max: 74 },
  { match: /drain plug|crush washer|oil drain gasket/i, min: 2, max: 9 },
  { match: /oil filter housing|filter housing gasket/i, min: 8, max: 38 },
  { match: /oil absorbent|shop towel|funnel/i, min: 4, max: 18 },
  { match: /oil filter/i, min: 5, max: 16 },
  { match: /air filter/i, min: 12, max: 36 },
  { match: /cabin air filter/i, min: 12, max: 42 },
  { match: /fuel filter/i, min: 16, max: 68 },
  { match: /transmission fluid|atf|cvt fluid/i, min: 9, max: 22 },
  { match: /transmission filter/i, min: 18, max: 74 },
  { match: /transmission pan gasket|transmission drain plug/i, min: 6, max: 34 },
  { match: /shift solenoid|transmission solenoid/i, min: 42, max: 184 },
  { match: /transmission mount/i, min: 28, max: 126 },
  { match: /cooler line|transmission cooler/i, min: 24, max: 148 },
  { match: /spark plug/i, min: 4, max: 18 },
  { match: /ignition coil/i, min: 28, max: 94 },
  { match: /pcv valve/i, min: 8, max: 32 },
  { match: /serpentine belt|drive belt/i, min: 18, max: 58 },
  { match: /coolant|antifreeze/i, min: 14, max: 36 },
  { match: /thermostat/i, min: 14, max: 68 },
  { match: /water pump/i, min: 42, max: 182 },
  { match: /radiator/i, min: 96, max: 318 },
  { match: /radiator hose|coolant hose/i, min: 16, max: 72 },
  { match: /cooling fan|radiator fan/i, min: 54, max: 238 },
  { match: /temperature sensor|coolant temp/i, min: 12, max: 58 },
  { match: /fuel pump/i, min: 72, max: 328 },
  { match: /fuel injector/i, min: 34, max: 128 },
  { match: /catalytic converter/i, min: 168, max: 884 },
  { match: /exhaust manifold/i, min: 94, max: 388 },
  { match: /exhaust gasket/i, min: 6, max: 28 },
  { match: /oxygen sensor|o2 sensor/i, min: 34, max: 168 },
  { match: /muffler|resonator/i, min: 58, max: 248 },
  { match: /exhaust pipe|flex pipe/i, min: 42, max: 188 },
  { match: /bolt|nut|fastener|clip|retainer/i, min: 3, max: 22 },
  { match: /lug nut|lug stud|wheel lock/i, min: 3, max: 38 },
  { match: /o-?ring|snap ring|cotter pin|washer|thread locker/i, min: 2, max: 18 },
  { match: /wiper/i, min: 9, max: 34 },
  { match: /headlight|low beam|high beam|fog light/i, min: 12, max: 68 },
  { match: /tail light|brake light|turn signal|marker light|running light|license plate|reverse light|bulb/i, min: 4, max: 24 },
  { match: /sensor|oxygen|o2/i, min: 28, max: 168 },
  { match: /mirror/i, min: 54, max: 238 },
  { match: /window regulator/i, min: 48, max: 186 },
  { match: /door handle|lock actuator/i, min: 26, max: 138 },
  { match: /control arm/i, min: 52, max: 182 },
  { match: /wheel bearing|hub/i, min: 58, max: 218 },
  { match: /engine mount|transmission mount/i, min: 42, max: 188 },
  { match: /blower motor|resistor/i, min: 34, max: 142 },
  { match: /ac compressor|a\/c compressor/i, min: 188, max: 612 },
  { match: /ac condenser|a\/c condenser/i, min: 96, max: 318 },
  { match: /power steering fluid/i, min: 7, max: 24 },
  { match: /drive belt tensioner|idler pulley/i, min: 28, max: 118 },
  { match: /ignition coil boot/i, min: 4, max: 18 },
  { match: /starter relay|main fuse|relay/i, min: 8, max: 42 },
  { match: /ground strap|battery terminal/i, min: 8, max: 38 },
  { match: /radiator cap/i, min: 8, max: 28 },
  { match: /sway bar|stabilizer/i, min: 16, max: 82 },
  { match: /center support bearing/i, min: 34, max: 148 },
  { match: /differential fluid/i, min: 12, max: 36 },
  { match: /valve stem/i, min: 3, max: 12 }
];

const servicePartCatalog: Array<{ match: RegExp; label: string; parts: Array<{ name: string; qty: number; status?: "selected" | "possible" }>; laborHours: number }> = [
  { match: /engine oil|oil.*filter|oil change/i, label: "Oil change job", laborHours: 0.5, parts: [
    { name: "5 quart vehicle spec full synthetic engine oil", qty: 1 }, { name: "oil filter", qty: 1 }, { name: "oil drain plug gasket crush washer", qty: 1, status: "possible" }, { name: "shop towel funnel oil absorbent", qty: 1, status: "possible" }
  ] },
  { match: /front.*brake|brake.*front|front.*pads|front.*rotor/i, label: "Front brake job", laborHours: 1.2, parts: [
    { name: "front brake pads", qty: 1 }, { name: "front brake rotors", qty: 2 }, { name: "front brake pad abutment clips hardware kit", qty: 1, status: "possible" }, { name: "front brake caliper slide pin kit", qty: 1, status: "possible" }, { name: "front brake calipers", qty: 2, status: "possible" }, { name: "brake fluid", qty: 1, status: "possible" }
  ] },
  { match: /rear.*brake|brake.*rear|rear.*pads|rear.*rotor/i, label: "Rear brake job", laborHours: 1.2, parts: [
    { name: "rear brake pads", qty: 1 }, { name: "rear brake rotors", qty: 2 }, { name: "rear brake pad abutment clips hardware kit", qty: 1, status: "possible" }, { name: "rear brake caliper slide pin kit", qty: 1, status: "possible" }, { name: "rear brake calipers", qty: 2, status: "possible" }, { name: "brake fluid", qty: 1, status: "possible" }
  ] },
  { match: /\bbrakes?\b|brake job|pads and rotors/i, label: "Brake job", laborHours: 2.4, parts: [
    { name: "front brake pads", qty: 1 }, { name: "rear brake pads", qty: 1 }, { name: "front brake rotors", qty: 2, status: "possible" }, { name: "rear brake rotors", qty: 2, status: "possible" }, { name: "brake hardware kit", qty: 2, status: "possible" }, { name: "brake fluid", qty: 1, status: "possible" }
  ] },
  { match: /brake inspection/i, label: "Brake inspection", laborHours: 0.5, parts: [{ name: "brake inspection supplies", qty: 1, status: "possible" }] },
  { match: /single tire repair|puncture|patch|plug/i, label: "Single tire repair", laborHours: 0.5, parts: [{ name: "tire patch plug repair kit", qty: 1 }, { name: "valve stem", qty: 1, status: "possible" }] },
  { match: /tire replacement|tires|\btire\b/i, label: "Tire replacement", laborHours: 1.0, parts: [{ name: "tire", qty: 4 }, { name: "valve stems", qty: 4 }, { name: "tpms sensor service kit", qty: 4, status: "possible" }] },
  { match: /tire rotation/i, label: "Tire rotation", laborHours: 0.4, parts: [{ name: "lug torque check", qty: 1 }, { name: "tire pressure set", qty: 1 }] },
  { match: /tpms/i, label: "TPMS service", laborHours: 0.6, parts: [{ name: "tpms sensor service kit", qty: 4 }, { name: "valve stems", qty: 4, status: "possible" }] },
  { match: /wipers?|windshield blade|rear blade/i, label: "Wiper blade job", laborHours: 0.2, parts: [{ name: "driver side windshield wiper blade", qty: 1 }, { name: "passenger side windshield wiper blade", qty: 1 }, { name: "rear wiper blade", qty: 1, status: "possible" }] },
  { match: /bulbs?|lamps?|lights?|headlight|high beam|low beam|fog|plate|directional|turn signal|running|marker|tail|reverse/i, label: "Light bulb job", laborHours: 0.4, parts: [{ name: "low beam headlight bulb", qty: 2 }, { name: "high beam headlight bulb", qty: 2, status: "possible" }, { name: "fog light bulb", qty: 2, status: "possible" }, { name: "brake tail light bulb", qty: 2, status: "possible" }] },
  { match: /battery/i, label: "Battery test and replacement", laborHours: 0.5, parts: [{ name: "battery", qty: 1 }, { name: "battery terminals", qty: 1, status: "possible" }, { name: "terminal protectant", qty: 1, status: "possible" }] },
  { match: /alternator/i, label: "Alternator replacement estimate", laborHours: 1.5, parts: [{ name: "alternator", qty: 1 }, { name: "serpentine belt", qty: 1, status: "possible" }, { name: "battery terminals", qty: 1, status: "possible" }] },
  { match: /starter/i, label: "Starter replacement estimate", laborHours: 1.4, parts: [{ name: "starter", qty: 1 }, { name: "starter relay", qty: 1, status: "possible" }, { name: "battery terminals", qty: 1, status: "possible" }] },
  { match: /engine air filter/i, label: "Engine air filter", laborHours: 0.2, parts: [{ name: "engine air filter", qty: 1 }] },
  { match: /cabin air filter/i, label: "Cabin air filter", laborHours: 0.3, parts: [{ name: "cabin air filter", qty: 1 }] },
  { match: /fuel filter/i, label: "Fuel filter", laborHours: 0.7, parts: [{ name: "fuel filter", qty: 1 }, { name: "fuel line quick connect clips", qty: 1, status: "possible" }] },
  { match: /check engine|diagnostic|code|abs light|airbag|srs|misfire|evap leak/i, label: "Detailed diagnostics", laborHours: 0, parts: [{ name: "free code light check", qty: 1 }, { name: "diagnostic trace flat rate", qty: 1 }] },
  { match: /coolant|flush|cooling|overheat|radiator/i, label: "Cooling service", laborHours: 1.8, parts: [{ name: "engine coolant antifreeze", qty: 2 }, { name: "thermostat", qty: 1, status: "possible" }, { name: "radiator cap", qty: 1, status: "possible" }, { name: "upper radiator hose", qty: 1, status: "possible" }, { name: "lower radiator hose", qty: 1, status: "possible" }, { name: "water pump", qty: 1, status: "possible" }] },
  { match: /transmission|atf|cvt/i, label: "Transmission service", laborHours: 2.0, parts: [{ name: "6 quart vehicle spec transmission fluid ATF CVT", qty: 1 }, { name: "transmission filter", qty: 1, status: "possible" }, { name: "transmission pan gasket", qty: 1, status: "possible" }, { name: "transmission drain plug gasket", qty: 1, status: "possible" }] },
  { match: /spark|ignition|tune.?up|engine maintenance/i, label: "Engine maintenance", laborHours: 1.5, parts: [{ name: "spark plug", qty: 4 }, { name: "ignition coil", qty: 4, status: "possible" }, { name: "ignition coil boot", qty: 4, status: "possible" }, { name: "pcv valve", qty: 1, status: "possible" }, { name: "serpentine belt", qty: 1, status: "possible" }] },
  { match: /maine inspection|pre-check|inspection/i, label: "Safety pre-check", laborHours: 0.7, parts: [{ name: "inspection checklist", qty: 1 }] },
  { match: /front.*suspension|front.*strut|front.*shock/i, label: "Front suspension estimate", laborHours: 2.0, parts: [{ name: "front strut assembly", qty: 2, status: "possible" }, { name: "front lower control arm", qty: 2, status: "possible" }, { name: "front lower ball joint", qty: 2, status: "possible" }, { name: "front sway bar links", qty: 2, status: "possible" }] },
  { match: /rear.*suspension|rear.*strut|rear.*shock/i, label: "Rear suspension estimate", laborHours: 2.0, parts: [{ name: "rear shock strut assembly", qty: 2, status: "possible" }, { name: "rear lower control arm", qty: 2, status: "possible" }, { name: "rear lower ball joint", qty: 2, status: "possible" }, { name: "rear sway bar links", qty: 2, status: "possible" }] },
  { match: /suspension|strut|shock|noise|control arm|ball joint|sway bar/i, label: "Suspension inspection", laborHours: 1.0, parts: [{ name: "front strut assembly", qty: 2, status: "possible" }, { name: "lower control arm", qty: 2, status: "possible" }, { name: "lower ball joint", qty: 2, status: "possible" }, { name: "sway bar links", qty: 2, status: "possible" }] },
  { match: /wheel bearing|hub/i, label: "Wheel bearing/hub estimate", laborHours: 1.4, parts: [{ name: "front driver wheel hub bearing assembly", qty: 1 }, { name: "front passenger wheel hub bearing assembly", qty: 1, status: "possible" }, { name: "rear wheel bearing hub assembly", qty: 1, status: "possible" }] },
  { match: /steering|tie rod|rack and pinion|power steering/i, label: "Steering estimate", laborHours: 1.4, parts: [{ name: "outer tie rod end", qty: 2, status: "possible" }, { name: "inner tie rod end", qty: 2, status: "possible" }, { name: "rack and pinion steering rack", qty: 1, status: "possible" }, { name: "power steering pump", qty: 1, status: "possible" }, { name: "power steering fluid", qty: 1, status: "possible" }] },
  { match: /drivetrain|cv axle|drive shaft|u-?joint|axle seal|differential/i, label: "Drivetrain estimate", laborHours: 1.6, parts: [{ name: "front cv axle", qty: 2, status: "possible" }, { name: "drive shaft", qty: 1, status: "possible" }, { name: "u-joint", qty: 2, status: "possible" }, { name: "axle seal", qty: 2, status: "possible" }, { name: "differential fluid", qty: 1, status: "possible" }] },
  { match: /fuel system|\bfuel\b|evap|gas cap/i, label: "Fuel/EVAP estimate", laborHours: 1.0, parts: [{ name: "fuel pump", qty: 1, status: "possible" }, { name: "fuel injector", qty: 4, status: "possible" }, { name: "fuel pressure regulator", qty: 1, status: "possible" }, { name: "gas cap", qty: 1, status: "possible" }, { name: "evap purge valve", qty: 1, status: "possible" }, { name: "evap vent valve", qty: 1, status: "possible" }] },
  { match: /exhaust|muffler|pipe|catalytic|o2|oxygen sensor/i, label: "Exhaust estimate", laborHours: 1.0, parts: [{ name: "oxygen sensor", qty: 1, status: "possible" }, { name: "catalytic converter", qty: 1, status: "possible" }, { name: "exhaust gasket", qty: 1, status: "possible" }, { name: "exhaust flex pipe", qty: 1, status: "possible" }, { name: "muffler resonator", qty: 1, status: "possible" }, { name: "exhaust flange bolts nuts", qty: 1, status: "possible" }] },
  { match: /hvac|blower|heater|ac |a\/c|air conditioning/i, label: "HVAC estimate", laborHours: 1.2, parts: [{ name: "blower motor", qty: 1, status: "possible" }, { name: "blower motor resistor", qty: 1, status: "possible" }, { name: "ac compressor", qty: 1, status: "possible" }, { name: "ac condenser", qty: 1, status: "possible" }] },
  { match: /electrical|relay|fuse|ground strap/i, label: "Electrical estimate", laborHours: 1.0, parts: [{ name: "battery", qty: 1, status: "possible" }, { name: "alternator", qty: 1, status: "possible" }, { name: "starter", qty: 1, status: "possible" }, { name: "starter relay", qty: 1, status: "possible" }, { name: "main fuse", qty: 1, status: "possible" }, { name: "ground strap", qty: 1, status: "possible" }] },
  { match: /hardware|fasteners?|nuts?|bolts?|clips?|retainers?|thread locker/i, label: "Hardware estimate", laborHours: 0.3, parts: [{ name: "brake caliper bracket bolts", qty: 1, status: "possible" }, { name: "brake caliper slide pin kit", qty: 1, status: "possible" }, { name: "wheel lug nuts", qty: 1, status: "possible" }, { name: "body clips retainers", qty: 1, status: "possible" }, { name: "thread locker", qty: 1, status: "possible" }] }
];

function currentPricingSettings(settings?: Partial<PricingSettings>): PricingSettings {
  return { ...readPricingSettings(), ...settings };
}

function addPrice(a: PriceRange, b: PriceRange): PriceRange {
  return { min: a.min + b.min, max: a.max + b.max };
}

function multiplyPrice(price: PriceRange, qty: number): PriceRange {
  return { min: Math.round(price.min * qty), max: Math.round(price.max * qty) };
}

function averagePrice(price: PriceRange) {
  return Math.round((price.min + price.max) / 2);
}

export function formatPriceRange(price: PriceRange) {
  return price.min === price.max ? `$${price.min}` : `$${price.min} - $${price.max}`;
}

export function estimatePartPrice(part: string, index = 0): PriceRange {
  if (/free code light check/i.test(part)) return { min: 0, max: 0 };
  if (/diagnostic trace flat rate/i.test(part)) return { min: 100, max: 100 };
  const oilQuartMatch = String(part).match(/\b(\d+(?:\.\d+)?)\s*quart\b/i);
  if (/full synthetic engine oil|motor oil|engine oil/i.test(part) && oilQuartMatch) {
    const quarts = Number(oilQuartMatch[1]) || 5;
    return { min: Math.round(quarts * 6), max: Math.round(quarts * 13) };
  }
  const bucket = priceCatalog.find((entry) => entry.match.test(part)) ?? { min: 18, max: 96 };
  const offsets = [{ min: 1.02, max: 1.06 }, { min: 0.96, max: 1.02 }, { min: 0.94, max: 0.99 }, { min: 1.08, max: 1.14 }];
  const offset = offsets[index % offsets.length];
  return { min: Math.round(bucket.min * offset.min), max: Math.round(bucket.max * offset.max) };
}

export function searchPhraseForPart(part: string) {
  const cleanPart = String(part || "").trim();
  if (/caliper.*bracket.*bolt|caliper.*bolt/i.test(cleanPart)) return "brake caliper bracket bolts";
  if (/caliper.*slide pin|brake.*slide pin|guide pin/i.test(cleanPart)) return "brake caliper slide pin kit";
  if (/caliper.*pin boot|caliper boot/i.test(cleanPart)) return "brake caliper pin boot kit";
  if (/driver side windshield wiper/i.test(cleanPart)) return "driver side windshield wiper blade";
  if (/passenger side windshield wiper/i.test(cleanPart)) return "passenger side windshield wiper blade";
  if (/rear wiper/i.test(cleanPart)) return "rear window wiper blade";
  if (/low beam/i.test(cleanPart)) return "low beam headlight bulb";
  if (/high beam/i.test(cleanPart)) return "high beam headlight bulb";
  if (/fog light/i.test(cleanPart)) return "fog light bulb";
  if (/license plate/i.test(cleanPart)) return "license plate light bulb";
  if (/front turn/i.test(cleanPart)) return "front turn signal bulb";
  if (/rear turn/i.test(cleanPart)) return "rear turn signal bulb";
  if (/brake tail/i.test(cleanPart)) return "brake tail light bulb";
  if (/reverse/i.test(cleanPart)) return "reverse light bulb";
  if (/p\s*rated/i.test(cleanPart)) return "P rated passenger tire";
  if (/lt\s*rated/i.test(cleanPart)) return "LT rated light truck tire";
  if (/wheel hub bearing/i.test(cleanPart)) return cleanPart.replace(/wheel hub bearing assembly/i, "wheel bearing hub assembly");
  if (/outer tie rod/i.test(cleanPart)) return "outer tie rod end";
  if (/inner tie rod/i.test(cleanPart)) return "inner tie rod end";
  if (/rack and pinion|steering rack/i.test(cleanPart)) return "rack and pinion steering rack";
  if (/power steering pressure hose/i.test(cleanPart)) return "power steering pressure hose";
  if (/power steering return hose/i.test(cleanPart)) return "power steering return hose";
  if (/shift solenoid/i.test(cleanPart)) return "transmission shift solenoid";
  if (/cooler line/i.test(cleanPart)) return "transmission cooler line";
  if (/ignition coil boot/i.test(cleanPart)) return "ignition coil boot";
  if (/engine coolant|antifreeze/i.test(cleanPart)) return "engine coolant antifreeze";
  if (/fuel injector/i.test(cleanPart)) return "fuel injector";
  if (/oxygen sensor/i.test(cleanPart)) return "oxygen sensor";
  if (/flange bolts nuts/i.test(cleanPart)) return "exhaust flange bolts nuts";
  if (/body clips|retainers|push pins|fender liner clips|bumper cover clips|door panel clips/i.test(cleanPart)) return cleanPart;
  if (/brake fluid/i.test(cleanPart)) return "DOT 3 DOT 4 brake fluid";
  if (/brake hardware|abutment|pad clip/i.test(cleanPart)) return "disc brake pad abutment clips hardware kit";
  if (/brake calipers?/i.test(cleanPart)) return cleanPart.replace(/brake calipers?/i, "disc brake caliper");
  if (/brake rotors?/i.test(cleanPart)) return cleanPart.replace(/brake rotors?/i, "disc brake rotor");
  if (/brake pads?/i.test(cleanPart)) return cleanPart.replace(/brake pads?/i, "disc brake pads");
  if (/tpms/i.test(cleanPart)) return "tpms sensor service kit TPMS system";
  if (/full synthetic engine oil/i.test(cleanPart)) return cleanPart.replace("vehicle spec", "").replace(/\s+/g, " ").trim();
  if (/oil drain plug gasket|crush washer/i.test(cleanPart)) return "oil drain plug gasket crush washer";
  if (/vehicle spec transmission fluid|ATF CVT/i.test(cleanPart)) return "vehicle specific automatic transmission fluid ATF CVT";
  if (/cv axle/i.test(cleanPart)) return "cv axle shaft";
  if (/u-?joint/i.test(cleanPart)) return "universal joint";
  if (/water pump/i.test(cleanPart)) return "engine water pump";
  if (/^tire$/i.test(cleanPart)) return "tires";
  return cleanPart;
}

function catalogForService(service: string) {
  if (isEstimateCategoryPart(service)) {
    const partName = String(service || "Manual parts lookup").trim();
    return {
      label: `${partName} part lookup`,
      laborHours: 0,
      parts: [{ name: partName, qty: quantityForCategoryPart(partName), status: "selected" as const }]
    };
  }

  return servicePartCatalog.find((entry) => entry.match.test(service)) ?? {
    label: service,
    laborHours: defaultBookTime(service),
    parts: [{ name: service || "Manual parts lookup", qty: 1, status: "selected" as const }]
  };
}

function defaultBookTime(text: string) {
  const lower = text.toLowerCase();
  if (/front and rear.*brake|brakes/.test(lower)) return 2.4;
  if (/front.*brake|rear.*brake|brake pad/.test(lower)) return 1.2;
  if (/oil/.test(lower)) return 0.5;
  if (/diagnostic|code|light/.test(lower)) return 0;
  if (/tire/.test(lower)) return 1.0;
  if (/wiper/.test(lower)) return 0.2;
  if (/bulb|light/.test(lower)) return 0.4;
  if (/strut|shock|suspension/.test(lower)) return 2.0;
  if (/transmission/.test(lower)) return 2.0;
  if (/cooling|radiator|water pump/.test(lower)) return 1.8;
  if (/spark|ignition|engine maintenance/.test(lower)) return 1.5;
  if (/wheel bearing|hub/.test(lower)) return 1.4;
  if (/steering|tie rod|rack/.test(lower)) return 1.4;
  if (/alternator|starter/.test(lower)) return 1.5;
  if (/hardware|fastener|clip|bolt/.test(lower)) return 0.3;
  return 1.0;
}

export function estimateServiceParts(service: string, pricingSettings?: Partial<PricingSettings>): ServiceEstimate {
  const recipe = catalogForService(service);
  const rates = currentPricingSettings(pricingSettings);
  const parts = recipe.parts.map((part, index) => {
    const unitPrice = isEstimateCategoryPart(part.name) ? estimateCategoryPartUnitPrice(part.name) : estimatePartPrice(part.name, index);
    return {
      name: part.name,
      qty: part.qty,
      status: part.status ?? "selected",
      unitPrice,
      totalPrice: multiplyPrice(unitPrice, part.qty),
      lookupQuery: searchPhraseForPart(part.name)
    } satisfies EstimatedJobPart;
  });
  const selectedParts = parts.filter((part) => part.status === "selected").reduce((total, part) => addPrice(total, part.totalPrice), { min: 0, max: 0 });
  const possibleParts = parts.filter((part) => part.status === "possible").reduce((total, part) => addPrice(total, part.totalPrice), { min: 0, max: 0 });
  const partsTotal = addPrice(selectedParts, possibleParts);
  const labor = { min: Math.round(recipe.laborHours * rates.shopLaborRate), max: Math.round(recipe.laborHours * rates.shopLaborRate) };
  const marketLabor = { min: Math.round(recipe.laborHours * rates.marketLaborRate), max: Math.round(recipe.laborHours * rates.marketLaborRate) };
  const total = { min: selectedParts.min + labor.min, max: selectedParts.max + possibleParts.max + labor.max };
  const marketTotal = { min: selectedParts.min + marketLabor.min, max: selectedParts.max + possibleParts.max + marketLabor.max };
  const savingsAmount = Math.max(0, averagePrice(marketTotal) - averagePrice(total));
  return {
    service,
    label: recipe.label,
    parts,
    selectedParts,
    possibleParts,
    partsTotal,
    laborHours: recipe.laborHours,
    labor,
    marketLabor,
    total,
    marketTotal,
    savings: { amount: savingsAmount, percent: rates.marketLaborRate > 0 ? Math.max(0, Math.round(((rates.marketLaborRate - rates.shopLaborRate) / rates.marketLaborRate) * 100)) : 0 }
  };
}

export function estimateServices(services: string[], pricingSettings?: Partial<PricingSettings>): ServiceEstimate & { jobs: ServiceEstimate[] } {
  const rates = currentPricingSettings(pricingSettings);
  const jobs = services.map((service) => estimateServiceParts(service, rates));
  const empty = { min: 0, max: 0 };
  const totalJob = jobs.reduce((total, job) => ({
    ...total,
    parts: [...total.parts, ...job.parts],
    selectedParts: addPrice(total.selectedParts, job.selectedParts),
    possibleParts: addPrice(total.possibleParts, job.possibleParts),
    partsTotal: addPrice(total.partsTotal, job.partsTotal),
    laborHours: total.laborHours + job.laborHours,
    labor: addPrice(total.labor, job.labor),
    marketLabor: addPrice(total.marketLabor, job.marketLabor),
    total: addPrice(total.total, job.total),
    marketTotal: addPrice(total.marketTotal, job.marketTotal)
  }), {
    service: services.join(", "), label: "Combined service estimate", parts: [] as EstimatedJobPart[], selectedParts: empty, possibleParts: empty,
    partsTotal: empty, laborHours: 0, labor: empty, marketLabor: empty, total: empty, marketTotal: empty, savings: { amount: 0, percent: 0 }
  });
  return { ...totalJob, jobs, savings: { amount: Math.max(0, averagePrice(totalJob.marketLabor) - averagePrice(totalJob.labor)), percent: rates.marketLaborRate > 0 ? Math.max(0, Math.round(((rates.marketLaborRate - rates.shopLaborRate) / rates.marketLaborRate) * 100)) : 0 } };
}

function vehicleSearchText(vehicleContext?: string) {
  return String(vehicleContext || "").replace(/\s+/g, " ").trim();
}

function areaSearchText(areaContext?: string) {
  return String(areaContext || currentPricingSettings().defaultSearchArea || "").replace(/\s+/g, " ").trim();
}

function buildSupplierSearchUrl(source: { base: string; type: "Local pickup" | "Online" | "Tire" }, partOrPhrase: string, vehicleContext?: string, areaContext?: string, refined = false) {
  const queryPart = refined ? partOrPhrase : searchPhraseForPart(partOrPhrase);
  const vehicle = vehicleSearchText(vehicleContext);
  const area = areaSearchText(areaContext);
  const query = [
    vehicle,
    queryPart,
    area && source.type !== "Online" ? `near ${area}` : ""
  ].filter(Boolean).join(" ");
  return `${source.base}${encodeURIComponent(query || queryPart)}`;
}

export function buildPartSupplierCandidates(part: string, tier: PartTier = "mid", vehicleContext = "", areaContext = ""): PartSupplierCandidate[] {
  const isTire = /tire|valve stem|balance|puncture|patch|plug/i.test(part);
  const cleanPart = part.replace(/^[^:]+:\s*/, "");
  const sources = isTire ? [...tireSearchBases, ...supplierSearchBases] : supplierSearchBases;
  const unitPrice = estimatePartPrice(part);
  const tierNote = tier === "low" ? "value" : tier === "mid" ? "recommended" : "premium/OEM";

  return sources.slice(0, isTire ? 9 : 7).map((source) => ({
    name: source.name,
    type: source.type,
    url: buildSupplierSearchUrl(source, cleanPart, vehicleContext, areaContext),
    priceNote: `${formatPriceRange(unitPrice)} estimated ${tierNote} range; open supplier to verify live fitment, image, stock, and price`,
    imageNote: "Use supplier/manufacturer image after live lookup; do not rely on placeholder art",
    fulfillment: source.fulfillment
  }));
}

function shippingAllowanceForSource(source: { type: "Local pickup" | "Online" | "Tire" }, index: number): PriceRange {
  if (source.type === "Local pickup" || source.type === "Tire") return { min: 0, max: 0 };
  const base = index % 2 === 0 ? 14 : 19;
  return { min: base, max: base + 18 };
}

function jobSearchPhrase(parts: Array<{ lookupQuery?: string; name: string }>, fallback: string) {
  const selected = parts.slice(0, 4).map((part) => part.lookupQuery || searchPhraseForPart(part.name)).join(" ").trim();
  return selected || fallback;
}

export function buildRetailerEstimateResults(service: string, options: { vehicleContext?: string; areaContext?: string; pricingSettings?: Partial<PricingSettings> } = {}): RetailerEstimateResult[] {
  const recipe = catalogForService(service);
  const rates = currentPricingSettings(options.pricingSettings);
  const tireJob = /tire|tpms|valve stem|staggered|p rated|lt rated/i.test(`${service} ${recipe.label}`);
  const sources = tireJob ? [...tireSearchBases, ...supplierSearchBases] : supplierSearchBases;

  return sources.map((source, retailerIndex) => {
    const parts = recipe.parts.map((part, partIndex) => {
      const unitPrice = estimatePartPrice(part.name, retailerIndex + partIndex);
      const retailerPrice = multiplyPrice(unitPrice, part.qty);
      return {
        name: part.name,
        qty: part.qty,
        status: part.status ?? "selected",
        unitPrice,
        totalPrice: retailerPrice,
        retailerPrice,
        lookupQuery: searchPhraseForPart(part.name),
        url: buildSupplierSearchUrl(source, part.name, options.vehicleContext, options.areaContext)
      } satisfies RetailerJobPartResult;
    });
    const selectedParts = parts.filter((part) => part.status === "selected").reduce((total, part) => addPrice(total, part.retailerPrice), { min: 0, max: 0 });
    const possibleParts = parts.filter((part) => part.status === "possible").reduce((total, part) => addPrice(total, part.retailerPrice), { min: 0, max: 0 });
    const fullPartsTotal = addPrice(selectedParts, possibleParts);
    const shipping = shippingAllowanceForSource(source, retailerIndex);
    const labor = { min: Math.round(recipe.laborHours * rates.shopLaborRate), max: Math.round(recipe.laborHours * rates.shopLaborRate) };
    const marketLabor = { min: Math.round(recipe.laborHours * rates.marketLaborRate), max: Math.round(recipe.laborHours * rates.marketLaborRate) };
    const selectedTotal = addPrice(addPrice(selectedParts, labor), shipping);
    const marketTotal = addPrice(addPrice(selectedParts, marketLabor), shipping);
    return {
      name: source.name,
      type: source.type,
      color: source.color,
      fulfillment: source.fulfillment,
      url: buildSupplierSearchUrl(source, jobSearchPhrase(parts, service), options.vehicleContext, options.areaContext, true),
      parts,
      selectedParts,
      possibleParts,
      shipping,
      labor,
      marketLabor,
      selectedTotal,
      fullPartsTotal,
      marketTotal,
      average: averagePrice(selectedTotal)
    };
  }).sort((a, b) => a.selectedTotal.min - b.selectedTotal.min || a.average - b.average || a.name.localeCompare(b.name));
}

export const partsIntegrationNotes = [
  { title: "Estimate engine", detail: "Parts now use the IAW price catalog, job-part recipes, book-time labor, and market-rate comparison from the NukeBox parts finder." },
  { title: "Supplier lookup", detail: "O'Reilly, Advance, NAPA, AutoZone, Pep Boys, Walmart, 1A Auto, RockAuto, and tire-specific links generate from the calculated part query." },
  { title: "Final quote rule", detail: "Displayed ranges are draft planning numbers. Admin still verifies live fitment, supplier image, price, stock, and customer approval before ordering." }
];
