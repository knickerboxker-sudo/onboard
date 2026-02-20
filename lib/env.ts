import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  // Optional but recommended:
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n  ");
    throw new Error(
      `Missing or invalid environment variables:\n  ${missing}\n\nCheck your .env file.`,
    );
  }
  return result.data;
}

// Only validate at runtime (not during Next.js build-time static generation
// which may not have all env vars available).
let _env: Env | undefined;

export function getEnv(): Env {
  if (typeof window !== "undefined") {
    // Client side — only public vars are available; skip full validation.
    return process.env as unknown as Env;
  }
  if (!_env) {
    _env = parseEnv();
  }
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return (process.env as Record<string, string | undefined>)[prop];
  },
});
