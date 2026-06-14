"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, ExternalLink, RefreshCcw, Save, Trash2 } from "lucide-react";

import { archivePaymentPlan, isPaymentBackendConfigured, listPaymentPlans, ManagedPaymentPlan, savePaymentPlan } from "@/lib/payment-backend";

const emptyPlan: ManagedPaymentPlan = {
  slug: "",
  title: "",
  category: "custom",
  summary: "",
  deposit_label: "Deposit",
  terms: "",
  amount_cents: 10000,
  currency: "usd",
  mode: "payment",
  active: true
};

export function PaymentPlanManager() {
  const [adminToken, setAdminToken] = useState("");
  const [plans, setPlans] = useState<ManagedPaymentPlan[]>([]);
  const [draft, setDraft] = useState<ManagedPaymentPlan>(emptyPlan);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = isPaymentBackendConfigured();

  useEffect(() => {
    const saved = window.sessionStorage.getItem("ibby-admin-payment-token") || "";
    setAdminToken(saved);
  }, []);

  useEffect(() => {
    if (configured) void refresh();
  }, [configured]);

  const amountDollars = useMemo(() => (draft.amount_cents / 100).toFixed(2), [draft.amount_cents]);

  async function refresh(token = adminToken) {
    try {
      setBusy(true);
      setStatus("Loading payment plans...");
      const nextPlans = await listPaymentPlans(token || undefined);
      setPlans(nextPlans);
      setStatus(`Loaded ${nextPlans.length} payment plan${nextPlans.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  function rememberToken(value: string) {
    setAdminToken(value);
    window.sessionStorage.setItem("ibby-admin-payment-token", value);
  }

  async function saveDraft() {
    if (!adminToken) return setStatus("Enter the admin payment token first.");
    try {
      setBusy(true);
      const saved = await savePaymentPlan(draft, adminToken);
      setDraft(saved);
      await refresh(adminToken);
      setStatus(`Saved ${saved.title} and synced Stripe product/price/link.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function archive(slug: string) {
    if (!adminToken) return setStatus("Enter the admin payment token first.");
    try {
      setBusy(true);
      await archivePaymentPlan(slug, adminToken);
      await refresh(adminToken);
      setStatus(`Archived ${slug}. Stripe product/price disabled and the plan is hidden from customers.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  function edit(plan: ManagedPaymentPlan) {
    setDraft({ ...plan });
  }

  return (
    <section className="panel payment-plan-manager-panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Stripe + Supabase plan manager</p>
          <h2>Create, edit, archive, and open checkout plans from the admin portal.</h2>
        </div>
        <CreditCard />
      </div>
      {!configured ? <p className="legal-note">Supabase URL is not configured in this static build, so live plan management is disabled.</p> : null}
      <div className="admin-token-row">
        <label><span>Admin payment token</span><input type="password" value={adminToken} onChange={(event) => rememberToken(event.target.value)} placeholder="Paste private admin token" /></label>
        <button className="secondary-button" disabled={busy || !configured} onClick={() => refresh()}><RefreshCcw size={15} /> Refresh</button>
      </div>
      <div className="payment-manager-grid">
        <div className="payment-manager-list">
          {plans.map((plan) => (
            <article className={!plan.active ? "archived-plan" : ""} key={plan.slug}>
              <button onClick={() => edit(plan)}><strong>{plan.title}</strong><span>{plan.slug} - ${(plan.amount_cents / 100).toFixed(2)} {plan.mode === "subscription" ? "/mo" : ""}</span></button>
              {plan.stripe_payment_link_url ? <a href={plan.stripe_payment_link_url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> checkout</a> : null}
              <button className="danger-link" onClick={() => archive(plan.slug)}><Trash2 size={14} /> archive</button>
            </article>
          ))}
        </div>
        <div className="payment-manager-form">
          <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder="custom-plan" /></label>
          <label><span>Title</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label><span>Category</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ManagedPaymentPlan["category"] })}><option>service</option><option>parts</option><option>tires</option><option>roadside</option><option>bundle</option><option>custom</option></select></label>
          <label><span>Mode</span><select value={draft.mode} onChange={(event) => setDraft({ ...draft, mode: event.target.value as ManagedPaymentPlan["mode"] })}><option value="payment">one-time payment/deposit</option><option value="subscription">monthly subscription</option></select></label>
          <label><span>Amount dollars</span><input type="number" step="0.01" min="0" value={amountDollars} onChange={(event) => setDraft({ ...draft, amount_cents: Math.round(Number(event.target.value || 0) * 100) })} /></label>
          <label><span>Deposit label</span><input value={draft.deposit_label} onChange={(event) => setDraft({ ...draft, deposit_label: event.target.value })} /></label>
          <label><span>Summary</span><textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
          <label><span>Terms</span><textarea value={draft.terms} onChange={(event) => setDraft({ ...draft, terms: event.target.value })} /></label>
          <label className="toggle-row"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /><span>Active/customer-visible</span></label>
          <button className="primary-button" disabled={busy || !configured} onClick={saveDraft}><Save size={15} /> Save and sync Stripe</button>
        </div>
      </div>
      {status ? <p className="legal-note">{status}</p> : null}
    </section>
  );
}
