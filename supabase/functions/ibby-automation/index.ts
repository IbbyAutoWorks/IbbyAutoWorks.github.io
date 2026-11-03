// Sends queued customer emails through the owner's Gmail. Called every 5 minutes by
// pg_cron with the cron token. Keys come from the owner's Connections page. Until
// Gmail is connected, emails simply wait in the queue.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("IB_SUPABASE_SECRET_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

const json = (status: number, body: Record<string, unknown>) => Response.json(body, { status });
const clean = (value: unknown) => String(value ?? "").replace(/[\r\n]+/g, " ").trim();

async function readKeys() {
  const { data } = await supabase.from("integration_keys").select("name,value");
  return Object.fromEntries((data ?? []).map((row: { name: string; value: string }) => [row.name, row.value]));
}

async function googleAccessToken(keys: Record<string, string>) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: keys.google_oauth_client_id,
      client_secret: keys.google_oauth_client_secret,
      refresh_token: keys.google_oauth_refresh_token,
      grant_type: "refresh_token"
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(`Gmail connection failed: ${data.error_description || data.error || response.status}`);
  return data.access_token as string;
}

function base64(text: string) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

type Shop = { business_name?: string; phone?: string; email?: string; metadata?: { shared?: { marketing?: Record<string, unknown> } } };
type Event = { id: string; event_type: string; recipient_email: string; subject: string; payload: Record<string, unknown>; work_order_id: string | null };

function bodyFor(event: Event, shop: Shop) {
  const name = clean(event.payload.customerName).split(" ")[0];
  const vehicle = clean(event.payload.vehicle) || "your vehicle";
  const services = clean(event.payload.services);
  const when = clean(event.payload.preferredWindow);
  const greeting = name ? `Hi ${name},` : "Hi,";
  const lines: Record<string, string[]> = {
    appointment_requested: [`We got your request for ${vehicle}${services ? ` (${services})` : ""}.`, when ? `You asked for ${when}. We'll confirm the time with you soon.` : "We'll confirm a time with you soon."],
    appointment_confirmed: [`Your appointment for ${vehicle} is on the schedule${when ? `: ${when}` : ""}.`, "Please reply or call if that time no longer works."],
    appointment_reminder: [`A reminder that we're coming out tomorrow for ${vehicle}${when ? `: ${when}` : ""}.`, "Please reply or call if anything has changed."],
    en_route: [`Your technician is on the way to work on ${vehicle}.`],
    work_complete: [`The work on ${vehicle} is complete. Thank you for choosing us.`, "Your report is in your account on the app."],
    next_service: [`It's been about six months since we last serviced ${vehicle}. It may be due for maintenance.`, "Reply or request service in the app whenever you're ready."],
    test: ["This is a test from your Connections page. Customer emails are working."]
  };
  return [greeting, "", ...(lines[event.event_type] ?? [event.subject])].join("\n");
}

// Same rules as couponShowsIn on the site. A promotional line also legally needs a
// mailing address, so without one no coupon goes out.
async function couponLine(event: Event, shop: Shop, keys: Record<string, string>) {
  const marketing = shop.metadata?.shared?.marketing;
  const moment: Record<string, string> = { appointment_confirmed: "couponWithConfirmation", appointment_reminder: "couponWithReminder", next_service: "couponWithNextService" };
  const flag = moment[event.event_type];
  if (!marketing || !flag || !marketing[flag] || !marketing.couponsEnabled || !marketing.couponInEmail || !keys.business_mailing_address) return "";
  const today = new Date().toISOString().slice(0, 10);
  if ((marketing.couponStartDate && today < String(marketing.couponStartDate)) || (marketing.couponEndDate && today > String(marketing.couponEndDate))) return "";
  const { data: offers } = await supabase.from("promotion_offers").select("title,summary,code,slug,active").eq("active", true);
  const wanted = String(marketing.couponPopupCode ?? "").toLowerCase();
  const offer = (offers ?? []).find((item: { code?: string; slug: string }) => item.code?.toLowerCase() === wanted || item.slug.toLowerCase() === wanted) ?? offers?.[0];
  if (!offer) return "";
  return `\n\nOffer: ${clean(offer.title)}. ${clean(offer.summary)} Code: ${clean(offer.code || offer.slug.toUpperCase())}\nThis part of the message is an advertisement. Reply STOP to get no more of these.\n${clean(keys.business_mailing_address)}`;
}

