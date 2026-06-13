import type { PrototypeWorkOrder } from "@/lib/local-store";

export type PartSupplierCandidate = {
  name: string;
  type: "Local pickup" | "Online" | "Tire";
  url: string;
  priceNote: string;
  imageNote: string;
  fulfillment: string;
};

const supplierSearchBases = [
  { name: "O'Reilly Auto Parts", type: "Local pickup" as const, base: "https://www.oreillyauto.com/search?q=", fulfillment: "Local pickup or delivery where available" },
  { name: "Advance Auto Parts", type: "Local pickup" as const, base: "https://shop.advanceautoparts.com/web/SearchResults?searchTerm=", fulfillment: "Local pickup or ship-to-home" },
  { name: "NAPA", type: "Local pickup" as const, base: "https://www.napaonline.com/en/search?text=", fulfillment: "Local store pickup or PROLink when connected" },
  { name: "AutoZone", type: "Local pickup" as const, base: "https://www.autozone.com/searchresult?searchText=", fulfillment: "Local pickup or AutoZonePro when connected" },
  { name: "RockAuto", type: "Online" as const, base: "https://www.rockauto.com/en/partsearch/?partnum=", fulfillment: "Online order, shipping time required" },
  { name: "PartsTech", type: "Online" as const, base: "https://www.partstech.com/search?query=", fulfillment: "Multi-supplier shop lookup when account is connected" }
];

const tireSearchBases = [
  { name: "Tire Rack", type: "Tire" as const, base: "https://www.tirerack.com/tires/tires.jsp?keyword=", fulfillment: "Online tire order, installer/pickup planning required" },
  { name: "Sullivan Tire", type: "Tire" as const, base: "https://www.sullivantire.com/search?query=", fulfillment: "Regional tire source, pickup/service confirmation required" },
  { name: "Tire Warehouse", type: "Tire" as const, base: "https://www.tirewarehouse.net/search?query=", fulfillment: "Regional tire source, pickup/service confirmation required" }
];

export function buildPartSupplierCandidates(part: string, tier: PrototypeWorkOrder["tier"]): PartSupplierCandidate[] {
  const isTire = /tire|valve stem|balance|puncture|patch|plug/i.test(part);
  const query = encodeURIComponent(part.replace(/^[^:]+:\s*/, ""));
  const sources = isTire ? [...tireSearchBases, ...supplierSearchBases] : supplierSearchBases;
  const tierNote = tier === "low" ? "value line" : tier === "mid" ? "recommended line" : "premium/OEM line";

  return sources.slice(0, isTire ? 6 : 5).map((source) => ({
    name: source.name,
    type: source.type,
    url: `${source.base}${query}`,
    priceNote: `Open and verify current ${tierNote} price before quoting`,
    imageNote: "Use supplier/manufacturer image after live lookup; do not rely on placeholder art",
    fulfillment: source.fulfillment
  }));
}

export const partsIntegrationNotes = [
  {
    title: "Best next integration",
    detail: "PartsTech or NAPA PROLink style workflow is the cleanest route for live inventory, wholesale pricing, and manufacturer images."
  },
  {
    title: "Local backup",
    detail: "O'Reilly, Advance, NAPA, and AutoZone links keep the admin one click from manual verification until commercial integrations are approved."
  },
  {
    title: "Tire workflow",
    detail: "Tire Rack, Sullivan Tire, and Tire Warehouse are included for tire-specific lookup and pickup planning."
  }
];
