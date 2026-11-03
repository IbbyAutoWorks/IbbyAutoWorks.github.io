"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, BadgePercent, FileSpreadsheet, RefreshCcw, Save, Trash2 } from "lucide-react";

import { archivePromotionOffer, getYearEndSummary, listExpenses, listPromotionOffers, MaineTaxSettings, ManagedPromotionOffer, saveExpense, saveMaineTaxSettings, savePromotionOffer, syncAllPromotions, type BusinessExpenseRecord } from "@/lib/payment-backend";
import { businessLedgerFromWorkOrders, readPrototypeWorkOrders, WORK_ORDERS_EVENT } from "@/lib/local-store";

const emptyPromotion: ManagedPromotionOffer = {
  slug: "",
  title: "",
  offer_type: "manual_review",
  summary: "",
  applies_to: "service",
  discount_cents: 0,
  discount_percent: 0,
  requires_purchase: "",
  code: "",
  active: true,
  taxable_note: "Discount should reduce taxable receipt when applied before payment; verify treatment with accountant/Maine Revenue Services."
};

const emptyExpense: BusinessExpenseRecord = {
  expense_date: new Date().toISOString().slice(0, 10),
  vendor: "",
  category: "supplies",
  description: "",
  amount_cents: 0,
  payment_method: "",
  receipt_url: "",
  notes: ""
};

const defaultTax: MaineTaxSettings = {
  state: "ME",
  label: "Maine sales tax",
  sales_tax_rate: 0.055,
  local_tax_rate: 0,
  parts_taxable: true,
  labor_taxable: false,
  diagnostic_taxable: false,
  shop_supplies_taxable: true,
  tire_fees_note: "Track tire/disposal/environmental fees separately from sales tax when charged.",
  disclaimer: "Maine generally uses a 5.5% sales tax with no local sales tax. Auto parts and repair/installation services may be taxable; verify final filing treatment with Maine Revenue Services or a tax professional."
};

