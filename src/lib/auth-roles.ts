import type { Session } from "@supabase/supabase-js";

export const ADMIN_USERNAME = "IbbyAdmin";
export const ADMIN_EMAIL = "ibbyadmin@ibbyautoworks.local";

export function loginIdentifierToEmail(identifier: string) {
  const trimmed = identifier.trim();
  if (trimmed.toLowerCase() === ADMIN_USERNAME.toLowerCase()) return ADMIN_EMAIL;
  return trimmed;
}

export function isAdminSession(session: Session | null) {
  const user = session?.user;
  if (!user) return false;
  const email = (user.email || "").toLowerCase();
  const username = String(user.user_metadata?.username || user.user_metadata?.display_name || "").toLowerCase();
  return email === ADMIN_EMAIL || username === ADMIN_USERNAME.toLowerCase() || user.user_metadata?.role === "admin";
}
