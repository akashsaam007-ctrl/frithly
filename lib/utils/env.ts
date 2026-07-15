import "server-only";

import { z } from "zod";
import { publicEnv } from "@/lib/utils/public-env";

const serverEnvSchema = z.object({
  ADMIN_EMAIL_ALLOWLIST: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  EMAIL_PROVIDER: z.enum(["resend", "google_workspace"]).default("resend"),
  GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
  LEADGEN_BACKEND_API_URL: z.string().url().optional(),
  LEADGEN_BACKEND_SHARED_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  OWNED_COMPANY_DATASET_PATH: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_REPLY_TO: z.string().email().optional(),
  SEARXNG_BASE_URL: z.string().url().optional(),
  SEARXNG_ENGINES: z.string().optional(),
  SEARXNG_LANGUAGE: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_REPLY_TO: z.string().email().optional(),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  SMTP_USER: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
}).superRefine((envValues, ctx) => {
  if (envValues.EMAIL_PROVIDER === "resend") {
    for (const key of ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "RESEND_REPLY_TO"] as const) {
      if (!envValues[key]) {
        ctx.addIssue({
          code: "custom",
          message: `${key} is required when EMAIL_PROVIDER=resend`,
          path: [key],
        });
      }
    }
  }

  if (envValues.EMAIL_PROVIDER === "google_workspace") {
    for (const key of [
      "SMTP_FROM_EMAIL",
      "SMTP_HOST",
      "SMTP_PASSWORD",
      "SMTP_PORT",
      "SMTP_REPLY_TO",
      "SMTP_USER",
    ] as const) {
      if (!envValues[key]) {
        ctx.addIssue({
          code: "custom",
          message: `${key} is required when EMAIL_PROVIDER=google_workspace`,
          path: [key],
        });
      }
    }
  }
});

function normalizeOptionalEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const parsedServerEnv = serverEnvSchema.safeParse({
  ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  EMAIL_PROVIDER: normalizeOptionalEnv(process.env.EMAIL_PROVIDER),
  GOOGLE_MAPS_API_KEY: normalizeOptionalEnv(process.env.GOOGLE_MAPS_API_KEY),
  LEADGEN_BACKEND_API_URL: normalizeOptionalEnv(process.env.LEADGEN_BACKEND_API_URL),
  LEADGEN_BACKEND_SHARED_SECRET: normalizeOptionalEnv(process.env.LEADGEN_BACKEND_SHARED_SECRET),
  NODE_ENV: normalizeOptionalEnv(process.env.NODE_ENV) as "development" | "production" | "test" | undefined,
  OWNED_COMPANY_DATASET_PATH: normalizeOptionalEnv(process.env.OWNED_COMPANY_DATASET_PATH),
  RESEND_API_KEY: normalizeOptionalEnv(process.env.RESEND_API_KEY),
  RESEND_FROM_EMAIL: normalizeOptionalEnv(process.env.RESEND_FROM_EMAIL),
  RESEND_REPLY_TO: normalizeOptionalEnv(process.env.RESEND_REPLY_TO),
  SEARXNG_BASE_URL: normalizeOptionalEnv(process.env.SEARXNG_BASE_URL),
  SEARXNG_ENGINES: normalizeOptionalEnv(process.env.SEARXNG_ENGINES),
  SEARXNG_LANGUAGE: normalizeOptionalEnv(process.env.SEARXNG_LANGUAGE),
  SMTP_FROM_EMAIL: normalizeOptionalEnv(process.env.SMTP_FROM_EMAIL),
  SMTP_HOST: normalizeOptionalEnv(process.env.SMTP_HOST),
  SMTP_PASSWORD: normalizeOptionalEnv(process.env.SMTP_PASSWORD),
  SMTP_PORT: normalizeOptionalEnv(process.env.SMTP_PORT),
  SMTP_REPLY_TO: normalizeOptionalEnv(process.env.SMTP_REPLY_TO),
  SMTP_SECURE: normalizeOptionalEnv(process.env.SMTP_SECURE),
  SMTP_USER: normalizeOptionalEnv(process.env.SMTP_USER),
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