export function CouponTaxManager() {
  const [promotions, setPromotions] = useState<ManagedPromotionOffer[]>([]);
  const [draft, setDraft] = useState<ManagedPromotionOffer>(emptyPromotion);
  const [tax, setTax] = useState<MaineTaxSettings>(defaultTax);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const amountDollars = useMemo(() => (draft.discount_cents / 100).toFixed(2), [draft.discount_cents]);
  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      setBusy(true);
      const data = await listPromotionOffers();
      setPromotions(data.promotions);
      if (data.tax_settings) setTax(data.tax_settings);
      setStatus(`Loaded ${data.promotions.length} promotion offer${data.promotions.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    try {
      setBusy(true);
      const saved = await savePromotionOffer(draft, "");
      setDraft(saved);
      await refresh();
      setStatus(`Saved coupon/promo ${saved.title}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function archive(slug: string) {
    try {
      setBusy(true);
      await archivePromotionOffer(slug, "");
      await refresh();
      setStatus(`Archived ${slug}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function saveTax() {
    try {
      setBusy(true);
      const saved = await saveMaineTaxSettings(tax, "");
      setTax(saved);
      setStatus("Saved Maine tax settings.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function syncStripeCoupons() {
    try {
      setBusy(true);
      const synced = await syncAllPromotions("");
      setPromotions(synced);
      setStatus(`Synced ${synced.length} coupons into Stripe Coupons/Promotion Codes.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  }

  return (
    <section className="panel coupon-tax-manager-panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Coupons and sales tax</p>
          <h2>Your coupons and Maine sales tax setup</h2>
        </div>
        <BadgeDollarSign />
      </div>
      <p className="legal-note">Maine setup: 5.5% state sales tax, no local tax. Parts and shop supplies are taxed; labor listed separately on the bill is not. Your books and year-end exports are under Taxes &amp; books.</p>
      <div className="admin-token-row">
        <button className="secondary-button" disabled={busy} onClick={() => refresh()}><RefreshCcw size={15} /> Refresh promos</button>
        <button className="secondary-button" disabled={busy} onClick={syncStripeCoupons}><BadgePercent size={15} /> Sync Stripe coupons</button>
      </div>
      <div className="coupon-tax-grid">
        <div className="payment-manager-list">
          {promotions.map((promo) => (
            <article className={!promo.active ? "archived-plan" : ""} key={promo.slug}>
              <button onClick={() => setDraft({ ...promo })}><strong>{promo.title}</strong><span>{promo.code || promo.slug} - {promo.applies_to}</span></button>
              <small>{promo.summary}</small>
              <small>Stripe: {promo.stripe_promotion_code || "not synced yet"}</small>
              <button className="danger-link" onClick={() => archive(promo.slug)}><Trash2 size={14} /> archive</button>
            </article>
          ))}
        </div>
        <div className="payment-manager-form">
          <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></label>
          <label><span>Title</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
          <label><span>Code</span><input value={draft.code || ""} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })} /></label>
          <label><span>Offer type</span><select value={draft.offer_type} onChange={(event) => setDraft({ ...draft, offer_type: event.target.value as ManagedPromotionOffer["offer_type"] })}><option value="free_service">free service</option><option value="discount_amount">dollar discount</option><option value="discount_percent">percent discount</option><option value="bundle_bonus">bundle bonus</option><option value="manual_review">manual review</option></select></label>
          <label><span>Applies to</span><input value={draft.applies_to} onChange={(event) => setDraft({ ...draft, applies_to: event.target.value })} /></label>
          <label><span>Dollar discount</span><input type="number" step="0.01" min="0" value={amountDollars} onChange={(event) => setDraft({ ...draft, discount_cents: Math.round(Number(event.target.value || 0) * 100) })} /></label>
          <label><span>Percent discount</span><input type="number" step="1" min="0" max="100" value={draft.discount_percent} onChange={(event) => setDraft({ ...draft, discount_percent: Number(event.target.value || 0) })} /></label>
          <label><span>Purchase requirement</span><input value={draft.requires_purchase} onChange={(event) => setDraft({ ...draft, requires_purchase: event.target.value })} /></label>
          <label><span>Summary</span><textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
          <label><span>Tax note</span><textarea value={draft.taxable_note} onChange={(event) => setDraft({ ...draft, taxable_note: event.target.value })} /></label>
          <label className="toggle-row"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /><span>Active/customer-visible</span></label>
          <button className="primary-button" disabled={busy} onClick={saveDraft}><BadgePercent size={15} /> Save coupon/promo</button>
        </div>
      </div>
      <div className="tax-year-grid">
        <div className="payment-manager-form">
          <h3>Maine tax setup</h3>
          <label><span>Sales tax rate</span><input type="number" step="0.0001" value={tax.sales_tax_rate} onChange={(event) => setTax({ ...tax, sales_tax_rate: Number(event.target.value || 0) })} /></label>
          <label><span>Local tax rate</span><input type="number" step="0.0001" value={tax.local_tax_rate} onChange={(event) => setTax({ ...tax, local_tax_rate: Number(event.target.value || 0) })} /></label>
          {(["parts_taxable", "labor_taxable", "diagnostic_taxable", "shop_supplies_taxable"] as const).map((key) => <label className="toggle-row" key={key}><input type="checkbox" checked={Boolean(tax[key])} onChange={(event) => setTax({ ...tax, [key]: event.target.checked })} /><span>{key.replaceAll("_", " ")}</span></label>)}
          <label><span>Tire/fee note</span><textarea value={tax.tire_fees_note} onChange={(event) => setTax({ ...tax, tire_fees_note: event.target.value })} /></label>
          <button className="primary-button" disabled={busy} onClick={saveTax}><Save size={15} /> Save Maine tax settings</button>
        </div>
      </div>
      {status ? <p className="legal-note">{status}</p> : null}
    </section>
  );
}
