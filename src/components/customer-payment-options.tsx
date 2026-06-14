"use client";

import { useEffect, useState } from "react";
import { CreditCard, Landmark, WalletCards } from "lucide-react";

import { defaultPaymentPlans, defaultPaymentSettings, enabledPaymentLabels, PAYMENT_SETTINGS_EVENT, readPaymentSettings, type PaymentSettings } from "@/lib/app-settings";
import { listPaymentPlans, openCheckoutForPlan, type ManagedPaymentPlan } from "@/lib/payment-backend";

export function CustomerPaymentOptions({ estimate }: { estimate?: string }) {
  const [settings, setSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [livePlans, setLivePlans] = useState<ManagedPaymentPlan[]>([]);
  const [paymentStatus, setPaymentStatus] = useState("");

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

  useEffect(() => {
    listPaymentPlans().then(setLivePlans).catch(() => setLivePlans([]));
  }, []);

  async function startCheckout(slug: string) {
    try {
      setPaymentStatus("Opening Stripe checkout...");
      await openCheckoutForPlan(slug);
      setPaymentStatus("Stripe checkout opened in a new tab.");
    } catch (error) {
      setPaymentStatus(error instanceof Error ? error.message : String(error));
    }
  }

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
        {(livePlans.length ? livePlans : defaultPaymentPlans).map((plan) => {
          const slug = "slug" in plan ? plan.slug : plan.id;
          const amount = "amount_cents" in plan ? `$${(plan.amount_cents / 100).toFixed(2)}${plan.mode === "subscription" ? "/mo" : ""}` : null;
          return (
            <div className="payment-plan-card" key={slug}>
              <span>{plan.category}</span>
              <strong>{plan.title}</strong>
              <p>{plan.summary}</p>
              {amount ? <small>{amount}</small> : null}
              {"stripe_payment_link_url" in plan ? <button className="secondary-button" onClick={() => startCheckout(slug)}>Open Stripe checkout</button> : null}
            </div>
          );
        })}
      </div>
      {paymentStatus ? <p className="legal-note">{paymentStatus}</p> : null}
      <div className="payment-boundary-note"><CreditCard size={16} /> Stripe, Apple Pay, Google Pay, ACH, and cards will run through a secure server checkout endpoint. <Landmark size={16} /> Cash/Square/PayPal stay toggleable manual or future-provider options.</div>
    </div>
  );
}
