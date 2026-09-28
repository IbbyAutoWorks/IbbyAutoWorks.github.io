import type { RealtimeChannel } from "@supabase/supabase-js";

import { getCurrentSupabaseSession, getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client";
import type { PrototypeCustomerRecord, PrototypeWorkOrder } from "@/lib/local-store";

export type CloudSyncResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  id?: string;
};

type WorkOrderRow = {
  id: string;
  payload: PrototypeWorkOrder | Record<string, never>;
  client_updated_at: string;
};

// The DB keeps a coarse status for reporting; the full app status lives in payload.
function dbStatus(status: PrototypeWorkOrder["status"]) {
  if (status === "Requested" || status === "Parts Search") return "requested";
  if (status === "Complete") return "completed";
  if (status === "Awaiting Payment") return "awaiting_payment";
  if (status === "Accepted" || status === "Estimate Sent" || status === "Scheduled") return "confirmed";
  return "in_progress";
}

function rowFromOrder(order: PrototypeWorkOrder) {
  return {
    id: order.id,
    status: dbStatus(order.status),
    service_type: order.services?.join(", ") || order.service,
    requested_time_window: order.preferredWindow,
    customer_name: order.customer,
    email: order.email,
    phone: order.phone,
    address: { line1: order.location, raw: order.location },
    vehicle: { label: order.vehicle, vin: order.vin, plate: order.plate, mileage: order.mileage },
    issue_description: order.symptoms,
    estimate: { tier: order.tier, draft: order.estimate, notes: order.estimateNotes },
    payload: order,
    client_updated_at: order.updatedAt ?? order.createdAt
  };
}

let staffCache: { userId: string; staff: boolean } | null = null;

// Staff (admin_profiles admin/staff) see and edit every order; everyone else can only submit.
export async function isCloudStaff(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (!supabase || !session?.user) return false;
  if (staffCache?.userId === session.user.id) return staffCache.staff;
  const { data, error } = await supabase.rpc("is_admin");
  const staff = !error && data === true;
  staffCache = { userId: session.user.id, staff };
  return staff;
}

export async function syncWorkOrderToCloud(order: PrototypeWorkOrder): Promise<CloudSyncResult> {
  if (!isSupabaseConfigured()) return { ok: false, skipped: true, reason: "Supabase public env is not configured" };
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, skipped: true, reason: "Supabase client unavailable" };
  const session = await getCurrentSupabaseSession();
  const row = rowFromOrder(order);

  if (await isCloudStaff()) {
    // Staff edits keep whatever user_id the customer's original request carried.
    const { error } = await supabase.from("work_orders").upsert(row);
    return error ? { ok: false, reason: error.message } : { ok: true, id: order.id };
  }

  // Customers and guests submit once; later local edits on their device stay local.
  const { error } = await supabase.from("work_orders").insert({ ...row, user_id: session?.user.id ?? null });
  if (error && error.code !== "23505") return { ok: false, reason: error.message };
  return { ok: true, id: order.id };
}

export async function fetchCloudWorkOrders(): Promise<PrototypeWorkOrder[] | null> {
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (!supabase || !session?.user) return null;
  const { data, error } = await supabase
    .from("work_orders")
    .select("id,payload,client_updated_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) {
    console.warn("Ibby cloud work-order fetch failed", error.message);
    return null;
  }
  return (data as WorkOrderRow[]).map(orderFromRow).filter((order): order is PrototypeWorkOrder => order !== null);
}

function orderFromRow(row: WorkOrderRow): PrototypeWorkOrder | null {
  if (!row.payload || !("id" in row.payload)) return null;
  return { ...(row.payload as PrototypeWorkOrder), id: row.id, updatedAt: (row.payload as PrototypeWorkOrder).updatedAt ?? row.client_updated_at };
}

export function subscribeToCloudWorkOrders(onOrder: (order: PrototypeWorkOrder) => void): () => void {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return () => {};
  const channel: RealtimeChannel = supabase
    .channel("ibby-work-orders")
    .on("postgres_changes", { event: "*", schema: "public", table: "work_orders" }, (change) => {
      const order = change.new && "id" in change.new ? orderFromRow(change.new as WorkOrderRow) : null;
      if (order) onOrder(order);
    })
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
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
