# Sortir — Deployment Guide

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10
- Supabase account with project created
- Resend account (for transactional emails)
- Upstash Redis account (for rate limiting)

## Environment Setup

1. Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

2. Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
   - `RESEND_API_KEY` — Resend API key for emails
   - `UPSTASH_REDIS_REST_URL` — Upstash Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST token

3. Optional environment variables:
   - `NEXT_PUBLIC_APP_URL` — Production URL (used for canonical links, OG metadata, email links)
   - `GOOGLE_PLACES_API_KEY` — Google Places API key for location autocomplete

> **Note:** Stripe integration coming soon — not required for current launch.

## Database Setup

1. Run the Supabase migrations in order from `supabase/migrations/`:

```bash
npx supabase db push
```

2. Optionally seed development data:

```bash
npx supabase db reset
```

## Build & Deploy

```bash
npm install
npm run build
npm start
```

## Health Check

Once deployed, verify the app is running:

```bash
curl https://your-domain.com/api/health
```

Expected response: `{"status":"ok","timestamp":"...","version":"0.1.0"}`

## Pre-Launch Checklist

### Infrastructure
- [ ] All environment variables configured (see .env.example)
- [ ] Database migrations applied via `npx supabase db push`
- [ ] Health endpoint returning 200: `curl https://your-domain.com/api/health`
- [ ] Custom domain configured with SSL certificate active
- [ ] Supabase Storage bucket created and configured for business logo uploads

### Content
- [ ] Real success story testimonials added (or successStories array left empty for launch)
- [ ] Privacy Policy reviewed by attorney
- [ ] Terms of Service reviewed by attorney
- [ ] Contact email (hello@sortir.app) inbox monitored and responding

### SEO & Social
- [ ] NEXT_PUBLIC_APP_URL set to production domain
- [ ] OG image (1200×630) verified by pasting URL into https://cards-dev.twitter.com/validator
- [ ] Sitemap accessible at /sitemap.xml
- [ ] robots.txt accessible at /robots.txt and not blocking crawlers in production

### Security
- [ ] Supabase Row Level Security (RLS) enabled on all tables
- [ ] SUPABASE_SERVICE_ROLE_KEY NOT exposed in client-side code
- [ ] Rate limiting tested on API routes
- [ ] CSP headers verified with https://securityheaders.com

### Monitoring
- [ ] Error tracking configured (Sentry or similar)
- [ ] Uptime monitoring configured
- [ ] Email deliverability tested (send test email via Resend dashboard)
