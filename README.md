# IbbyAutoWorks.github.io

Ibby Auto Works™ customer portal and admin/service prototype.

## Stack

- Next.js 15
- React 19
- TypeScript
- Static export for GitHub Pages

## Development

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

Local dev defaults to port `4200`.

## GitHub Pages

This repository deploys through `.github/workflows/pages.yml`. The workflow runs typecheck/build and uploads the static export from `next-live/`.

## Secrets

Do not commit real credentials. Keep `.env.example` placeholder-only and store live values in approved secret stores.
