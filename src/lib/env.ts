import { z } from "zod";

const optionalEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema.optional()
  );

const envSchema = z.object({
  // Optional Email Configuration
  FEEDBACK_EMAIL: optionalEnv(z.string().email("FEEDBACK_EMAIL must be a valid email")),
  SMTP_HOST: optionalEnv(z.string().min(1, "SMTP_HOST is required")),
  SMTP_PORT: optionalEnv(
    z.string().regex(/^\d+$/, "SMTP_PORT must be a number").transform(Number)
  ),
  SMTP_USER: optionalEnv(z.string().min(1, "SMTP_USER is required")),
  SMTP_PASS: optionalEnv(z.string().min(1, "SMTP_PASS is required")),
  SMTP_FROM: optionalEnv(z.string().email("SMTP_FROM must be a valid email")),
  
  // Optional Configuration
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SENTRY_DSN: optionalEnv(z.string().url()),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables on startup.
 * Throws an error with clear message if validation fails.
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        return `  - ${issue.path.join(".")}: ${issue.message}`;
      });
      
      throw new Error(
        `Environment variable validation failed:\n${issues.join("\n")}\n\n` +
        `Please check your .env file or environment configuration.`
      );
    }
    throw error;
  }
}

/**
 * Returns validated environment variables.
 * Only use this after calling validateEnv() at startup.
 */
export function getEnv(): Env {
  return envSchema.parse(process.env);
}
