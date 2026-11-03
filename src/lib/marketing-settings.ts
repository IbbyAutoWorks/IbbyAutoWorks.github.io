import { shareSetting } from "@/lib/shared-settings";

export type MarketingSettings = {
  couponsEnabled: boolean;
  couponOnRequestPage: boolean;
  couponOnAccountPage: boolean;
  couponInEmail: boolean;
  couponInText: boolean;
  couponWithConfirmation: boolean;
  couponWithReminder: boolean;
  couponWithNextService: boolean;
  couponStartDate: string;
  couponEndDate: string;
  couponPopupEnabled: boolean;
  couponPopupDelaySeconds: number;
  couponPopupDurationSeconds: number;
  couponPopupCode: string;
  couponPopupTitle: string;
  couponPopupMessage: string;
  reviewCarouselEnabled: boolean;
  reviewCardsVisible: number;
  homepageWidgetEnabled: boolean;
  homepageWidgetTitle: string;
  homepageWidgetMessage: string;
  homepageWidgetCta: string;
  googlePhotosEnabled: boolean;
  googleDriveArchiveEnabled: boolean;
  googleCalendarBookingEnabled: boolean;
};

type CouponFlag = "couponsEnabled" | "couponOnRequestPage" | "couponOnAccountPage" | "couponInEmail" | "couponInText" | "couponWithConfirmation" | "couponWithReminder" | "couponWithNextService";

export const MARKETING_SETTINGS_KEY = "ibbys-auto.marketing-settings";
export const MARKETING_SETTINGS_EVENT = "ibbys-auto.marketing-settings.changed";

export function defaultMarketingSettings(): MarketingSettings {
  return {
    couponsEnabled: true,
    couponOnRequestPage: true,
    couponOnAccountPage: true,
    couponInEmail: false,
    couponInText: false,
    couponWithConfirmation: false,
    couponWithReminder: true,
    couponWithNextService: true,
    couponStartDate: "",
    couponEndDate: "",
    couponPopupEnabled: true,
    couponPopupDelaySeconds: 5,
    couponPopupDurationSeconds: 18,
    couponPopupCode: "PRECHECK",
    couponPopupTitle: "Need a quick look first?",
    couponPopupMessage: "Ask about the active pre-check offer before checkout. Ibby can confirm eligibility when the estimate is reviewed.",
    reviewCarouselEnabled: true,
    reviewCardsVisible: 3,
    homepageWidgetEnabled: true,
    homepageWidgetTitle: "Mobile shop, real records",
    homepageWidgetMessage: "Requests, photos, vehicle history, parts decisions, and appointment blocks stay tied to the work order.",
    homepageWidgetCta: "Start a work request",
    googlePhotosEnabled: false,
    googleDriveArchiveEnabled: false,
    googleCalendarBookingEnabled: false
  };
}

export function cleanMarketingSettings(value: Partial<MarketingSettings> | null | undefined): MarketingSettings {
  const fallback = defaultMarketingSettings();
  const flag = (key: CouponFlag) => (typeof value?.[key] === "boolean" ? value[key] as boolean : fallback[key]);
  return {
    couponsEnabled: flag("couponsEnabled"),
    couponOnRequestPage: flag("couponOnRequestPage"),
    couponOnAccountPage: flag("couponOnAccountPage"),
    couponInEmail: flag("couponInEmail"),
    couponInText: flag("couponInText"),
    couponWithConfirmation: flag("couponWithConfirmation"),
    couponWithReminder: flag("couponWithReminder"),
    couponWithNextService: flag("couponWithNextService"),
    couponStartDate: String(value?.couponStartDate ?? ""),
    couponEndDate: String(value?.couponEndDate ?? ""),
    couponPopupEnabled: typeof value?.couponPopupEnabled === "boolean" ? value.couponPopupEnabled : fallback.couponPopupEnabled,
    couponPopupDelaySeconds: Math.max(0, Math.min(120, Number(value?.couponPopupDelaySeconds ?? fallback.couponPopupDelaySeconds) || 0)),
    couponPopupDurationSeconds: Math.max(5, Math.min(120, Number(value?.couponPopupDurationSeconds ?? fallback.couponPopupDurationSeconds) || fallback.couponPopupDurationSeconds)),
    couponPopupCode: String(value?.couponPopupCode || fallback.couponPopupCode),
    couponPopupTitle: String(value?.couponPopupTitle || fallback.couponPopupTitle),
    couponPopupMessage: String(value?.couponPopupMessage || fallback.couponPopupMessage),
    reviewCarouselEnabled: typeof value?.reviewCarouselEnabled === "boolean" ? value.reviewCarouselEnabled : fallback.reviewCarouselEnabled,
    reviewCardsVisible: Math.max(1, Math.min(6, Number(value?.reviewCardsVisible ?? fallback.reviewCardsVisible) || fallback.reviewCardsVisible)),
    homepageWidgetEnabled: typeof value?.homepageWidgetEnabled === "boolean" ? value.homepageWidgetEnabled : fallback.homepageWidgetEnabled,
    homepageWidgetTitle: String(value?.homepageWidgetTitle || fallback.homepageWidgetTitle),
    homepageWidgetMessage: String(value?.homepageWidgetMessage || fallback.homepageWidgetMessage),
    homepageWidgetCta: String(value?.homepageWidgetCta || fallback.homepageWidgetCta),
    googlePhotosEnabled: typeof value?.googlePhotosEnabled === "boolean" ? value.googlePhotosEnabled : fallback.googlePhotosEnabled,
    googleDriveArchiveEnabled: typeof value?.googleDriveArchiveEnabled === "boolean" ? value.googleDriveArchiveEnabled : fallback.googleDriveArchiveEnabled,
    googleCalendarBookingEnabled: typeof value?.googleCalendarBookingEnabled === "boolean" ? value.googleCalendarBookingEnabled : fallback.googleCalendarBookingEnabled
  };
}

export function readMarketingSettings(): MarketingSettings {
  if (typeof window === "undefined") return defaultMarketingSettings();
  try {
    const raw = window.localStorage.getItem(MARKETING_SETTINGS_KEY);
    return raw ? cleanMarketingSettings(JSON.parse(raw) as Partial<MarketingSettings>) : defaultMarketingSettings();
  } catch {
    return defaultMarketingSettings();
  }
}

export function saveMarketingSettings(settings: MarketingSettings) {
  if (typeof window === "undefined") return;
  const clean = cleanMarketingSettings(settings);
  window.localStorage.setItem(MARKETING_SETTINGS_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent(MARKETING_SETTINGS_EVENT, { detail: clean }));
  shareSetting("marketing", clean);
}

export type CouponPlace = "popup" | "request" | "account" | "email" | "text";

// The one check every coupon display goes through: master switch, date window, then place.
export function couponShowsIn(settings: MarketingSettings, place: CouponPlace, now = new Date()) {
  if (!settings.couponsEnabled) return false;
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (settings.couponStartDate && day < settings.couponStartDate) return false;
  if (settings.couponEndDate && day > settings.couponEndDate) return false;
  return {
    popup: settings.couponPopupEnabled,
    request: settings.couponOnRequestPage,
    account: settings.couponOnAccountPage,
    email: settings.couponInEmail,
    text: settings.couponInText
  }[place];
}
