# OnboardAI

OnboardAI is a mobile-first job ramp coach that captures everything you type or record, stores long-term memory, and lets you ask questions later with fast semantic search. It runs on Next.js + Prisma + SQLite and uses Cohere for chat and embeddings.

## Local setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

## Environment variables

```
COHERE_API_KEY=
DATABASE_URL=file:./dev.db
AUTH_SECRET=your-long-secret
NEXT_PUBLIC_APP_NAME=OnboardAI
AUDIO_DIR=/data/audio
```

## Prisma + SQLite

```bash
npx prisma migrate dev --name init
```

## Railway deployment

1. Create a new Railway project and connect this GitHub repo.
2. Add a persistent volume mounted at `/data`.
3. Set environment variables:
   - `DATABASE_URL=file:/data/sqlite.db`
   - `AUDIO_DIR=/data/audio`
   - `COHERE_API_KEY`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_NAME`
4. Run migrations in Railway with:
   ```bash
   npx prisma migrate deploy
   ```

`railway.json` is included for the volume mount.

## How memory works

- Every user message is stored.
- OnboardAI extracts 1–6 memory items (facts, people, tools, procedures, acronyms, preferences) and embeds them for fast search.
- When you ask a question, it fetches the top relevant memories via cosine similarity and includes them in the assistant prompt.
- Every 50 user messages, a profile summary memory is generated and older summaries are archived.

## Notes & reminders

- “Remind me” phrases are detected and stored with a lightweight parser.
- Due reminders appear in the Reminders view and can be exported as an `.ics` calendar file.

## Audio capture

Audio recordings are stored as files in the persistent volume. You’ll be prompted to write a summary after recording; the summary is stored as a memory for now (ready for future transcription integrations).
