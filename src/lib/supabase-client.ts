import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

function cleanPublicEnv(value?: string) {
  return value?.trim().replace(/^['"]+|['"]+$/g, "");
}

const supabaseUrl = cleanPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabasePublishableKey = cleanPublicEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  browserClient ??= createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return browserClient;
}

export async function getCurrentSupabaseSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}