async function sendOne(event: Event, shop: Shop, keys: Record<string, string>, token: string) {
  const recipient = clean(event.recipient_email);
  if (!/^\S+@\S+\.\S+$/.test(recipient)) throw new Error("Bad email address");
  const business = clean(shop.business_name) || "Ibby Auto Works";
  const signature = `\n\n${business}${shop.phone ? `\n${clean(shop.phone)}` : ""}`;
  const text = bodyFor(event, shop) + signature + (await couponLine(event, shop, keys));
  const message = [
    `To: ${recipient}`,
    `Subject: =?UTF-8?B?${base64(clean(event.subject))}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64(text)
  ].join("\r\n");
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ raw: base64(message).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") })
  });
  if (!response.ok) throw new Error(`Gmail refused it: ${response.status} ${(await response.text()).slice(0, 200)}`);
}

serve(async (req) => {
  const keys = await readKeys();
  if (!keys.cron_token || req.headers.get("x-ibby-cron") !== keys.cron_token) return json(401, { ok: false, error: "Not allowed" });

  // Don't surprise anyone with something stale once email is first switched on.
  const staleBefore = new Date(Date.now() - 3 * 864e5).toISOString();
  await supabase.from("email_events").update({ status: "cancelled", error: "Too old to send" }).eq("status", "queued").lt("scheduled_for", staleBefore);

  if (!keys.google_oauth_client_id || !keys.google_oauth_client_secret || !keys.google_oauth_refresh_token) {
    return json(200, { ok: true, connected: false, note: "Gmail isn't connected, so emails are waiting." });
  }

  let token = "";
  try {
    token = await googleAccessToken(keys);
    await supabase.from("integration_keys").delete().eq("name", "gmail_last_error");
  } catch (error) {
    await supabase.from("integration_keys").upsert({ name: "gmail_last_error", value: String(error), updated_at: new Date().toISOString() });
    return json(200, { ok: false, connected: true, error: String(error) });
  }

  const { data: shop } = await supabase.from("business_settings").select("business_name,phone,email,metadata").limit(1).maybeSingle();
  const { data: events, error } = await supabase
    .from("email_events")
    .select("id,event_type,recipient_email,subject,payload,work_order_id")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .limit(20);
  if (error) return json(500, { ok: false, error: error.message });

  let sent = 0;
  for (const event of (events ?? []) as Event[]) {
    // A cancelled job shouldn't still get its reminder.
    if (event.work_order_id && ["appointment_reminder", "en_route"].includes(event.event_type)) {
      const { data: order } = await supabase.from("work_orders").select("payload").eq("id", event.work_order_id).maybeSingle();
      const status = (order?.payload as { status?: string } | null)?.status;
      if (event.event_type === "appointment_reminder" && status !== "Scheduled") {
        await supabase.from("email_events").update({ status: "cancelled", error: "Job moved on" }).eq("id", event.id);
        continue;
      }
    }
    try {
      await sendOne(event, shop ?? {}, keys, token);
      await supabase.from("email_events").update({ status: "sent", sent_at: new Date().toISOString(), error: null }).eq("id", event.id);
      sent += 1;
    } catch (failure) {
      await supabase.from("email_events").update({ status: "failed", error: String(failure).slice(0, 500) }).eq("id", event.id);
    }
  }
  return json(200, { ok: true, connected: true, sent });
});
