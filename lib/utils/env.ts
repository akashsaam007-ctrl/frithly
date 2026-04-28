import "server-only";

import { z } from "zod";
import { publicEnv } from "@/lib/utils/public-env";

const serverEnvSchema = z.object({
  ADMIN_EMAIL_ALLOWLIST: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  RESEND_REPLY_TO: z.string().email(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const parsedServerEnv = serverEnvSchema.safeParse({
  ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  RESEND_REPLY_TO: process.env.RESEND_REPLY_TO,
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
