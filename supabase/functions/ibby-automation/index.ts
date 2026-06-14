// Ibby Auto Works automation scaffold for Supabase Edge Functions or later Vercel API migration.
// Server-only secrets required:
// - SUPABASE_URL
// - SUPABASE_SECRET_KEY
// - GOOGLE_OAUTH_CLIENT_ID
// - GOOGLE_OAUTH_CLIENT_SECRET
// - GOOGLE_OAUTH_REFRESH_TOKEN
//
// This scaffold intentionally does not send mail until deployed with secrets and tested.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function getGoogleAccessToken() {
  const body = new URLSearchParams({
    client_id: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") ?? "",
    client_secret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") ?? "",
    refresh_token: Deno.env.get("GOOGLE_OAUTH_REFRESH_TOKEN") ?? "",
    grant_type: "refresh_token"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) throw new Error(`Google refresh failed: ${response.status}`);
  return (await response.json()) as { access_token: string };
}

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SECRET_KEY") ?? "");
  const { access_token } = await getGoogleAccessToken();
  const { data: events, error } = await supabase
    .from("email_events")
    .select("id,event_type,recipient_email,subject,payload,status")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .limit(10);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  return Response.json({
    ok: true,
    ready: Boolean(access_token),
    queued: events?.length ?? 0,
    note: "Scaffold verified token refresh and queue read. Add Gmail send/calendar create handlers before enabling scheduled processing."
  });
});
