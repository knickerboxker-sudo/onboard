# sortir

Unified recall search engine across vehicles (NHTSA), consumer products (CPSC), food (USDA FSIS + FDA), drugs (FDA), and medical devices (FDA).

## Tech Stack

- **Frontend**: Next.js App Router, React, TypeScript, Tailwind CSS, Lucide React icons
- **Backend**: Next.js Route Handlers, Prisma ORM, Postgres Full Text Search
- **Database**: PostgreSQL (Railway-compatible)
- **Search**: Postgres tsvector + GIN index for full-text search

## Local Development

### Prerequisites

- Node.js >= 20
- PostgreSQL running locally (or use Docker)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run database migrations
npx prisma migrate deploy

# Seed demo data (optional, if ingestion is unavailable locally)
node scripts/seed.js

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_NAME` | App name (default: sortir) |

## Railway Deployment

1. Create a Railway project
2. Add a Postgres plugin - copy the `DATABASE_URL`
3. Set environment variables:
   - `DATABASE_URL` (from Railway Postgres)
   - `NEXT_PUBLIC_APP_NAME=sortir`
4. Deploy - migrations run automatically on start
5. Add a Railway Cron service to call:
   ```
   GET https://your-app.railway.app/api/jobs/run?trigger=cron
   ```
   Schedule: every 6 hours (`0 */6 * * *`)

## App Routes

### Public

- `/` - Home search landing page
- `/search?q=...` - Search results with filters
- `/event/[id]` - Recall event detail page
- `/company/[slug]` - Company recall profile
- `/brand/[slug]` - Brand recall history
- `/about` - About page with data source info

### Admin

- `/admin` - Dashboard
- `/admin/jobs` - Ingestion job management
- `/admin/raw` - Raw record inspector
- `/admin/events` - Normalized events list
- `/admin/entities` - Entity alias management

### API

- `GET /api/search?q=...&category=...&source=...&page=...` - Search
- `GET /api/events/[id]` - Event details
- `GET /api/company/[slug]` - Company profile
- `GET /api/jobs/run` - Trigger ingestion
- `GET /api/jobs/status` - Job status

## Data Sources

- **CPSC**: Consumer product recalls via SaferProducts.gov API
- **NHTSA**: Vehicle recalls via NHTSA Recalls API
- **USDA FSIS**: Food safety recalls via FSIS data feed
- **FDA**: Drug, device, and food enforcement via openFDA API

### API Notes

- **Default freshness window**: API fetchers request (or filter to) the most recent 2 years by default to prioritize current safety information. Use `dateRange=all` when you need a full historical pull.
- **CPSC**: Supports `RecallDateStart` for date filtering but does not document a reliable server-side sort, so results are sorted client-side.
- **NHTSA**: `recallsByVehicle` does not expose date filtering or sorting. We fetch a default set of popular makes when there is no query and filter client-side.
- **USDA FSIS**: Published as a static JSON feed without date parameters; filtering and sorting are done client-side.
- **FDA**: openFDA enforcement supports `report_date` range queries and sorting (e.g., `sort=report_date:desc`).

### Cache & Refresh

- Search responses are cached for 30 minutes because recall data changes relatively slowly.
- Use `GET /api/search?refresh=1` to bypass the cache and force a fresh pull.

## Ingestion

Ingestion is modular. Each source implements:
- `fetchSource()` - fetch upstream data
- `mapToNormalizedEvents()` - transform to unified format
- `upsertRaw()` - idempotent raw record storage
- `upsertNormalized()` - idempotent normalized event creation

Run ingestion manually via admin UI or via API:
```bash
curl "http://localhost:3000/api/jobs/run"
```

## Disclaimer

sortir aggregates publicly available recall data from U.S. government agencies. It is not affiliated with any government agency. Data is provided for informational purposes only. Always verify recall information with the original issuing agency.
