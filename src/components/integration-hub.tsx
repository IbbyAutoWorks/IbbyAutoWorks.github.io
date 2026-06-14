import { ExternalLink, KeyRound, Link2 } from "lucide-react";

const links = [
  { label: "Stripe Dashboard", href: "https://dashboard.stripe.com/dashboard", note: "payments, account status" },
  { label: "Stripe Products", href: "https://dashboard.stripe.com/products", note: "products, prices, subscriptions" },
  { label: "Stripe Payment Links", href: "https://dashboard.stripe.com/payment-links", note: "hosted checkout links" },
  { label: "Stripe Developers", href: "https://dashboard.stripe.com/developers", note: "API keys, webhooks, events" },
  { label: "Supabase Project", href: "https://supabase.com/dashboard/project/cqdlqdzmnylywctlsklp", note: "database, auth, edge functions" },
  { label: "Supabase Tables", href: "https://supabase.com/dashboard/project/cqdlqdzmnylywctlsklp/editor", note: "records and payment plans" },
  { label: "Google Drive", href: "https://drive.google.com/drive/my-drive", note: "shared files, customer docs" },
  { label: "Google Cloud Console", href: "https://console.cloud.google.com/apis/credentials", note: "OAuth credentials" },
  { label: "PayPal Dashboard", href: "https://www.paypal.com/mep/dashboard", note: "PayPal settings" },
  { label: "Square Dashboard", href: "https://squareup.com/dashboard", note: "Square reader/invoices" }
];

export function IntegrationHub() {
  return (
    <section className="panel integration-hub-panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Integration hub</p>
          <h2>Quick links for credentials, provider settings, products, and dashboards.</h2>
        </div>
        <Link2 />
      </div>
      <p className="legal-note"><KeyRound size={14} /> Provider secrets still live in each provider dashboard and private server env. Update credentials there, then save app-facing settings here when labels or payment plan structure changes.</p>
      <div className="integration-link-grid">
        {links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            <strong>{link.label}</strong>
            <span>{link.note}</span>
            <ExternalLink size={15} />
          </a>
        ))}
      </div>
    </section>
  );
}
