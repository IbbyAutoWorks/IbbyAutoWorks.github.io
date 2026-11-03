import { shareSetting } from "@/lib/shared-settings";

// Published tax figures the books rely on. Each one comes from the source named beside
// it; add a row each year when the agency publishes the new value.

// IRS standard mileage rates, cents per business mile. 2026 changed mid-year
// (Announcement 2026-11): 72.5 through June 30, 76 from July 1.
const mileageRates = [
  { from: "2023-01-01", cents: 65.5 },
  { from: "2024-01-01", cents: 67 },
  { from: "2025-01-01", cents: 70 },
  { from: "2026-01-01", cents: 72.5 },
  { from: "2026-07-01", cents: 76 }
];
const LAST_PUBLISHED_YEAR = 2026;

export function mileageRatePublished(year: number) {
  return year <= LAST_PUBLISHED_YEAR;
}

export function irsMileageCents(date: string) {
  const day = date.slice(0, 10);
  return [...mileageRates].reverse().find((rate) => rate.from <= day)?.cents ?? mileageRates[0].cents;
}

export function mileageRateNote(year: number) {
  if (year === 2026) return "IRS rate for 2026: 72.5¢ per mile through June 30, 76¢ from July 1. Each trip uses the rate for its date.";
  if (!mileageRatePublished(year)) return `The IRS rate for ${year} isn't in the app yet. Enter it from irs.gov.`;
  return `IRS rate for ${year}: ${irsMileageCents(`${year}-06-01`)}¢ per mile.`;
}

// Social Security wage base by year (SSA / IRS).
const wageBaseDollars: Record<number, number> = { 2023: 160200, 2024: 168600, 2025: 176100, 2026: 184500 };

// Schedule SE arithmetic: 92.35% of net profit, 12.4% up to the wage base, 2.9% on all of it.
// Wages from another job also use up the wage base; this can't see those.
export function selfEmploymentTaxCents(netCents: number, year: number) {
  if (netCents < 40000) return 0;
  const earnings = netCents * 0.9235;
  const base = (wageBaseDollars[year] ?? wageBaseDollars[LAST_PUBLISHED_YEAR]) * 100;
  return Math.round(Math.min(earnings, base) * 0.124 + earnings * 0.029);
}

function nextBusinessDay(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

// The IRS payment periods are not calendar quarters (Form 1040-ES). Maine's Form
// 1040ES-ME uses the same due dates.
export function estimatedTaxPeriods(year: number) {
  return [
    { label: "Jan 1 - Mar 31", start: `${year}-01-01`, end: `${year}-03-31`, due: nextBusinessDay(`${year}-04-15`) },
    { label: "Apr 1 - May 31", start: `${year}-04-01`, end: `${year}-05-31`, due: nextBusinessDay(`${year}-06-15`) },
    { label: "Jun 1 - Aug 31", start: `${year}-06-01`, end: `${year}-08-31`, due: nextBusinessDay(`${year}-09-15`) },
    { label: "Sep 1 - Dec 31", start: `${year}-09-01`, end: `${year}-12-31`, due: nextBusinessDay(`${year + 1}-01-15`) }
  ];
}

export type ScheduleCLine = { line: string; label: string };

export const scheduleCLines: Record<string, ScheduleCLine> = {
  cogs: { line: "4", label: "Cost of goods sold: parts for customers (Part III, line 36)" },
  advertising: { line: "8", label: "Advertising" },
  car: { line: "9", label: "Car and truck expenses" },
  insurance: { line: "15", label: "Insurance" },
  office: { line: "18", label: "Office expense" },
  supplies: { line: "22", label: "Supplies, including small tools" },
  taxes: { line: "23", label: "Taxes and licenses" },
  utilities: { line: "25", label: "Utilities (business phone)" },
  other: { line: "27b", label: "Other expenses (software, training, other)" }
};

const categoryLines: Record<string, keyof typeof scheduleCLines> = {
  parts: "cogs",
  advertising: "advertising",
  fuel: "car",
  vehicle: "car",
  mileage: "car",
  "tolls-parking": "car",
  insurance: "insurance",
  office: "office",
  supplies: "supplies",
  tools: "supplies",
  "licenses-fees": "taxes",
  phone: "utilities"
};

export function scheduleCLineFor(category: string) {
  return categoryLines[category.trim().toLowerCase()] ?? "other";
}

// Maine: parts and shop supplies are taxed; labor is not when the bill lists it
// separately (MRS Instructional Bulletin 1). A bundled price is taxed in full.
export type WorkOrderBill = { partsCents: number; laborCents: number; taxCents: number };

export type TaxRules = { rate: number; partsTaxable: boolean; laborTaxable: boolean };

export const MAINE_TAX_RULES: TaxRules = { rate: 0.055, partsTaxable: true, laborTaxable: false };

export function taxRulesFrom(settings: { sales_tax_rate?: number; local_tax_rate?: number; parts_taxable?: boolean; labor_taxable?: boolean } | null | undefined): TaxRules {
  if (!settings) return MAINE_TAX_RULES;
  return {
    rate: Number(settings.sales_tax_rate ?? MAINE_TAX_RULES.rate) + Number(settings.local_tax_rate ?? 0),
    partsTaxable: settings.parts_taxable !== false,
    laborTaxable: settings.labor_taxable === true
  };
}

export function taxableCents(bill: Pick<WorkOrderBill, "partsCents" | "laborCents">, rules: TaxRules) {
  return (rules.partsTaxable ? bill.partsCents : 0) + (rules.laborTaxable ? bill.laborCents : 0);
}

export function billFromParts(partsCents: number, laborCents: number, rules: TaxRules): WorkOrderBill {
  return { partsCents, laborCents, taxCents: Math.round(taxableCents({ partsCents, laborCents }, rules) * rules.rate) };
}

// Works a bill backward from a total that already includes the tax.
export function billFromTotal(totalCents: number, partsCents: number, rules: TaxRules): WorkOrderBill {
  const taxOnParts = rules.partsTaxable ? partsCents : 0;
  const labor = rules.laborTaxable
    ? Math.round(totalCents / (1 + rules.rate)) - partsCents
    : totalCents - partsCents - Math.round(taxOnParts * rules.rate);
  return billFromParts(partsCents, Math.max(0, labor), rules);
}

export type TaxBooksSettings = {
  // Years the owner deducts actual vehicle costs instead of the standard mileage rate.
  actualVehicleYears: number[];
  // Cents per mile for years the app has no published IRS rate.
  mileageCentsByYear: Record<string, number>;
};

const TAX_BOOKS_KEY = "ibbys-auto.tax-books";
export const TAX_BOOKS_EVENT = "ibbys-auto.tax-books.changed";

export function readTaxBooksSettings(): TaxBooksSettings {
  const fallback: TaxBooksSettings = { actualVehicleYears: [], mileageCentsByYear: {} };
  if (typeof window === "undefined") return fallback;
  try {
    return { ...fallback, ...JSON.parse(window.localStorage.getItem(TAX_BOOKS_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

export function saveTaxBooksSettings(settings: TaxBooksSettings) {
  window.localStorage.setItem(TAX_BOOKS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(TAX_BOOKS_EVENT, { detail: settings }));
  shareSetting("taxBooks", settings);
}
