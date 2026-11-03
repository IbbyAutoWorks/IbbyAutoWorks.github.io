"use client";

import { useEffect, useState } from "react";
import { CreditCard, Save } from "lucide-react";

import { defaultPaymentPlans, defaultPaymentSettings, readPaymentSettings, savePaymentSettings, type PaymentSettings } from "@/lib/app-settings";

const toggles: Array<[keyof PaymentSettings, string, string]> = [
  ["stripeEnabled", "Show Stripe checkout", "Customers pay by card through Stripe."],
  ["appleGooglePayEnabled", "Show Apple Pay / Google Pay", "Runs through Stripe at card checkout."],
  ["achEnabled", "Show ACH bank transfer", "Useful for larger jobs, parts, tires, and payment plans."],
  ["paypalEnabled", "Show PayPal checkout", "Keep optional for customers who prefer PayPal."],
  ["squareEnabled", "Show Square", "Shows Square as a choice. You collect it yourself with a Square reader or invoice."],
  ["cashEnabled", "Show cash/on-site", "Manual collection option for approved jobs."],
  ["patreonEnabled", "Show Patreon membership/plan option", "Off by default."]
];

const labels: Array<[keyof PaymentSettings, string]> = [
  ["stripeLabel", "Stripe label"],
  ["appleGooglePayLabel", "Apple/Google Pay label"],
  ["achLabel", "ACH label"],
  ["paypalLabel", "PayPal label"],
  ["squareLabel", "Square label"],
  ["cashLabel", "Cash label"],
  ["patreonLabel", "Patreon label"],
  ["paymentPlanLabel", "General payment plan"],
  ["roadsidePlanLabel", "Roadside plan"],
  ["partsPlanLabel", "Parts plan"],
  ["tiresPlanLabel", "Tires plan"],
  ["jobBundleLabel", "Multi-job package"]
];

export function PaymentSettingsPanel() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setSettings(readPaymentSettings()), []);

  function update<K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function save() {
    savePaymentSettings(settings);
    setSaved(true);
  }

  return (
    <details className="panel settings-accordion" open>
      <summary><span><CreditCard size={16} /> Payment methods, plans, and packages</span><CreditCard size={16} /></summary>
      <p className="legal-note">These are the ways of paying that customers see.</p>
      <div className="settings-fields payment-method-grid">
        {toggles.map(([key, label, note]) => (
          <label className="toggle-row payment-toggle-row" key={key}>
            <input type="checkbox" checked={Boolean(settings[key])} onChange={(event) => update(key, event.target.checked as PaymentSettings[typeof key])} />
            <span><strong>{label}</strong><small>{note}</small></span>
          </label>
        ))}
        {labels.map(([key, label]) => (
          <label key={key}><span>{label}</span><input value={String(settings[key])} onChange={(event) => update(key, event.target.value as PaymentSettings[typeof key])} /></label>
        ))}
      </div>
      <div className="payment-plan-preview-grid">
        {defaultPaymentPlans.map((plan) => (
          <div className="payment-plan-card" key={plan.id}>
            <span>{plan.category}</span>
            <strong>{plan.title}</strong>
            <p>{plan.summary}</p>
            <small>{plan.deposit} - {plan.terms}</small>
          </div>
        ))}
      </div>
      <button className="primary-button" onClick={save}><Save size={16} /> Save payment settings</button>
      {saved ? <p className="legal-note">Saved.</p> : null}
    </details>
  );
}
