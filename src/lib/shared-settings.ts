import { getSupabaseBrowserClient } from "@/lib/supabase-client";

// Owner settings live in business_settings.metadata.shared so a change reaches every
// customer and device. This browser keeps a copy so pages can read them instantly.
// That row is publicly readable: never store anything secret through here.

export type SharedSettingName = "pricing" | "marketing" | "payment" | "theme" | "branding" | "prayer" | "taxBooks" | "schedule";

export const SHARED_SETTINGS_PULLED_EVENT = "ibbys-auto.shared-settings.pulled";
export const SHARED_SETTINGS_ERROR_EVENT = "ibbys-auto.shared-settings.error";

const targets: Record<SharedSettingName, { key: string; event: string }> = {
  pricing: { key: "ibbys-auto.pricing-settings", event: "ibbys-auto.pricing-settings.changed" },
  marketing: { key: "ibbys-auto.marketing-settings", event: "ibbys-auto.marketing-settings.changed" },
  payment: { key: "ibbys-auto.payment-settings", event: "ibbys-auto.payment-settings.changed" },
  theme: { key: "ibbys-auto.theme", event: "ibbys-auto.theme.changed" },
  branding: { key: "ibbys-auto.branding", event: "ibbys-auto.branding.changed" },
  prayer: { key: "ibbys-auto.prayer-schedule-settings", event: "ibbys-auto.prayer-settings.changed" },
  taxBooks: { key: "ibbys-auto.tax-books", event: "ibbys-auto.tax-books.changed" },
  schedule: { key: "ibbys-auto.schedule-settings", event: "ibbys-auto.schedule-settings.changed" }
};

// Uploaded logos are stored inline; every visitor downloads this row, so keep it small.
const MAX_SHARED_BYTES = 300_000;

const pending = new Map<SharedSettingName, number>();

function reportFailure(name: SharedSettingName, message: string) {
  window.dispatchEvent(new CustomEvent(SHARED_SETTINGS_ERROR_EVENT, { detail: { name, message } }));
}

async function sendToCloud(name: SharedSettingName, value: unknown) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.rpc("save_shared_setting", { setting_name: name, setting_value: value });
  if (error) reportFailure(name, error.message);
}

// Called by the save functions; settings save on every keystroke, so wait for a pause.
export function shareSetting(name: SharedSettingName, value: unknown) {
  if (typeof window === "undefined") return;
  if (JSON.stringify(value).length > MAX_SHARED_BYTES) {
    reportFailure(name, "This is too large to share with other devices. Try a smaller logo image.");
    return;
  }
  const waiting = pending.get(name);
  if (waiting) window.clearTimeout(waiting);
  pending.set(name, window.setTimeout(() => {
    pending.delete(name);
    void sendToCloud(name, value);
  }, 700));
}

// The cloud copy wins. If the owner has a setting saved only on this browser (from
// before settings were shared), it becomes the cloud copy instead of being lost.
export async function pullSharedSettings() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || typeof window === "undefined") return;
  const { data, error } = await supabase.from("business_settings").select("metadata").limit(1).maybeSingle();
  if (error || !data) return;
  const shared = ((data.metadata as { shared?: Record<string, unknown> } | null)?.shared ?? {});
  const names = Object.keys(targets) as SharedSettingName[];
  let changed = false;

  for (const name of names) {
    const { key, event } = targets[name];
    if (shared[name] === undefined || pending.has(name)) continue;
    const incoming = JSON.stringify(shared[name]);
    if (window.localStorage.getItem(key) === incoming) continue;
    window.localStorage.setItem(key, incoming);
    window.dispatchEvent(new CustomEvent(event, { detail: shared[name] }));
    changed = true;
  }
  if (changed) window.dispatchEvent(new CustomEvent(SHARED_SETTINGS_PULLED_EVENT));

  const unshared = names.filter((name) => shared[name] === undefined && window.localStorage.getItem(targets[name].key));
  if (!unshared.length) return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;
  const { data: role } = await supabase.rpc("my_staff_role");
  if (role !== "admin") return;
  for (const name of unshared) {
    try {
      shareSetting(name, JSON.parse(window.localStorage.getItem(targets[name].key) ?? "null"));
    } catch { /* unreadable local copy: nothing to carry over */ }
  }
}
