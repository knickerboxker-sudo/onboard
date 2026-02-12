# Edgar Per Employee

A production-ready web app that turns SEC EDGAR filings into simple, shareable company pages.

**"If this company didn't spend $X on buybacks/dividends, that's $Y per employee."**

## Features

- Search companies by ticker or name
- View buybacks, dividends, and per-employee metrics from SEC filings
- Trailing 12-month (TTM) summaries
- Full transparency: every number links to the source SEC filing
- No database required — file-based caching in dev, in-memory LRU in production

## Getting Started

### Prerequisites

- Node.js >= 20.0.0

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SEC_USER_AGENT` | Yes | `edgar-per-employee/1.0 (contact: dev@example.com)` | User-Agent header for SEC requests. Must include contact email per SEC policy. |
| `CACHE_TTL_SECONDS` | No | `86400` | Default cache TTL in seconds |
| `NEXT_PUBLIC_SITE_URL` | No | — | Public URL for the site |

### Setup

```bash
npm install

# Create .env file
echo 'SEC_USER_AGENT="edgar-per-employee/1.0 (contact: you@example.com)"' > .env

# Development
npm run dev

# Production build
npm run build
npm start
```

### Testing

```bash
npm test           # Run tests once
npm run test:watch # Watch mode
```

## Architecture

### Cache Design

- **Development**: `FileCache` writes JSON to `./data/cache` with SHA-256 hashed filenames
- **Production**: `MemoryCache` uses an LRU map (500 entries max) with TTL per entry
- Auto-selects backend based on `NODE_ENV`

### SEC Client

- Throttled requests (token bucket, ~8 req/s)
- Exponential backoff with jitter on 429/5xx responses
- Descriptive User-Agent header per SEC requirements
- Response caching via custom cache + Next.js fetch revalidation

### Data Flow

1. Search → SEC `company_tickers.json` → in-memory index
2. Company → SEC `submissions/CIK.json` → company info + filings list
3. Metrics → SEC `companyfacts/CIK.json` → XBRL tag extraction → per-employee calculations
4. Employee count → XBRL first, then text extraction from 10-K filing HTML as fallback

## SEC Policy

This app respects SEC EDGAR access policies:
- Descriptive User-Agent header with contact email
- Request throttling to stay within rate limits
- Response caching to minimize redundant requests
- No scraping of non-SEC websites

## License

MIT
