import "server-only";

import { z } from "zod";

const lemonSqueezyEnvSchema = z.object({
  LEMON_SQUEEZY_API_KEY: z.string().min(1),
  LEMON_SQUEEZY_STORE_ID: z.string().regex(/^\d+$/),
  LEMON_SQUEEZY_TEST_MODE: z.enum(["true", "false"]).optional(),
  LEMON_SQUEEZY_VARIANT_ID_DESIGN_PARTNER: z.string().regex(/^\d+$/).optional(),
  LEMON_SQUEEZY_VARIANT_ID_GROWTH: z.string().regex(/^\d+$/),
  LEMON_SQUEEZY_VARIANT_ID_STARTER: z.string().regex(/^\d+$/),
  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().min(1),
});

export function hasLemonSqueezyConfiguration() {
  return Boolean(
    process.env.LEMON_SQUEEZY_API_KEY &&
      process.env.LEMON_SQUEEZY_STORE_ID &&
      process.env.LEMON_SQUEEZY_VARIANT_ID_STARTER &&
      process.env.LEMON_SQUEEZY_VARIANT_ID_GROWTH &&
      process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
  );
}

export function getLemonSqueezyEnv() {
  const parsed = lemonSqueezyEnvSchema.safeParse({
    LEMON_SQUEEZY_API_KEY: process.env.LEMON_SQUEEZY_API_KEY,
    LEMON_SQUEEZY_STORE_ID: process.env.LEMON_SQUEEZY_STORE_ID,
    LEMON_SQUEEZY_TEST_MODE: process.env.LEMON_SQUEEZY_TEST_MODE,
    LEMON_SQUEEZY_VARIANT_ID_DESIGN_PARTNER: process.env.LEMON_SQUEEZY_VARIANT_ID_DESIGN_PARTNER,
    LEMON_SQUEEZY_VARIANT_ID_GROWTH: process.env.LEMON_SQUEEZY_VARIANT_ID_GROWTH,
    LEMON_SQUEEZY_VARIANT_ID_STARTER: process.env.LEMON_SQUEEZY_VARIANT_ID_STARTER,
    LEMON_SQUEEZY_WEBHOOK_SECRET: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
  });

  if (!parsed.success) {
    const invalidKeys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");

    throw new Error(
      `Missing or invalid Lemon Squeezy environment variables: ${invalidKeys}. Add them to .env.local before using Lemon Squeezy billing.`,
    );
  }

  return parsed.data;
}
