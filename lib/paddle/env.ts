import "server-only";

import { z } from "zod";

const paddleEnvironmentSchema = z.enum(["live", "sandbox"]);

const paddleEnvSchema = z.object({
  PADDLE_API_KEY: z.string().regex(/^pdl_(live|sdbx)_apikey_/),
  PADDLE_ENVIRONMENT: paddleEnvironmentSchema,
  PADDLE_PRICE_ID_DESIGN_PARTNER: z.string().regex(/^pri_/).optional(),
  PADDLE_PRICE_ID_GROWTH: z.string().regex(/^pri_/),
  PADDLE_PRICE_ID_STARTER: z.string().regex(/^pri_/),
  PADDLE_WEBHOOK_SECRET: z.string().min(1),
});

function inferEnvironmentFromApiKey(apiKey: string | undefined) {
  if (!apiKey) {
    return undefined;
  }

  if (apiKey.startsWith("pdl_sdbx_apikey_")) {
    return "sandbox" as const;
  }

  if (apiKey.startsWith("pdl_live_apikey_")) {
    return "live" as const;
  }

  return undefined;
}

export function hasPaddleApiConfiguration() {
  return Boolean(process.env.PADDLE_API_KEY && (process.env.PADDLE_ENVIRONMENT || inferEnvironmentFromApiKey(process.env.PADDLE_API_KEY)));
}

export function hasPaddleCheckoutConfiguration() {
  return Boolean(
    hasPaddleApiConfiguration() &&
      process.env.PADDLE_PRICE_ID_STARTER &&
      process.env.PADDLE_PRICE_ID_GROWTH &&
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
  );
}

export function hasPaddleWebhookConfiguration() {
  return Boolean(hasPaddleApiConfiguration() && process.env.PADDLE_WEBHOOK_SECRET);
}

export function getPaddleEnv() {
  const parsed = paddleEnvSchema.safeParse({
    PADDLE_API_KEY: process.env.PADDLE_API_KEY,
    PADDLE_ENVIRONMENT:
      process.env.PADDLE_ENVIRONMENT ?? inferEnvironmentFromApiKey(process.env.PADDLE_API_KEY),
    PADDLE_PRICE_ID_DESIGN_PARTNER: process.env.PADDLE_PRICE_ID_DESIGN_PARTNER,
    PADDLE_PRICE_ID_GROWTH: process.env.PADDLE_PRICE_ID_GROWTH,
    PADDLE_PRICE_ID_STARTER: process.env.PADDLE_PRICE_ID_STARTER,
    PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET,
  });

  if (!parsed.success) {
    const invalidKeys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");

    throw new Error(
      `Missing or invalid Paddle environment variables: ${invalidKeys}. Add them to .env.local before using Paddle billing.`,
    );
  }

  return parsed.data;
}

export type PaddleEnvironment = z.infer<typeof paddleEnvironmentSchema>;
