// Stripe -> Ibby Auto Works payment reconciliation.
// Server-only secrets required:
// - SUPABASE_URL, IB_SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)
// - STRIPE_WEBHOOK_SECRET (the endpoint's signing secret, whsec_...)
//
// Stripe calls this directly, so it is deployed without JWT verification and
// instead verifies the Stripe-Signature header.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("IB_SUPABASE_SECRET_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const toleranceSeconds = 300;

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index++) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

// Stripe signs `${timestamp}.${rawBody}` with HMAC-SHA256 using the endpoint secret.
async function verifySignature(header: string, rawBody: string) {
  const parts = header.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1] ?? "";
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > toleranceSeconds) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(webhookSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`)));
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

type CheckoutSession = {
  id: string;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
};

// Records the payment on the work order. A finished job waiting on payment moves
// to Complete; an earlier deposit is logged without changing the job's status.
async function markWorkOrderPaid(workOrderId: string, session: CheckoutSession) {
  const { data: row, error } = await supabase.from("work_orders").select("id,payload").eq("id", workOrderId).maybeSingle();
  if (error || !row) return { updated: false, reason: error?.message ?? "work order not found" };

  const now = new Date().toISOString();
  const amount = typeof session.amount_total === "number" ? `$${(session.amount_total / 100).toFixed(2)}` : "";
  const payload = { ...(row.payload ?? {}) } as Record<string, unknown>;
  const finishing = payload.status === "Awaiting Payment";
  payload.payment = { method: "Stripe", amount, reference: session.id, recordedAt: now, source: "stripe" };
  if (finishing) {
    payload.status = "Complete";
    payload.risk = "PDF ready";
  }
  const log = Array.isArray(payload.customerContactLog) ? payload.customerContactLog : [];
  payload.customerContactLog = [...log, `${new Date(now).toLocaleString("en-US", { timeZone: "America/New_York" })}: Stripe payment received${amount ? ` (${amount})` : ""}${finishing ? "; status changed to Complete" : ""}`];
  payload.updatedAt = now;

  const { error: updateError } = await supabase
    .from("work_orders")
    .update({ payload, client_updated_at: now, ...(finishing ? { status: "completed" } : {}) })
    .eq("id", workOrderId);
  return { updated: !updateError, reason: updateError?.message };
}

serve(async (req) => {
  if (req.method !== "POST") return reply(405, { ok: false, error: "POST only" });
  if (!webhookSecret) return reply(500, { ok: false, error: "STRIPE_WEBHOOK_SECRET is not configured" });

  const rawBody = await req.text();
  if (!(await verifySignature(req.headers.get("stripe-signature") ?? "", rawBody))) {
    return reply(400, { ok: false, error: "Invalid Stripe signature" });
  }

  const event = JSON.parse(rawBody) as { id: string; type: string; data: { object: CheckoutSession } };
  const session = event.data.object;
  const workOrderId = session.metadata?.work_order_id && session.metadata.work_order_id !== "manual" ? session.metadata.work_order_id : null;

  // stripe_event_id is unique, so Stripe retries of the same event are ignored.
  const { error: logError } = await supabase.from("payment_events").insert({
    provider: "stripe",
    stripe_event_id: event.id,
    event_type: event.type,
    work_order_id: workOrderId,
    customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    amount_cents: typeof session.amount_total === "number" ? session.amount_total : null,
    currency: session.currency ?? "usd",
    status: session.payment_status ?? "received",
    payload: event
  });
  if (logError?.code === "23505") return reply(200, { ok: true, duplicate: true });
  if (logError) return reply(500, { ok: false, error: logError.message });

  const paid = (event.type === "checkout.session.completed" && session.payment_status === "paid")
    || event.type === "checkout.session.async_payment_succeeded";
  if (paid && workOrderId) {
    const result = await markWorkOrderPaid(workOrderId, session);
    return reply(200, { ok: true, workOrderId, ...result });
  }
  return reply(200, { ok: true, logged: true });
});
