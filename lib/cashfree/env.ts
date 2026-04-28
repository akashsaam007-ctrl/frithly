import "server-only";

import { z } from "zod";

const cashfreeEnvironmentSchema = z.enum(["production", "sandbox"]);

const cashfreeEnvSchema = z.object({
  CASHFREE_CLIENT_ID: z.string().min(1),
  CASHFREE_CLIENT_SECRET: z.string().min(1),
  CASHFREE_ENVIRONMENT: cashfreeEnvironmentSchema,
  CASHFREE_PLAN_ID_DESIGN_PARTNER: z.string().min(1).optional(),
  CASHFREE_PLAN_ID_GROWTH: z.string().min(1),
  CASHFREE_PLAN_ID_STARTER: z.string().min(1),
});

function resolveCashfreeEnvironment() {
  return process.env.CASHFREE_ENVIRONMENT ?? "sandbox";
}

export function hasCashfreeApiConfiguration() {
  return Boolean(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
}

export function hasCashfreeCheckoutConfiguration() {
  return Boolean(
    hasCashfreeApiConfiguration() &&
      process.env.CASHFREE_PLAN_ID_STARTER &&
      process.env.CASHFREE_PLAN_ID_GROWTH,
  );
}

export function hasCashfreeWebhookConfiguration() {
  return hasCashfreeApiConfiguration();
}

export function getCashfreeEnv() {
  const parsed = cashfreeEnvSchema.safeParse({
    CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID,
    CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET,
    CASHFREE_ENVIRONMENT: resolveCashfreeEnvironment(),
    CASHFREE_PLAN_ID_DESIGN_PARTNER: process.env.CASHFREE_PLAN_ID_DESIGN_PARTNER,
    CASHFREE_PLAN_ID_GROWTH: process.env.CASHFREE_PLAN_ID_GROWTH,
    CASHFREE_PLAN_ID_STARTER: process.env.CASHFREE_PLAN_ID_STARTER,
  });

  if (!parsed.success) {
    const invalidKeys = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");

    throw new Error(
      `Missing or invalid Cashfree environment variables: ${invalidKeys}. Add them to .env.local before using Cashfree billing.`,
    );
  }

  return parsed.data;
}

export type CashfreeEnvironment = z.infer<typeof cashfreeEnvironmentSchema>;
