import type { Session } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export const ADMIN_USERNAME = "IbbyAdmin";
export const ADMIN_EMAIL = "ibbyadmin@ibbyautoworks.local";

// "admin" is the owner; "staff" is a technician who works jobs but not the books.
export type StaffRole = "admin" | "staff" | null;

export function loginIdentifierToEmail(identifier: string) {
  const trimmed = identifier.trim();
  if (trimmed.toLowerCase() === ADMIN_USERNAME.toLowerCase()) return ADMIN_EMAIL;
  return trimmed;
}

const roleCache = new Map<string, Promise<StaffRole>>();

// Roles come from the server-controlled admin_profiles table, never from
// user_metadata (which any user can set at signup). This only picks which
// workspaces to show; row-level security enforces the actual data access.
export function fetchStaffRole(session: Session | null): Promise<StaffRole> {
  const userId = session?.user?.id;
  const supabase = getSupabaseBrowserClient();
  if (!userId || !supabase) return Promise.resolve(null);
  let pending = roleCache.get(userId);
  if (!pending) {
    pending = Promise.resolve(supabase.rpc("my_staff_role")).then(({ data, error }) => (
      !error && (data === "admin" || data === "staff") ? data : null
    ));
    roleCache.set(userId, pending);
  }
  return pending;
}
