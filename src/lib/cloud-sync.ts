import { getCurrentSupabaseSession, getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import type { PrototypeCustomerRecord, PrototypeWorkOrder } from "@/lib/local-store";

export type CloudSyncResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  id?: string;
};

function addressFromOrder(order: PrototypeWorkOrder) {
  return {
    line1: order.location,
    raw: order.location
  };
}

function vehicleFromOrder(order: PrototypeWorkOrder) {
  return {
    label: order.vehicle,
    vin: order.vin,
    plate: order.plate,
    mileage: order.mileage,
    image: order.vehicleImage,
    spec: order.vehicleSpec
  };
}

export async function syncCustomerRecordToCloud(record: PrototypeCustomerRecord): Promise<CloudSyncResult> {
  if (!isSupabaseConfigured()) return { ok: false, skipped: true, reason: "Supabase public env is not configured" };
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (!supabase || !session?.user) return { ok: false, skipped: true, reason: "Customer is not signed in" };

  const { error } = await supabase.from("customer_records").upsert({
    user_id: session.user.id,
    customer_name: record.name,
    email: record.email || session.user.email,
    phone: record.phone,
    address: { raw: record.address },
    vehicles: [],
    notes: record.review ? `Review (${record.reviewRating}/5): ${record.review}` : null
  }, { onConflict: "user_id" });

  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: record.id };
}

export async function syncWorkOrderToCloud(order: PrototypeWorkOrder): Promise<CloudSyncResult> {
  if (!isSupabaseConfigured()) return { ok: false, skipped: true, reason: "Supabase public env is not configured" };
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (!supabase || !session?.user) return { ok: false, skipped: true, reason: "Customer is not signed in" };

  const status = order.status === "Complete" ? "completed" : order.status === "Scheduled" ? "confirmed" : "requested";
  const { error } = await supabase.from("work_orders").upsert({
    id: order.id,
    user_id: session.user.id,
    status,
    service_type: order.services?.join(", ") || order.service,
    requested_time_window: order.preferredWindow,
    customer_name: order.customer,
    email: order.email || session.user.email,
    phone: order.phone,
    address: addressFromOrder(order),
    vehicle: vehicleFromOrder(order),
    issue_description: order.symptoms,
    estimate: { tier: order.tier, draft: order.estimate, notes: order.estimateNotes },
    metadata: {
      prototypeId: order.id,
      localStatus: order.status,
      risk: order.risk,
      due: order.due,
      agreements: order.agreementAcceptance,
      preferences: order.customerPreferences,
      parts: order.parts,
      inspection: order.inspection
    }
  });

  if (error) return { ok: false, reason: error.message };

  await supabase.from("email_events").insert({
    user_id: session.user.id,
    work_order_id: order.id,
    event_type: "appointment_requested",
    recipient_email: order.email || session.user.email || "ibbyautoworks@gmail.com",
    subject: "Ibby Auto Works request received",
    payload: {
      customerName: order.customer,
      vehicle: order.vehicle,
      services: order.services,
      preferredWindow: order.preferredWindow
    }
  });

  return { ok: true, id: order.id };
}
