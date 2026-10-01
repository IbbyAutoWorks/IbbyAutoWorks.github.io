import { getSupabaseBrowserClient } from "@/lib/supabase-client";

// Owner's register of outside services. Passwords are deliberately not stored -
// only how to log in and where the password is kept.

export type BusinessService = {
  id: string;
  name: string;
  category: string;
  website: string;
  login_email: string;
  login_method: string;
  password_location: string;
  plan: string;
  cost_cents: number;
  billing_cycle: "monthly" | "yearly" | "one-time" | "usage" | "free";
  renewal_date: string | null;
  paid_with: string;
  tax_category: string;
  notes: string;
  active: boolean;
};

export const loginMethods = ["Google login", "GitHub login", "Email + password", "Email magic link", "Apple login", "Other"];
export const billingCycles: BusinessService["billing_cycle"][] = ["monthly", "yearly", "one-time", "usage", "free"];

export function emptyService(): Omit<BusinessService, "id"> {
  return {
    name: "", category: "Software", website: "", login_email: "", login_method: "", password_location: "",
    plan: "", cost_cents: 0, billing_cycle: "monthly", renewal_date: null, paid_with: "",
    tax_category: "Software & subscriptions", notes: "", active: true
  };
}

// Yearly cost used in the tax summary; usage-billed services need their real bills.
export function annualCostCents(service: Pick<BusinessService, "cost_cents" | "billing_cycle" | "active">) {
  if (!service.active) return 0;
  if (service.billing_cycle === "monthly") return service.cost_cents * 12;
  if (service.billing_cycle === "yearly" || service.billing_cycle === "one-time") return service.cost_cents;
  return 0;
}

function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

export async function listBusinessServices(): Promise<BusinessService[]> {
  const { data, error } = await client().from("business_services").select("*").order("active", { ascending: false }).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as BusinessService[];
}

export async function saveBusinessService(service: Partial<BusinessService> & { name: string }) {
  const row = { ...service, renewal_date: service.renewal_date || null };
  const { error } = service.id
    ? await client().from("business_services").update(row).eq("id", service.id)
    : await client().from("business_services").insert(row);
  if (error) throw new Error(error.message);
}

export async function deleteBusinessService(id: string) {
  const { error } = await client().from("business_services").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
