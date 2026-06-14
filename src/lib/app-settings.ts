export type PaymentSettings = {
  paypalEnabled: boolean;
  patreonEnabled: boolean;
  cardEnabled: boolean;
  cashEnabled: boolean;
  paypalLabel: string;
  patreonLabel: string;
  paymentPlanLabel: string;
  roadsidePlanLabel: string;
  partsPlanLabel: string;
  tiresPlanLabel: string;
};

export const PAYMENT_SETTINGS_KEY = "ibbys-auto.payment-settings";
export const PAYMENT_SETTINGS_EVENT = "ibbys-auto.payment-settings.changed";

export function defaultPaymentSettings(): PaymentSettings {
  return {
    paypalEnabled: true,
    patreonEnabled: false,
    cardEnabled: true,
    cashEnabled: true,
    paypalLabel: "PayPal checkout",
    patreonLabel: "Patreon member plan",
    paymentPlanLabel: "Service payment plan",
    roadsidePlanLabel: "Roadside service plan",
    partsPlanLabel: "Parts payment plan",
    tiresPlanLabel: "Tire payment plan"
  };
}

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
