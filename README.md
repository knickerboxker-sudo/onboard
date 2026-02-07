# sortir

A calm, pull-based internal team feed and Q&A board for small businesses (5–20 people). No real-time chat, no push notifications. Check it when you want.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (file-based, stored on Railway volume at `/data`)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Credentials provider)
- **Validation**: Zod
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd onboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root:
   ```env
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   BILLING_ENABLED="false"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database** (optional, for demo data)
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```

7. **Open** [http://localhost:3000](http://localhost:3000)

### Demo Credentials (after seeding)

| Role   | Email            | Password      |
|--------|------------------|---------------|
| Owner  | owner@demo.com   | password123   |
| Member | member@demo.com  | password123   |

Workspace slug: `acme-inc` · Access code: `12345`

## Project Structure

```
├── app/
│   ├── api/              # API route handlers
│   │   ├── auth/         # NextAuth
│   │   ├── signup/       # User + workspace creation
│   │   ├── join/         # Join workspace via access code
│   │   ├── posts/        # CRUD for posts
│   │   ├── comments/     # CRUD for comments
│   │   ├── search/       # Search posts & comments
│   │   ├── workspace/    # Workspace settings (owner only)
│   │   └── workspaces/   # List user workspaces
│   ├── app/[workspaceSlug]/  # Protected workspace routes
│   │   ├── feed/         # Main feed
│   │   ├── post/[postId]/ # Post detail + comments
│   │   ├── search/       # Search UI
│   │   └── settings/     # Owner settings
│   ├── login/            # Login page
│   ├── signup/           # Signup + create workspace
│   ├── join/             # Join workspace page
│   └── page.tsx          # Landing page
├── components/           # React components
├── lib/                  # Shared utilities
│   ├── auth-options.ts   # NextAuth configuration
│   ├── session.ts        # Server session helpers
│   ├── access.ts         # Workspace membership checks
│   ├── db.ts             # Prisma client singleton
│   ├── cn.ts             # Classname utility
│   └── rate-limit.ts     # Simple rate limiter
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── types/                # TypeScript declarations
```

## Key Features

- **Feed**: Create posts (with optional title), mark as update or question, toggle anonymous posting
- **Comments**: Reply to posts with anonymous toggle
- **Search**: Keyword search across post titles, bodies, and comments with highlighting
- **Settings**: Owner can rotate access code, rename workspace, view members
- **Anonymous posting**: Anonymous posts/comments never leak author identity in API responses
- **Multi-tenancy**: All queries scoped by workspace; URL guessing blocked
- **Rate limiting**: Server-side throttle on post/comment creation

## Deployment (Railway)

1. Create a volume in your Railway service mounted at `/data` (this stores the SQLite database)
2. Set environment variables:
   - `DATABASE_URL` = `file:/data/sortir.db`
   - `AUTH_SECRET` (generate a random string)
   - `NEXTAUTH_URL` (your Railway app URL)
   - `BILLING_ENABLED` (`false` for now)
3. Deploy — the `postinstall` script runs `prisma generate` automatically
4. Run `npx prisma migrate deploy` via Railway CLI or console to create tables

## Billing (Stub)

Billing is stubbed behind the `BILLING_ENABLED` environment variable. When set to `"true"`, the app can integrate Stripe subscription for workspace owners. The code is structured so Stripe can be added later without refactoring.

## Next Steps (v2)

- Email digest notifications (opt-in, weekly summary)
- Tags / categories for posts
- Moderation tools (pin, archive, delete)
- File/image attachments
- Moderator role
- Stripe billing integration
- Magic link authentication
- Workspace-level search (SQLite LIKE, case-insensitive for ASCII)
- Mobile app / PWA
