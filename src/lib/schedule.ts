import { shareSetting } from "@/lib/shared-settings";

// When and where the shop works. The owner sets this in Settings; the request page
// uses it to decide which days and times customers can pick.
export type ScheduleSettings = {
  workDays: string[];
  openTime: string;
  closeTime: string;
  blockedDates: string[];
  serviceArea: string;
  baseLocation: string;
  includedRadiusMiles: number;
  outsideRadiusFee: string;
};

export const SCHEDULE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const SCHEDULE_SETTINGS_KEY = "ibbys-auto.schedule-settings";
export const SCHEDULE_SETTINGS_EVENT = "ibbys-auto.schedule-settings.changed";

export const DEFAULT_SCHEDULE: ScheduleSettings = {
  workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  openTime: "8:00 AM",
  closeTime: "5:00 PM",
  blockedDates: [],
  serviceArea: "Auburn/Lewiston and surrounding Maine towns",
  baseLocation: "Auburn, ME",
  includedRadiusMiles: 25,
  outsideRadiusFee: "$2.50 per mile after included radius"
};

export function readScheduleSettings(): ScheduleSettings {
  if (typeof window === "undefined") return DEFAULT_SCHEDULE;
  try {
    return { ...DEFAULT_SCHEDULE, ...JSON.parse(window.localStorage.getItem(SCHEDULE_SETTINGS_KEY) || "{}") };
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

export function saveScheduleSettings(settings: ScheduleSettings) {
  window.localStorage.setItem(SCHEDULE_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SCHEDULE_SETTINGS_EVENT, { detail: settings }));
  shareSetting("schedule", settings);
}

export function clockToMinutes(clock: string) {
  const [time, period] = clock.split(" ");
  const [hour, minute] = time.split(":").map(Number);
  return ((hour % 12) + (period === "PM" ? 12 : 0)) * 60 + (minute || 0);
}

export function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dayIsOpen(settings: ScheduleSettings, iso: string, today = isoDate(new Date())) {
  if (iso < today || settings.blockedDates.includes(iso)) return false;
  const weekday = new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
  return settings.workDays.includes(weekday);
}

export function timeIsOpen(settings: ScheduleSettings, clock: string) {
  const minutes = clockToMinutes(clock);
  return minutes >= clockToMinutes(settings.openTime) && minutes < clockToMinutes(settings.closeTime);
}

export function nextOpenDate(settings: ScheduleSettings, from = new Date()) {
  for (let offset = 0; offset < 120; offset += 1) {
    const candidate = isoDate(new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset));
    if (dayIsOpen(settings, candidate)) return candidate;
  }
  return isoDate(from);
}

export function hoursLabel(settings: ScheduleSettings) {
  return `${settings.openTime} - ${settings.closeTime}`;
}
