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
