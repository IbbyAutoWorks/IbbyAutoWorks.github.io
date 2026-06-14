export type PaymentSettings = {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  patreonEnabled: boolean;
  appleGooglePayEnabled: boolean;
  achEnabled: boolean;
  squareEnabled: boolean;
  cashEnabled: boolean;
  stripeLabel: string;
  paypalLabel: string;
  patreonLabel: string;
  appleGooglePayLabel: string;
  achLabel: string;
  squareLabel: string;
  cashLabel: string;
  paymentPlanLabel: string;
  roadsidePlanLabel: string;
  partsPlanLabel: string;
  tiresPlanLabel: string;
  jobBundleLabel: string;
};

export type PaymentPlan = {
  id: string;
  title: string;
  category: "service" | "parts" | "tires" | "roadside" | "bundle";
  summary: string;
  terms: string;
  deposit: string;
};

export const PAYMENT_SETTINGS_KEY = "ibbys-auto.payment-settings";
export const PAYMENT_SETTINGS_EVENT = "ibbys-auto.payment-settings.changed";

export function defaultPaymentSettings(): PaymentSettings {
  return {
    stripeEnabled: true,
    paypalEnabled: false,
    patreonEnabled: false,
    appleGooglePayEnabled: true,
    achEnabled: true,
    squareEnabled: false,
    cashEnabled: true,
    stripeLabel: "Stripe checkout",
    paypalLabel: "PayPal checkout",
    patreonLabel: "Patreon member plan",
    appleGooglePayLabel: "Apple Pay / Google Pay",
    achLabel: "ACH bank transfer",
    squareLabel: "Square invoice/card reader",
    cashLabel: "Cash at service",
    paymentPlanLabel: "Service payment plan",
    roadsidePlanLabel: "Roadside assistance plan",
    partsPlanLabel: "Parts payment plan",
    tiresPlanLabel: "Tire payment plan",
    jobBundleLabel: "Multi-job service package"
  };
}

export const defaultPaymentPlans: PaymentPlan[] = [
  {
    id: "service-split-pay",
    title: "Service split-pay",
    category: "service",
    summary: "Split approved labor and service cost into a deposit plus scheduled balance payments.",
    terms: "Suggested: 25% deposit, remaining balance split over 2-4 payments before final release.",
    deposit: "25% service deposit"
  },
  {
    id: "parts-ease",
    title: "Parts Ease Plan",
    category: "parts",
    summary: "Helps customers cover required parts before the job starts without hiding the true parts cost.",
    terms: "Suggested: parts deposit before ordering, remaining parts balance due before install or delivery.",
    deposit: "Parts ordering deposit"
  },
  {
    id: "tire-flex",
    title: "Tire Flex Plan",
    category: "tires",
    summary: "For tire purchases when the customer needs the tires but cannot cover the full set immediately.",
    terms: "Suggested: per-tire or axle-pair schedule, final balance due before mounting/balancing completion.",
    deposit: "Tire hold/order deposit"
  },
  {
    id: "roadside-assist",
    title: "Roadside Assist Plan",
    category: "roadside",
    summary: "Optional roadside help package for local emergency service, jump starts, spare swaps, and mobile triage.",
    terms: "Suggested: monthly or annual membership later; for now, quote manually and collect through Stripe invoice.",
    deposit: "Plan activation payment"
  },
  {
    id: "multi-job-bundle",
    title: "Multi-job bundle",
    category: "bundle",
    summary: "Package multiple approved maintenance or repair jobs together with staged payments.",
    terms: "Suggested: quote the full bundle, collect deposit, then unlock each job stage as payments clear.",
    deposit: "Bundle deposit"
  }
];

export function readPaymentSettings(): PaymentSettings {
  if (typeof window === "undefined") return defaultPaymentSettings();
  try {
    return { ...defaultPaymentSettings(), ...JSON.parse(window.localStorage.getItem(PAYMENT_SETTINGS_KEY) || "{}") };
  } catch {
    return defaultPaymentSettings();
  }
}

export function savePaymentSettings(settings: PaymentSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(PAYMENT_SETTINGS_EVENT, { detail: settings }));
}

export function enabledPaymentLabels(settings: PaymentSettings) {
  return [
    settings.stripeEnabled ? settings.stripeLabel : null,
    settings.appleGooglePayEnabled ? settings.appleGooglePayLabel : null,
    settings.achEnabled ? settings.achLabel : null,
    settings.paypalEnabled ? settings.paypalLabel : null,
    settings.squareEnabled ? settings.squareLabel : null,
    settings.cashEnabled ? settings.cashLabel : null,
    settings.patreonEnabled ? settings.patreonLabel : null
  ].filter(Boolean) as string[];
}
