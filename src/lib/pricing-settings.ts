export type PricingSettings = {
  shopLaborRate: number;
  marketLaborRate: number;
  defaultSearchArea: string;
};

export const PRICING_SETTINGS_KEY = "ibbys-auto.pricing-settings";

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  shopLaborRate: 95,
  marketLaborRate: 125,
  defaultSearchArea: "Auburn ME"
};

function cleanNumber(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallback;
}

function cleanSettings(value: Partial<PricingSettings> | null | undefined): PricingSettings {
  return {
    shopLaborRate: cleanNumber(value?.shopLaborRate, DEFAULT_PRICING_SETTINGS.shopLaborRate),
    marketLaborRate: cleanNumber(value?.marketLaborRate, DEFAULT_PRICING_SETTINGS.marketLaborRate),
    defaultSearchArea: String(value?.defaultSearchArea || DEFAULT_PRICING_SETTINGS.defaultSearchArea).trim() || DEFAULT_PRICING_SETTINGS.defaultSearchArea
  };
}

export function readPricingSettings(): PricingSettings {
  if (typeof window === "undefined") return DEFAULT_PRICING_SETTINGS;
  try {
    const raw = window.localStorage.getItem(PRICING_SETTINGS_KEY);
    return raw ? cleanSettings(JSON.parse(raw) as Partial<PricingSettings>) : DEFAULT_PRICING_SETTINGS;
  } catch {
    return DEFAULT_PRICING_SETTINGS;
  }
}

export function savePricingSettings(settings: PricingSettings) {
  if (typeof window === "undefined") return;
  const clean = cleanSettings(settings);
  window.localStorage.setItem(PRICING_SETTINGS_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent("ibbys-auto.pricing-settings.changed", { detail: clean }));
}
