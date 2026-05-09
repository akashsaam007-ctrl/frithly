import "server-only";

import { z } from "zod";
import { publicEnv } from "@/lib/utils/public-env";

const serverEnvSchema = z.object({
  ADMIN_EMAIL_ALLOWLIST: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
  LEADGEN_BACKEND_API_URL: z.string().url().optional(),
  LEADGEN_BACKEND_SHARED_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  OWNED_COMPANY_DATASET_PATH: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  RESEND_REPLY_TO: z.string().email(),
  SEARXNG_BASE_URL: z.string().url().optional(),
  SEARXNG_ENGINES: z.string().optional(),
  SEARXNG_LANGUAGE: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

function normalizeOptionalEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const parsedServerEnv = serverEnvSchema.safeParse({
  ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_MAPS_API_KEY: normalizeOptionalEnv(process.env.GOOGLE_MAPS_API_KEY),
  LEADGEN_BACKEND_API_URL: normalizeOptionalEnv(process.env.LEADGEN_BACKEND_API_URL),
  LEADGEN_BACKEND_SHARED_SECRET: normalizeOptionalEnv(process.env.LEADGEN_BACKEND_SHARED_SECRET),
  NODE_ENV: normalizeOptionalEnv(process.env.NODE_ENV) as "development" | "production" | "test" | undefined,
  OWNED_COMPANY_DATASET_PATH: normalizeOptionalEnv(process.env.OWNED_COMPANY_DATASET_PATH),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  RESEND_REPLY_TO: process.env.RESEND_REPLY_TO,
  SEARXNG_BASE_URL: normalizeOptionalEnv(process.env.SEARXNG_BASE_URL),
  SEARXNG_ENGINES: normalizeOptionalEnv(process.env.SEARXNG_ENGINES),
  SEARXNG_LANGUAGE: normalizeOptionalEnv(process.env.SEARXNG_LANGUAGE),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsedServerEnv.success) {
  const invalidKeys = parsedServerEnv.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");

  throw new Error(
    `Missing or invalid server environment variables: ${invalidKeys}. Copy .env.example to .env.local and provide valid values before booting Frithly.`,
  );
}

export const env = {
  ...publicEnv,
  ...parsedServerEnv.data,
};
