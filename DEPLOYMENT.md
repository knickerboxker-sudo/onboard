# Sortir — Deployment Guide

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10
- Supabase account with project created
- Stripe account (for payments)
- Resend account (for transactional emails)

## Environment Setup

1. Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

2. Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
   - `STRIPE_SECRET_KEY` — Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
   - `RESEND_API_KEY` — Resend API key for emails

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

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Health endpoint returning 200
- [ ] Privacy policy content reviewed by attorney
- [ ] Terms of service content reviewed by attorney
- [ ] Success stories replaced with real testimonials
- [ ] Supabase Storage configured for image uploads
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Stripe webhook endpoints configured
