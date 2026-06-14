# Ibby Auto Works integrations

## Current production-safe split

- GitHub Pages: static Next.js frontend only.
- Supabase browser key: account signup/login and customer-owned records.
- Supabase Postgres: profiles, customer records, work orders, appointment blocks, business settings, email queue.
- Google OAuth token: stored server-side in Ibby profile custody on The Garden for now.
- Future Vercel or Supabase Edge Functions: private Gmail/Calendar automation runtime.

## Supabase usage guardrail

Keep Supabase lean:

- Store structured rows: profiles, requests, appointment blocks, email queue metadata.
- Avoid storing photos/videos/log dumps in Supabase until there is a reason.
- Prefer Google Drive, object storage, or a data-only Oracle VM for heavy files, telemetry archives, generated PDFs, and long-term logs.

## Google automation events

The app queues `email_events` rows after signed-in work-order submission. A server-side worker/function should process events:

- `signup_welcome`
- `appointment_requested`
- `appointment_confirmed`
- `service_completed`
- `due_again_reminder`

Required server-only env values:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

Never expose those in GitHub Pages/browser code.


## Stripe checkout direction

Stripe is now the preferred payment integration for testing and likely production. Current mock/test credentials live only in the Ibby private environment custody on The Garden and must be replaced before production.

Static GitHub Pages cannot safely create Stripe Checkout Sessions because secret/restricted keys must never be exposed to browser code. The production-safe pattern is:

1. Browser submits an approved work order/payment intent request.
2. Supabase Edge Function or Vercel API route validates the order and customer.
3. Server uses the Stripe secret/restricted key to create Checkout Session, invoice, subscription, or payment link.
4. Stripe webhook writes payment status back to Supabase.
5. App shows paid/deposit/payment-plan status from Supabase.

Planned payment options:

- Stripe cards / Link / Apple Pay / Google Pay where supported.
- ACH transfer for larger jobs, parts, tires, or payment plans.
- Cash at service as a manual status.
- PayPal as optional/toggleable future provider.
- Square as optional future card-reader or invoice provider.
- Patreon kept disabled/optional for now.

Planned payment products/packages:

- Service split-pay: deposit plus staged balance payments.
- Parts Ease Plan: parts deposit before ordering and balance before install.
- Tire Flex Plan: tire hold/order deposit and staged tire payment.
- Roadside Assist Plan: future local roadside service package.
- Multi-job bundle: package multiple approved jobs with staged payments.
