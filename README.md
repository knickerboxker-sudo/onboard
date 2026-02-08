# sortir

Unified recall search engine across vehicles (NHTSA), consumer products (CPSC), food (USDA FSIS + FDA), drugs (FDA), medical devices (FDA), environmental (EPA), and marine products (USCG).

## Tech Stack

- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS, Lucide React icons
- **Backend**: Next.js Route Handlers with Server-Sent Events for streaming search
- **Architecture**: Stateless API aggregation - no database, real-time fetching from government APIs
- **Email**: Nodemailer for feedback system
- **Validation**: Zod for input validation and environment variable checking
- **Rate Limiting**: In-memory rate limiting for API endpoints

## Local Development

### Prerequisites

- Node.js >= 20
- SMTP credentials for email (Gmail, SendGrid, or similar)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your SMTP credentials

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `FEEDBACK_EMAIL` | Email address to receive feedback submissions | Yes |
| `SMTP_HOST` | SMTP server host (e.g., smtp.gmail.com) | Yes |
| `SMTP_PORT` | SMTP server port (usually 587 or 465) | Yes |
| `SMTP_USER` | SMTP authentication username | Yes |
| `SMTP_PASS` | SMTP authentication password | Yes |
| `SMTP_FROM` | Email address to send from | Yes |
| `NODE_ENV` | Environment (development, production, test) | No |
| `SENTRY_DSN` | Sentry error tracking DSN (optional) | No |

## Railway Deployment

1. Create a Railway project
2. Set environment variables (see table above)
3. Deploy - no database setup needed!

**Important**: This app is stateless and does NOT require a database. The Railway filesystem is ephemeral, so all data is fetched in real-time from government APIs.

## App Routes

### Public

- `/` - Home search landing page
- `/search?q=...` - Search results with filters and streaming support
- `/event/[id]` - Recall event detail page
- `/about` - About page with data source info
- `/feedback` - Feedback submission form

### API

- `GET /api/search?q=...&category=...&source=...&dateRange=...` - Traditional search endpoint
- `GET /api/search/stream?q=...&category=...&source=...&dateRange=...` - Streaming search with live progress
- `POST /api/feedback` - Submit feedback (rate limited: 3 per hour per IP)

#### Rate Limits

- Search endpoints: 10 requests per minute per IP
- Feedback endpoint: 3 submissions per hour per IP

## Data Sources

The app fetches data in real-time from these government APIs:

- **CPSC**: Consumer product recalls via SaferProducts.gov API
- **NHTSA**: Vehicle recalls via NHTSA Recalls API
- **USDA FSIS**: Food safety recalls via FSIS API v1
- **FDA**: Drug, device, and food enforcement via openFDA API
- **EPA**: Environmental enforcement via ECHO API
- **USCG**: Marine product recalls (proxied via CPSC with marine keywords)

### How It Works

1. User submits a search query
2. Server initiates parallel requests to all 6 government APIs
3. Results stream back in real-time as each API responds
4. Results are filtered, normalized, and sorted client-side
5. Cache stores results for 30 minutes to reduce API load

### API Notes

- **Default freshness window**: API fetchers request the most recent 2 years by default. Use `dateRange=all` for full historical data.
- **CPSC**: Supports date filtering; results sorted client-side
- **NHTSA**: No date filtering; fetches default vehicle makes
- **USDA FSIS**: API v1 supports server-side filtering and sorting
- **FDA**: openFDA supports date range queries and sorting
- **EPA**: ECHO API supports keyword search and date filtering
- **USCG**: Filtered from CPSC data using marine-related keywords

### Cache & Refresh

- Search responses cached for 30 minutes (in-memory only)
- Use `refresh=1` parameter to bypass cache
- Cache is wiped on server restart (stateless architecture)

## Streaming Search

The app features real-time streaming search results:

- Shows live progress as each government API responds
- Displays result count and response time per source
- Gracefully handles API failures (shows warnings but doesn't block)
- Results appear progressively as they arrive
- User can see which sources are still loading vs. complete

## Security Features

- Input validation with Zod schemas
- Rate limiting on all API endpoints
- Prohibited content filtering for searches and feedback
- Sanitization to prevent injection attacks
- No exposure of internal errors to users
- Proper error logging with timestamps

## Disclaimer

sortir aggregates publicly available recall data from U.S. government agencies. It is not affiliated with any government agency. Data is provided for informational purposes only. Always verify recall information with the original issuing agency.
