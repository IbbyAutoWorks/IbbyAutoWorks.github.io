import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PaymentPlan = {
  id?: string;
  slug: string;
  title: string;
  category: string;
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
  metadata?: Record<string, unknown>;
};

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-ibby-admin-token",
  "access-control-allow-methods": "GET, POST, OPTIONS"
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...corsHeaders, ...(init.headers ?? {}) }
  });
}

function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const supabase = createClient(requireEnv("SUPABASE_URL"), Deno.env.get("IB_SUPABASE_SECRET_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "");
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET_KEY_TEST") || "";
const adminToken = Deno.env.get("IBBY_ADMIN_API_TOKEN") || "";
const adminUsername = (Deno.env.get("IBBY_ADMIN_USERNAME") || "IbbyAdmin").toLowerCase();
const adminEmail = (Deno.env.get("IBBY_ADMIN_EMAIL") || "ibbyadmin@ibbyautoworks.local").toLowerCase();

function bearerToken(req: Request) {
  const value = req.headers.get("authorization") || "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

async function getSessionUser(req: Request) {
  const token = bearerToken(req);
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

async function isAdmin(req: Request) {
  if (adminToken && req.headers.get("x-ibby-admin-token") === adminToken) return true;
  const user = await getSessionUser(req);
  const email = (user?.email || "").toLowerCase();
  const username = String(user?.user_metadata?.username || user?.user_metadata?.display_name || "").toLowerCase();
  if (email === adminEmail || username === adminUsername || user?.user_metadata?.role === "admin") return true;
  if (user?.id) {
    const { data } = await supabase.from("admin_profiles").select("active,role").eq("user_id", user.id).maybeSingle();
    if (data?.active && data?.role === "admin") return true;
  }
  return false;
}

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function stripePost(path: string, params: Record<string, string | number | boolean | null | undefined>) {
  if (!stripeKey) throw new Error("Stripe secret key is not configured");
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) body.set(key, String(value));
  }
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${stripeKey}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Stripe API failed: ${response.status}`);
  return data;
}

async function syncStripeObjects(plan: PaymentPlan) {
  const product = plan.stripe_product_id
    ? await stripePost(`/products/${plan.stripe_product_id}`, {
        name: plan.title,
        description: plan.summary,
        active: plan.active,
        "metadata[app]": "ibby-auto-works",
        "metadata[slug]": plan.slug,
        "metadata[category]": plan.category
      })
    : await stripePost("/products", {
        name: plan.title,
        description: plan.summary,
        active: plan.active,
        "metadata[app]": "ibby-auto-works",
        "metadata[slug]": plan.slug,
        "metadata[category]": plan.category
      });

  const priceParams: Record<string, string | number | boolean> = {
    currency: plan.currency || "usd",
    unit_amount: plan.amount_cents,
    product: product.id,
    active: plan.active,
    "metadata[app]": "ibby-auto-works",
    "metadata[slug]": plan.slug,
    "metadata[category]": plan.category
  };
  if (plan.mode === "subscription") priceParams["recurring[interval]"] = "month";
  const price = await stripePost("/prices", priceParams);
  if (plan.stripe_price_id && plan.stripe_price_id !== price.id) {
    await stripePost(`/prices/${plan.stripe_price_id}`, { active: false });
  }

  const linkParams: Record<string, string | number | boolean> = {
    "line_items[0][price]": price.id,
    "line_items[0][quantity]": 1,
    active: plan.active,
    "metadata[app]": "ibby-auto-works",
    "metadata[slug]": plan.slug,
    "metadata[category]": plan.category,
    "after_completion[type]": "hosted_confirmation",
    "after_completion[hosted_confirmation][custom_message]": "Payment received in the Ibby Auto Works checkout. Your work order will update after payment review."
  };
  linkParams["allow_promotion_codes"] = true;
  if (plan.mode === "subscription") {
    linkParams["subscription_data[metadata][app]"] = "ibby-auto-works";
    linkParams["subscription_data[metadata][slug]"] = plan.slug;
  } else {
    linkParams["payment_intent_data[metadata][app]"] = "ibby-auto-works";
    linkParams["payment_intent_data[metadata][slug]"] = plan.slug;
  }
  const link = await stripePost("/payment_links", linkParams);

  return {
    ...plan,
    stripe_product_id: product.id,
    stripe_price_id: price.id,
    stripe_payment_link_id: link.id,
    stripe_payment_link_url: link.url
  };
}

async function listPlans(includeInactive = false) {
  let query = supabase.from("payment_plans").select("*").order("created_at", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function listPromotions(includeInactive = false) {
  let query = supabase.from("promotion_offers").select("*").order("created_at", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function getTaxSettings() {
  const { data, error } = await supabase.from("tax_settings").select("*").eq("id", "maine-default").single();
  if (error) throw error;
  return data;
}

async function getYearEndSummary(year: number) {
  const start = `${year}-01-01T00:00:00.000Z`;
  const end = `${year + 1}-01-01T00:00:00.000Z`;
  const { data: payments, error: paymentError } = await supabase
    .from("payment_events")
    .select("amount_cents,currency,status,event_type,created_at")
    .gte("created_at", start)
    .lt("created_at", end);
  if (paymentError) throw paymentError;
  const { data: expenses, error: expenseError } = await supabase
    .from("business_expense_records")
    .select("amount_cents,category,expense_date")
    .gte("expense_date", `${year}-01-01`)
    .lt("expense_date", `${year + 1}-01-01`);
  if (expenseError) throw expenseError;
  const income_cents = (payments ?? []).reduce((sum: number, row: { amount_cents?: number | null }) => sum + Number(row.amount_cents ?? 0), 0);
  const expense_cents = (expenses ?? []).reduce((sum: number, row: { amount_cents?: number | null }) => sum + Number(row.amount_cents ?? 0), 0);
  const expenses_by_category = (expenses ?? []).reduce((acc: Record<string, number>, row: { category?: string | null; amount_cents?: number | null }) => {
    const category = row.category || "uncategorized";
    acc[category] = (acc[category] ?? 0) + Number(row.amount_cents ?? 0);
    return acc;
  }, {});
  return { year, income_cents, expense_cents, net_cents: income_cents - expense_cents, payment_count: payments?.length ?? 0, expense_count: expenses?.length ?? 0, expenses_by_category };
}


async function syncStripePromotion(promotion: Record<string, unknown>) {
  const code = String(promotion.code || promotion.stripe_promotion_code || promotion.slug || "").toUpperCase();
  const title = String(promotion.title || promotion.slug || code);
  const duration = "once";
  let couponId = String(promotion.stripe_coupon_id || "");
  if (!couponId) {
    const params: Record<string, string | number | boolean> = {
      name: title,
      duration,
      "metadata[app]": "ibby-auto-works",
      "metadata[slug]": String(promotion.slug || ""),
      "metadata[offer_type]": String(promotion.offer_type || "")
    };
    const amount = Number(promotion.discount_cents || 0);
    const percent = Number(promotion.discount_percent || 0);
    if (amount > 0) {
      params.amount_off = Math.round(amount);
      params.currency = "usd";
    } else {
      params.percent_off = Math.max(1, Math.min(100, percent || 100));
    }
    const coupon = await stripePost("/coupons", params);
    couponId = coupon.id;
  }
  let promoCodeId = String(promotion.stripe_promotion_code_id || "");
  if (!promoCodeId && code) {
    const promoCode = await stripePost("/promotion_codes", {
      "promotion[type]": "coupon",
      "promotion[coupon]": couponId,
      code,
      active: promotion.active !== false,
      "metadata[app]": "ibby-auto-works",
      "metadata[slug]": String(promotion.slug || "")
    });
    promoCodeId = promoCode.id;
  } else if (promoCodeId) {
    await stripePost(`/promotion_codes/${promoCodeId}`, { active: promotion.active !== false });
  }
  return { ...promotion, stripe_coupon_id: couponId, stripe_promotion_code_id: promoCodeId, stripe_promotion_code: code };
}

async function listExpenses(year?: number) {
  let query = supabase.from("business_expense_records").select("*").order("expense_date", { ascending: false }).limit(500);
  if (year) {
    query = query.gte("expense_date", `${year}-01-01`).lt("expense_date", `${year + 1}-01-01`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    if (req.method === "GET") {
      const admin = await isAdmin(req);
      return json({ ok: true, admin, plans: await listPlans(admin) });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "list") {
      const admin = await isAdmin(req);
      return json({ ok: true, admin, plans: await listPlans(admin) });
    }

    if (action === "checkout") {
      const slug = String(body.slug || "");
      const { data: plan, error } = await supabase.from("payment_plans").select("*").eq("slug", slug).eq("active", true).single();
      if (error || !plan) return json({ ok: false, error: "Payment plan not found" }, { status: 404 });
      if (plan.stripe_payment_link_url && !body.force_session) {
        return json({ ok: true, checkout_url: plan.stripe_payment_link_url, plan });
      }
      const success = body.success_url || `${url.origin}/functions/v1/ibby-payments?success=1`;
      const cancel = body.cancel_url || `${url.origin}/functions/v1/ibby-payments?cancel=1`;
      const params: Record<string, string | number | boolean> = {
        mode: plan.mode,
        success_url: success,
        cancel_url: cancel,
        "line_items[0][price]": plan.stripe_price_id,
        "line_items[0][quantity]": 1,
        "metadata[app]": "ibby-auto-works",
        "metadata[slug]": plan.slug,
        "metadata[work_order_id]": body.work_order_id || "manual",
        allow_promotion_codes: true
      };
      if (body.customer_email) params.customer_email = body.customer_email;
      const session = await stripePost("/checkout/sessions", params);
      return json({ ok: true, checkout_url: session.url, session_id: session.id, plan });
    }

    if (!(await isAdmin(req))) return json({ ok: false, error: "Admin credentials required" }, { status: 401 });

    if (action === "upsert_plan") {
      const incoming = body.plan ?? {};
      const slug = slugify(incoming.slug || incoming.title || "custom-plan");
      const plan: PaymentPlan = {
        slug,
        title: String(incoming.title || slug),
        category: String(incoming.category || "custom"),
        summary: String(incoming.summary || ""),
        deposit_label: String(incoming.deposit_label || "Deposit"),
        terms: String(incoming.terms || ""),
        amount_cents: Math.max(0, Number.parseInt(String(incoming.amount_cents ?? 0), 10)),
        currency: String(incoming.currency || "usd").toLowerCase(),
        mode: incoming.mode === "subscription" ? "subscription" : "payment",
        active: incoming.active !== false,
        stripe_product_id: incoming.stripe_product_id ?? null,
        stripe_price_id: incoming.stripe_price_id ?? null,
        stripe_payment_link_id: incoming.stripe_payment_link_id ?? null,
        stripe_payment_link_url: incoming.stripe_payment_link_url ?? null,
        metadata: incoming.metadata ?? {}
      };
      const synced = await syncStripeObjects(plan);
      const { data, error } = await supabase.from("payment_plans").upsert(synced, { onConflict: "slug" }).select("*").single();
      if (error) throw error;
      return json({ ok: true, plan: data });
    }

    if (action === "archive_plan" || action === "delete_plan") {
      const slug = slugify(body.slug || "");
      const { data: plan, error: loadError } = await supabase.from("payment_plans").select("*").eq("slug", slug).single();
      if (loadError || !plan) return json({ ok: false, error: "Payment plan not found" }, { status: 404 });
      if (plan.stripe_product_id) await stripePost(`/products/${plan.stripe_product_id}`, { active: false });
      if (plan.stripe_price_id) await stripePost(`/prices/${plan.stripe_price_id}`, { active: false });
      const { data, error } = await supabase.from("payment_plans").update({ active: false }).eq("slug", slug).select("*").single();
      if (error) throw error;
      return json({ ok: true, archived: true, plan: data });
    }

    if (action === "list_promotions") {
      const admin = await isAdmin(req);
      return json({ ok: true, admin, promotions: await listPromotions(admin), tax_settings: await getTaxSettings() });
    }

    if (action === "upsert_promotion") {
      const incoming = body.promotion ?? {};
      const slug = slugify(incoming.slug || incoming.title || "custom-offer");
      const promotion = {
        slug,
        title: String(incoming.title || slug),
        offer_type: String(incoming.offer_type || "manual_review"),
        summary: String(incoming.summary || ""),
        applies_to: String(incoming.applies_to || "service"),
        discount_cents: Math.max(0, Number.parseInt(String(incoming.discount_cents ?? 0), 10)),
        discount_percent: Math.max(0, Math.min(100, Number(incoming.discount_percent ?? 0))),
        requires_purchase: String(incoming.requires_purchase || ""),
        code: incoming.code ? String(incoming.code).toUpperCase() : null,
        active: incoming.active !== false,
        taxable_note: String(incoming.taxable_note || "Discount should reduce taxable receipt when applied before payment; verify treatment with accountant/Maine Revenue Services."),
        metadata: incoming.metadata ?? {}
      };
      const synced = await syncStripePromotion(promotion);
      const { data, error } = await supabase.from("promotion_offers").upsert(synced, { onConflict: "slug" }).select("*").single();
      if (error) throw error;
      return json({ ok: true, promotion: data });
    }

    if (action === "archive_promotion") {
      const slug = slugify(body.slug || "");
      const { data: existing } = await supabase.from("promotion_offers").select("*").eq("slug", slug).single();
      if (existing?.stripe_promotion_code_id) await stripePost(`/promotion_codes/${existing.stripe_promotion_code_id}`, { active: false });
      const { data, error } = await supabase.from("promotion_offers").update({ active: false }).eq("slug", slug).select("*").single();
      if (error) throw error;
      return json({ ok: true, archived: true, promotion: data });
    }

    if (action === "save_tax_settings") {
      const incoming = body.tax_settings ?? {};
      const settings = {
        id: "maine-default",
        state: "ME",
        label: String(incoming.label || "Maine sales tax"),
        sales_tax_rate: Number(incoming.sales_tax_rate ?? 0.055),
        local_tax_rate: Number(incoming.local_tax_rate ?? 0),
        parts_taxable: incoming.parts_taxable !== false,
        labor_taxable: incoming.labor_taxable !== false,
        diagnostic_taxable: incoming.diagnostic_taxable !== false,
        shop_supplies_taxable: incoming.shop_supplies_taxable !== false,
        tire_fees_note: String(incoming.tire_fees_note || "Track tire/disposal/environmental fees separately from sales tax when charged."),
        disclaimer: String(incoming.disclaimer || "Maine generally uses a 5.5% sales tax with no local sales tax. Auto parts and repair/installation services may be taxable; verify final filing treatment with Maine Revenue Services or a tax professional.")
      };
      const { data, error } = await supabase.from("tax_settings").upsert(settings, { onConflict: "id" }).select("*").single();
      if (error) throw error;
      return json({ ok: true, tax_settings: data });
    }

    if (action === "year_end_summary") {
      const year = Number.parseInt(String(body.year || new Date().getUTCFullYear()), 10);
      return json({ ok: true, summary: await getYearEndSummary(year), tax_settings: await getTaxSettings() });
    }

    if (action === "sync_all_promotions") {
      const promotions = await listPromotions(true);
      const synced = [];
      for (const promotion of promotions) {
        const next = await syncStripePromotion(promotion);
        const { data, error } = await supabase.from("promotion_offers").upsert(next, { onConflict: "slug" }).select("*").single();
        if (error) throw error;
        synced.push(data);
      }
      return json({ ok: true, promotions: synced });
    }

    if (action === "list_expenses") {
      return json({ ok: true, expenses: await listExpenses(Number.parseInt(String(body.year || "0"), 10) || undefined) });
    }

    if (action === "upsert_expense") {
      const incoming = body.expense ?? {};
      const expense = {
        id: incoming.id || undefined,
        expense_date: String(incoming.expense_date || new Date().toISOString().slice(0, 10)),
        vendor: String(incoming.vendor || ""),
        category: String(incoming.category || "supplies"),
        description: String(incoming.description || ""),
        amount_cents: Math.max(0, Number.parseInt(String(incoming.amount_cents ?? 0), 10)),
        payment_method: String(incoming.payment_method || ""),
        receipt_url: incoming.receipt_url ? String(incoming.receipt_url) : null,
        notes: String(incoming.notes || "")
      };
      const { data, error } = await supabase.from("business_expense_records").upsert(expense).select("*").single();
      if (error) throw error;
      return json({ ok: true, expense: data });
    }

    if (action === "delete_expense") {
      const { error } = await supabase.from("business_expense_records").delete().eq("id", String(body.id || ""));
      if (error) throw error;
      return json({ ok: true, deleted: true });
    }

    return json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
