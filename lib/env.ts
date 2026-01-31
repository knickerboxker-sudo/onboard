export type RequiredEnv = "DATABASE_URL" | "COHERE_API_KEY";

export function getMissingEnv(keys: RequiredEnv[]): RequiredEnv[] {
  return keys.filter((key) => !process.env[key]);
}

export function describeEnvUsage(key: RequiredEnv) {
  switch (key) {
    case "DATABASE_URL":
      return "Connects the app to Postgres via Prisma.";
    case "COHERE_API_KEY":
      return "Enables Cohere chat + embeddings for memory and responses.";
    default:
      return "Required configuration.";
  }
}
