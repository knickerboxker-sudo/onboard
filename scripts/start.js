const { execSync } = require("child_process");

const databaseUrl = process.env.DATABASE_URL;
const hasValidDatabaseUrl =
  typeof databaseUrl === "string" &&
  /^(postgresql|postgres):\/\//.test(databaseUrl);

// Run prisma migrate on startup (for Railway deployments)
if (hasValidDatabaseUrl) {
  try {
    console.log("Running database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Migrations complete.");
  } catch (err) {
    console.warn("Migration warning:", err.message);
  }

  // Add searchVector column if not exists (for tsvector support)
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    prisma
      .$executeRawUnsafe(
        `DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'recall_events' AND column_name = 'searchVector'
          ) THEN
            ALTER TABLE recall_events ADD COLUMN "searchVector" tsvector;
            CREATE INDEX IF NOT EXISTS recall_events_search_vector_idx ON recall_events USING GIN ("searchVector");
          END IF;
        END $$;`
      )
      .then(() => {
        console.log("Search vector column verified.");
        prisma.$disconnect();
      })
      .catch((err) => {
        console.warn("Search vector setup warning:", err.message);
        prisma.$disconnect();
      });
  } catch (err) {
    console.warn("Prisma setup warning:", err.message);
  }
} else {
  console.warn(
    "Skipping database migrations and search vector setup: no valid DATABASE_URL configured."
  );
}

// Start the Next.js server
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, () => {
    console.log(`> sortir ready on http://${hostname}:${port}`);
  });
});
