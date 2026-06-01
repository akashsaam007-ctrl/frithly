import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_CALCOM_URL: z.string().url().optional(),
  NEXT_PUBLIC_CALENDLY_URL: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_ENABLE_IN_DEV: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_ENABLE_DEMO_MODE: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
});

function normalizeOptionalEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CALCOM_URL: normalizeOptionalEnv(process.env.NEXT_PUBLIC_CALCOM_URL),
  NEXT_PUBLIC_CALENDLY_URL: normalizeOptionalEnv(process.env.NEXT_PUBLIC_CALENDLY_URL),
  NEXT_PUBLIC_POSTHOG_ENABLE_IN_DEV: normalizeOptionalEnv(process.env.NEXT_PUBLIC_POSTHOG_ENABLE_IN_DEV),
  NEXT_PUBLIC_ENABLE_DEMO_MODE: normalizeOptionalEnv(process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE),
  NEXT_PUBLIC_POSTHOG_HOST: normalizeOptionalEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST),
  NEXT_PUBLIC_POSTHOG_TOKEN: normalizeOptionalEnv(process.env.NEXT_PUBLIC_POSTHOG_TOKEN),
  NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV: normalizeOptionalEnv(process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV),
  NEXT_PUBLIC_SENTRY_DSN: normalizeOptionalEnv(process.env.NEXT_PUBLIC_SENTRY_DSN),
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

if (!parsedPublicEnv.success) {
  const invalidKeys = parsedPublicEnv.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");

  throw new Error(
    `Missing or invalid public environment variables: ${invalidKeys}. Copy .env.example to .env.local and provide valid values before booting Frithly.`,
  );
}

export const publicEnv = parsedPublicEnv.data;
