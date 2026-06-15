import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export type ManagedPaymentPlan = {
  id?: string;
  slug: string;
  title: string;
  category: "service" | "parts" | "tires" | "roadside" | "bundle" | "custom";
  summary: string;
  deposit_label: string;
  terms: string;
  amount_cents: number;
  currency: string;
  mode: "payment" | "subscription";
  active: boolean;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  stripe_payment_link_id?: string | null;
  stripe_payment_link_url?: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const functionUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/ibby-payments` : "";

export function isPaymentBackendConfigured() {
  return Boolean(functionUrl);
}

async function paymentRequest(body: Record<string, unknown>, adminToken?: string) {
  if (!functionUrl) throw new Error("Supabase payment function is not configured");
  const supabase = getSupabaseBrowserClient();
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (adminToken) headers["x-ibby-admin-token"] = adminToken;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (accessToken) headers.authorization = `Bearer ${accessToken}`;
  }
  const response = await fetch(functionUrl, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || `Payment backend failed: ${response.status}`);
  return data;
}

export async function listPaymentPlans(adminToken?: string): Promise<ManagedPaymentPlan[]> {
  const data = await paymentRequest({ action: "list" }, adminToken);
  return data.plans ?? [];
}

export async function savePaymentPlan(plan: ManagedPaymentPlan, adminToken: string): Promise<ManagedPaymentPlan> {
  const data = await paymentRequest({ action: "upsert_plan", plan }, adminToken);
  return data.plan;
}

export async function archivePaymentPlan(slug: string, adminToken: string): Promise<ManagedPaymentPlan> {
  const data = await paymentRequest({ action: "archive_plan", slug }, adminToken);
  return data.plan;
}

export async function openCheckoutForPlan(slug: string, workOrderId?: string, customerEmail?: string) {
  const data = await paymentRequest({ action: "checkout", slug, work_order_id: workOrderId, customer_email: customerEmail });
  if (!data.checkout_url) throw new Error("Checkout URL was not returned");
  window.open(data.checkout_url, "_blank", "noopener,noreferrer");
}


export type ManagedPromotionOffer = {
  id?: string;
  slug: string;
  title: string;
  offer_type: "free_service" | "discount_amount" | "discount_percent" | "bundle_bonus" | "manual_review";
  summary: string;
  applies_to: string;
  discount_cents: number;
  discount_percent: number;
  requires_purchase: string;
  code?: string | null;
  active: boolean;
  taxable_note: string;
  stripe_coupon_id?: string | null;
  stripe_promotion_code_id?: string | null;
  stripe_promotion_code?: string | null;
};

export type MaineTaxSettings = {
  id?: string;
  state: "ME";
  label: string;
  sales_tax_rate: number;
  local_tax_rate: number;
  parts_taxable: boolean;
  labor_taxable: boolean;
  diagnostic_taxable: boolean;
  shop_supplies_taxable: boolean;
  tire_fees_note: string;
  disclaimer: string;
};

export async function listPromotionOffers(adminToken?: string): Promise<{ promotions: ManagedPromotionOffer[]; tax_settings: MaineTaxSettings | null }> {
  const data = await paymentRequest({ action: "list_promotions" }, adminToken);
  return { promotions: data.promotions ?? [], tax_settings: data.tax_settings ?? null };
}

export async function savePromotionOffer(promotion: ManagedPromotionOffer, adminToken: string): Promise<ManagedPromotionOffer> {
  const data = await paymentRequest({ action: "upsert_promotion", promotion }, adminToken);
  return data.promotion;
}

export async function archivePromotionOffer(slug: string, adminToken: string): Promise<ManagedPromotionOffer> {
  const data = await paymentRequest({ action: "archive_promotion", slug }, adminToken);
  return data.promotion;
}

export async function saveMaineTaxSettings(tax_settings: MaineTaxSettings, adminToken: string): Promise<MaineTaxSettings> {
  const data = await paymentRequest({ action: "save_tax_settings", tax_settings }, adminToken);
  return data.tax_settings;
}

export async function getYearEndSummary(year: number, adminToken: string) {
  const data = await paymentRequest({ action: "year_end_summary", year }, adminToken);
  return data.summary;
}


export async function syncAllPromotions(adminToken: string): Promise<ManagedPromotionOffer[]> {
  const data = await paymentRequest({ action: "sync_all_promotions" }, adminToken);
  return data.promotions ?? [];
}

export type BusinessExpenseRecord = {
  id?: string;
  expense_date: string;
  vendor: string;
  category: string;
  description: string;
  amount_cents: number;
  payment_method: string;
  receipt_url?: string | null;
  notes: string;
};

export async function listExpenses(year: number, adminToken: string): Promise<BusinessExpenseRecord[]> {
  const data = await paymentRequest({ action: "list_expenses", year }, adminToken);
  return data.expenses ?? [];
}

export async function saveExpense(expense: BusinessExpenseRecord, adminToken: string): Promise<BusinessExpenseRecord> {
  const data = await paymentRequest({ action: "upsert_expense", expense }, adminToken);
  return data.expense;
}

export async function deleteExpense(id: string, adminToken: string) {
  await paymentRequest({ action: "delete_expense", id }, adminToken);
}
