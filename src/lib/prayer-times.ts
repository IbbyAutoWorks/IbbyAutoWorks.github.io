export type PrayerBlock = {
  name: string;
  enabled: boolean;
  time: string;
  durationMinutes: number;
  reminderMinutes: number;
  oneTimePushMinutes: number;
};

export type PrayerScheduleSettings = {
  enabled: boolean;
  city: string;
  state: string;
  country: string;
  calculationMethod: string;
  fetchedAt: string;
  blocks: PrayerBlock[];
};

export const PRAYER_SETTINGS_KEY = "ibbys-auto.prayer-schedule-settings";

export const defaultPrayerBlocks: PrayerBlock[] = [
  { name: "Fajr", enabled: true, time: "04:10", durationMinutes: 25, reminderMinutes: 10, oneTimePushMinutes: 0 },
  { name: "Dhuhr", enabled: true, time: "12:45", durationMinutes: 25, reminderMinutes: 10, oneTimePushMinutes: 0 },
  { name: "Asr", enabled: true, time: "16:45", durationMinutes: 25, reminderMinutes: 10, oneTimePushMinutes: 0 },
  { name: "Maghrib", enabled: true, time: "20:25", durationMinutes: 20, reminderMinutes: 10, oneTimePushMinutes: 0 },
  { name: "Isha", enabled: true, time: "21:45", durationMinutes: 25, reminderMinutes: 10, oneTimePushMinutes: 0 }
];

export function defaultPrayerScheduleSettings(): PrayerScheduleSettings {
  return {
    enabled: false,
    city: "Auburn",
    state: "ME",
    country: "US",
    calculationMethod: "2",
    fetchedAt: "",
    blocks: defaultPrayerBlocks
  };
}

function cleanBlock(block: Partial<PrayerBlock>, fallback: PrayerBlock): PrayerBlock {
  return {
    name: String(block.name || fallback.name),
    enabled: typeof block.enabled === "boolean" ? block.enabled : fallback.enabled,
    time: /^\d{2}:\d{2}$/.test(String(block.time || "")) ? String(block.time) : fallback.time,
    durationMinutes: Math.max(5, Math.min(120, Number(block.durationMinutes ?? fallback.durationMinutes) || fallback.durationMinutes)),
    reminderMinutes: Math.max(0, Math.min(120, Number(block.reminderMinutes ?? fallback.reminderMinutes) || fallback.reminderMinutes)),
    oneTimePushMinutes: Math.max(0, Math.min(180, Number(block.oneTimePushMinutes ?? 0) || 0))
  };
}

export function cleanPrayerScheduleSettings(value: Partial<PrayerScheduleSettings> | null | undefined): PrayerScheduleSettings {
  const fallback = defaultPrayerScheduleSettings();
  const blocks = fallback.blocks.map((fallbackBlock) => {
    const savedBlock = value?.blocks?.find((block) => block.name === fallbackBlock.name) ?? {};
    return cleanBlock(savedBlock, fallbackBlock);
  });
  return {
    enabled: typeof value?.enabled === "boolean" ? value.enabled : fallback.enabled,
    city: String(value?.city || fallback.city),
    state: String(value?.state || fallback.state),
    country: String(value?.country || fallback.country),
    calculationMethod: String(value?.calculationMethod || fallback.calculationMethod),
    fetchedAt: String(value?.fetchedAt || ""),
    blocks
  };
}

export function readPrayerScheduleSettings(): PrayerScheduleSettings {
  if (typeof window === "undefined") return defaultPrayerScheduleSettings();
  try {
    const raw = window.localStorage.getItem(PRAYER_SETTINGS_KEY);
    return raw ? cleanPrayerScheduleSettings(JSON.parse(raw) as Partial<PrayerScheduleSettings>) : defaultPrayerScheduleSettings();
  } catch {
    return defaultPrayerScheduleSettings();
  }
}

export function savePrayerScheduleSettings(settings: PrayerScheduleSettings) {
  if (typeof window === "undefined") return;
  const clean = cleanPrayerScheduleSettings(settings);
  window.localStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent("ibbys-auto.prayer-settings.changed", { detail: clean }));
}

function minutesToTime(totalMinutes: number) {
  const minutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function timeToMinutes(time: string) {
  const [hour, minute] = String(time || "00:00").split(":").map(Number);
  return (Number(hour) || 0) * 60 + (Number(minute) || 0);
}

export function effectivePrayerTime(block: PrayerBlock) {
  return minutesToTime(timeToMinutes(block.time) + block.oneTimePushMinutes);
}

export function prayerBlockLabel(block: PrayerBlock) {
  const start = effectivePrayerTime(block);
  const end = minutesToTime(timeToMinutes(start) + block.durationMinutes);
  return `${block.name}: ${start} - ${end}`;
}

export async function fetchPrayerTimesFromAladhan(settings: PrayerScheduleSettings): Promise<PrayerScheduleSettings> {
  const params = new URLSearchParams({
    city: settings.city,
    state: settings.state,
    country: settings.country,
    method: settings.calculationMethod
  });
  const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?${params.toString()}`);
  if (!response.ok) throw new Error(`Prayer time lookup failed (${response.status}).`);
  const payload = await response.json();
  const timings = payload?.data?.timings ?? {};
  const next = cleanPrayerScheduleSettings({
    ...settings,
    fetchedAt: new Date().toISOString(),
    blocks: settings.blocks.map((block) => ({
      ...block,
      time: String(timings[block.name] || block.time).slice(0, 5),
      oneTimePushMinutes: 0
    }))
  });
  savePrayerScheduleSettings(next);
  return next;
}
