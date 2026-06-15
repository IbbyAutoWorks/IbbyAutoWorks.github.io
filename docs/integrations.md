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


## Admin integration hub and plan manager

The admin settings page includes an Integration Hub with quick links to Stripe, Supabase, Google Drive, Google Cloud, PayPal, and Square dashboards. It also includes a Stripe/Supabase payment-plan manager.

Plan-manager security model for the static app:

- Browser reads active plans from Supabase through the `ibby-payments` Edge Function.
- Admin writes require the private `IBBY_ADMIN_API_TOKEN`, pasted into the admin portal and stored only in browser session storage.
- The Edge Function uses server-only Stripe and Supabase keys to create/update Stripe products, prices, and payment links.
- “Delete” in the UI archives/deactivates plans instead of hard-deleting Stripe objects.

Production upgrade path:

- Replace the temporary admin token with Supabase Auth role checks.
- Add Stripe webhook signing secret and verify `checkout.session.completed`, `payment_intent.succeeded`, `invoice.paid`, and subscription lifecycle events.
- Link paid/deposit status back to work orders and customer records.


## Coupons, Maine tax defaults, and year-end records

The admin settings page now includes a coupon/tax manager seeded with:

- Free pre-inspection (`PRECHECK`)
- Free diagnostic with approved repair (`DIAGFREE`)
- Discounted oil change (`OIL15`)
- Free tire rotation with full tire set purchase (`ROTATEFREE`)
- First-time customer credit (`WELCOME10`)
- Roadside member priority check (`ROADREADY`)
- Multi-job bundle saver (`BUNDLE10`)

Maine operating tax defaults:

- State sales tax: 5.5%
- Local sales tax: 0%
- Parts, repair/install labor, diagnostics, and shop supplies default to taxable for quoting/tracking.
- Tire/disposal/environmental fees should be tracked separately when charged.

Year-end tracking model:

- `payment_events` records Stripe/payment income events.
- `business_expense_records` stores expenses by date, vendor, category, amount, method, receipt URL, and notes.
- The Edge Function can return a simple year-end income/expense/net summary grouped by expense category.

This is an operating default and bookkeeping aid, not tax/legal advice. Confirm final filing treatment with Maine Revenue Services or an accountant before production/live filings.


## Admin credential and secret locations

Current admin sign-in is a Supabase Auth user:

- Username accepted by the app: `IbbyAdmin`
- Auth email stored in Supabase: `ibbyadmin@ibbyautoworks.local`
- Password is stored only in Supabase Auth's password system, not plaintext in the repository.

Local/private operational secrets remain outside git:

- Garden profile env: `/home/ubuntu/.hermes/profiles/ibby/.env`
- NukeBox app local env: `C:\Users\CAK3D\IbbyAuto-next-web-run\.env.local`
- Supabase Edge Function secrets: Supabase dashboard project `cqdlqdzmnylywctlsklp` → Edge Functions/Secrets

Customers can create/sign into normal Supabase accounts. The app hides Admin, Service, and Settings navigation from non-admin sessions, and admin/service pages require the IbbyAdmin session client-side.

## Stripe coupon sync

Promotion offers are stored/editable in Supabase and can be synced into Stripe as Coupons + Promotion Codes. Checkout sessions/payment links allow promotion codes so Stripe-hosted checkout can apply the codes (`PRECHECK`, `DIAGFREE`, `OIL15`, `ROTATEFREE`, etc.).
