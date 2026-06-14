"use client";

import { useEffect, useState } from "react";
import { CreditCard, Save } from "lucide-react";

import { defaultPaymentSettings, readPaymentSettings, savePaymentSettings, type PaymentSettings } from "@/lib/app-settings";

const toggles: Array<[keyof PaymentSettings, string]> = [
  ["paypalEnabled", "Show PayPal checkout"],
  ["patreonEnabled", "Show Patreon membership/plan option"],
  ["cardEnabled", "Show card/manual invoice option"],
  ["cashEnabled", "Show cash/on-site option"]
];

const labels: Array<[keyof PaymentSettings, string]> = [
  ["paypalLabel", "PayPal label"],
  ["patreonLabel", "Patreon label"],
  ["paymentPlanLabel", "General payment plan"],
  ["roadsidePlanLabel", "Roadside plan"],
  ["partsPlanLabel", "Parts plan"],
  ["tiresPlanLabel", "Tires plan"]
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
      <summary><span><CreditCard size={16} /> Payment and plan options</span><CreditCard size={16} /></summary>
      <p className="legal-note">Toggle what customers see at checkout. Patreon and PayPal stay hidden until enabled and connected to real account links/API credentials.</p>
      <div className="settings-fields">
        {toggles.map(([key, label]) => (
          <label className="toggle-row" key={key}>
            <input type="checkbox" checked={Boolean(settings[key])} onChange={(event) => update(key, event.target.checked as PaymentSettings[typeof key])} />
            <span>{label}</span>
          </label>
        ))}
        {labels.map(([key, label]) => (
          <label key={key}><span>{label}</span><input value={String(settings[key])} onChange={(event) => update(key, event.target.value as PaymentSettings[typeof key])} /></label>
        ))}
      </div>
      <button className="primary-button" onClick={save}><Save size={16} /> Save payment settings</button>
      {saved ? <p className="legal-note">Payment display settings saved in this browser prototype.</p> : null}
    </details>
  );
}
