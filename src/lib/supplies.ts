import { type PartSupplierCandidate } from "@/lib/parts";

export type SupplyVendor = {
  name: string;
  url: string;
  fulfillment: string;
};

export type SupplyCatalogItem = {
  id: string;
  name: string;
  category: string;
  defaultQty: number;
  unit: string;
  estimatedUnitCost: number;
  notes: string;
  vendors: SupplyVendor[];
};

const searchBase = {
  advanced: "https://shop.advanceautoparts.com/web/SearchResults?searchTerm=",
  autozone: "https://www.autozone.com/searchresult?searchText=",
  napa: "https://www.napaonline.com/en/search?text=",
  oreilly: "https://www.oreillyauto.com/search?q=",
  walmart: "https://www.walmart.com/search?q=",
  harborFreight: "https://www.harborfreight.com/search?q=",
  homeDepot: "https://www.homedepot.com/s/",
  lowes: "https://www.lowes.com/search?searchTerm="
};

export const supplyCategories = [
  "Consumables",
  "Fluids and chemicals",
  "Shop rags and cleanup",
  "Hand tools",
  "Power tools",
  "Safety and PPE",
  "Storage and organization",
  "Roadside/mobile gear"
];

function vendorsFor(query: string, names: Array<keyof typeof searchBase> = ["advanced", "autozone", "napa", "oreilly", "walmart", "harborFreight", "homeDepot", "lowes"]): SupplyVendor[] {
  const labels: Record<keyof typeof searchBase, string> = {
    advanced: "Advance Auto Parts",
    autozone: "AutoZone",
    napa: "NAPA",
    oreilly: "O'Reilly Auto Parts",
    walmart: "Walmart",
    harborFreight: "Harbor Freight",
    homeDepot: "Home Depot",
    lowes: "Lowe's"
  };
  const encoded = encodeURIComponent(query);
  return names.map((key) => ({
    name: labels[key],
    url: `${searchBase[key]}${encoded}`,
    fulfillment: key === "harborFreight" || key === "homeDepot" || key === "lowes" ? "Tools/shop supply pickup or delivery" : "Auto supply pickup or delivery"
  }));
}

export const supplyCatalog: SupplyCatalogItem[] = [
  { id: "brake-clean", name: "Brake cleaner", category: "Fluids and chemicals", defaultQty: 2, unit: "cans", estimatedUnitCost: 5.49, notes: "Common brake/suspension cleanup consumable.", vendors: vendorsFor("brake cleaner", ["advanced", "autozone", "napa", "oreilly", "walmart"]) },
  { id: "penetrating-oil", name: "Penetrating oil", category: "Fluids and chemicals", defaultQty: 1, unit: "can", estimatedUnitCost: 7.99, notes: "Rusty fasteners, exhaust, suspension, undercar work.", vendors: vendorsFor("penetrating oil", ["advanced", "autozone", "napa", "oreilly", "walmart", "harborFreight"]) },
  { id: "shop-rags", name: "Shop rags / towel roll", category: "Shop rags and cleanup", defaultQty: 1, unit: "pack", estimatedUnitCost: 14.99, notes: "General cleanup, oil checks, customer-site neatness.", vendors: vendorsFor("shop rags", ["walmart", "harborFreight", "homeDepot", "lowes", "advanced"]) },
  { id: "nitrile-gloves", name: "Nitrile gloves", category: "Safety and PPE", defaultQty: 1, unit: "box", estimatedUnitCost: 12.99, notes: "PPE and clean customer handoff.", vendors: vendorsFor("nitrile gloves", ["harborFreight", "walmart", "homeDepot", "lowes", "advanced"]) },
  { id: "zip-ties", name: "Zip ties assortment", category: "Consumables", defaultQty: 1, unit: "pack", estimatedUnitCost: 6.99, notes: "Harness routing, temporary securement, field repairs.", vendors: vendorsFor("zip ties assortment", ["harborFreight", "walmart", "homeDepot", "lowes", "autozone"]) },
  { id: "hose-clamps", name: "Hose clamp assortment", category: "Consumables", defaultQty: 1, unit: "kit", estimatedUnitCost: 9.99, notes: "Cooling, intake, washer, and field clamp needs.", vendors: vendorsFor("hose clamp assortment", ["advanced", "autozone", "napa", "oreilly", "harborFreight"]) },
  { id: "drain-pan", name: "Drain pan", category: "Roadside/mobile gear", defaultQty: 1, unit: "pan", estimatedUnitCost: 12.99, notes: "Oil/coolant/brake-fluid containment on mobile jobs.", vendors: vendorsFor("automotive drain pan", ["advanced", "autozone", "napa", "oreilly", "walmart", "harborFreight"]) },
  { id: "impact-socket-set", name: "Impact socket set", category: "Hand tools", defaultQty: 1, unit: "set", estimatedUnitCost: 39.99, notes: "Job-specific socket gaps or field replacement.", vendors: vendorsFor("impact socket set", ["harborFreight", "homeDepot", "lowes", "walmart", "autozone"]) },
  { id: "breaker-bar", name: "Breaker bar", category: "Hand tools", defaultQty: 1, unit: "tool", estimatedUnitCost: 24.99, notes: "Stuck lug nuts, suspension, brakes, undercar fasteners.", vendors: vendorsFor("breaker bar", ["harborFreight", "homeDepot", "lowes", "autozone", "advanced"]) },
  { id: "cordless-light", name: "Cordless work light", category: "Power tools", defaultQty: 1, unit: "light", estimatedUnitCost: 29.99, notes: "On-site visibility and inspection photos.", vendors: vendorsFor("cordless work light", ["harborFreight", "homeDepot", "lowes", "walmart"]) },
  { id: "organizer-bin", name: "Small parts organizer", category: "Storage and organization", defaultQty: 1, unit: "box", estimatedUnitCost: 9.99, notes: "Keep customer/job hardware separated and labeled.", vendors: vendorsFor("small parts organizer", ["harborFreight", "homeDepot", "lowes", "walmart"]) },
  { id: "safety-glasses", name: "Safety glasses", category: "Safety and PPE", defaultQty: 1, unit: "pair", estimatedUnitCost: 4.99, notes: "PPE for grinding, brake clean, rust, undercar work.", vendors: vendorsFor("safety glasses", ["harborFreight", "homeDepot", "lowes", "walmart", "autozone"]) }
];

export function supplyVendorCandidates(item: SupplyCatalogItem): PartSupplierCandidate[] {
  return item.vendors.map((vendor) => ({
    name: vendor.name,
    type: "Local pickup",
    url: vendor.url,
    priceNote: `$${item.estimatedUnitCost.toFixed(2)} estimated unit cost`,
    fulfillment: vendor.fulfillment,
    imageNote: `${item.name} search at ${vendor.name}`
  }));
}
