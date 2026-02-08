const { execSync } = require("node:child_process");
const fs = require("node:fs");

const defaultDatabaseUrl = "file:/data/onboardai.db";

if (!process.env.DATABASE_URL) {
  fs.mkdirSync("/data", { recursive: true });
  process.env.DATABASE_URL = defaultDatabaseUrl;
  console.log(`DATABASE_URL was not set. Falling back to ${defaultDatabaseUrl}.`);
}

execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
execSync("next start", { stdio: "inherit" });
