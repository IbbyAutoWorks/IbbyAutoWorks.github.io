"use client";

import { useEffect, useState } from "react";
import { CreditCard, Landmark, WalletCards } from "lucide-react";

import { defaultPaymentPlans, defaultPaymentSettings, enabledPaymentLabels, PAYMENT_SETTINGS_EVENT, readPaymentSettings, type PaymentSettings } from "@/lib/app-settings";

export function CustomerPaymentOptions({ estimate }: { estimate?: string }) {
  const [settings, setSettings] = useState<PaymentSettings>(defaultPaymentSettings);

  useEffect(() => {
    function sync() { setSettings(readPaymentSettings()); }
    sync();
    window.addEventListener(PAYMENT_SETTINGS_EVENT, sync as EventListener);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PAYMENT_SETTINGS_EVENT, sync as EventListener);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const paymentLabels = enabledPaymentLabels(settings);

  return (
    <div className="panel payment-options-panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Checkout and payment help</p>
          <h2>Choose how payment should be handled after admin approval.</h2>
        </div>
        <WalletCards />
      </div>
      <p className="legal-note">Estimate shown: {estimate ?? "pending"}. These options prepare the work order for checkout; real Stripe payment links will be created server-side after the estimate, parts, tires, and schedule are approved.</p>
      <div className="payment-method-pill-grid">
        {paymentLabels.map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className="payment-plan-preview-grid compact-payment-plans">
        {defaultPaymentPlans.map((plan) => (
          <div className="payment-plan-card" key={plan.id}>
            <span>{plan.category}</span>
            <strong>{plan.title}</strong>
            <p>{plan.summary}</p>
          </div>
        ))}
      </div>
      <div className="payment-boundary-note"><CreditCard size={16} /> Stripe, Apple Pay, Google Pay, ACH, and cards will run through a secure server checkout endpoint. <Landmark size={16} /> Cash/Square/PayPal stay toggleable manual or future-provider options.</div>
    </div>
  );
}
