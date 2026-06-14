# Ibby continuation checkpoint

Paused after commit `3bd6907` where Supabase account sync and the Google automation scaffold were deployed.

Return point after this footer/settings pass:
1. Implement real Google Gmail/Calendar handlers.
2. Deploy the server-side worker/API on Supabase Edge Functions or Vercel.
3. Run signup/request flow.
4. Verify Supabase `work_orders` + `email_events` rows.
5. Verify email/calendar side effects only after explicit test approval.

Current UX pass:
- Portal-specific footer links.
- Version/build display.
- Service settings route.
- Admin payment toggles/placeholders.
- Settings cog routes by portal.
