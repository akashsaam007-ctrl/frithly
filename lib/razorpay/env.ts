import "server-only";

import { z } from "zod";

const razorpayEnvSchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_PLAN_ID_DESIGN_PARTNER: z.string().min(1),
  RAZORPAY_PLAN_ID_GROWTH: z.string().min(1),
  RAZORPAY_PLAN_ID_STARTER: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
});

export function hasRazorpayConfiguration() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_PLAN_ID_STARTER &&
      process.env.RAZORPAY_PLAN_ID_GROWTH &&
      process.env.RAZORPAY_PLAN_ID_DESIGN_PARTNER &&
      process.env.RAZORPAY_WEBHOOK_SECRET,
  );
}

export function getRazorpayEnv() {
  const parsed = razorpayEnvSchema.safeParse({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_PLAN_ID_DESIGN_PARTNER: process.env.RAZORPAY_PLAN_ID_DESIGN_PARTNER,
    RAZORPAY_PLAN_ID_GROWTH: process.env.RAZORPAY_PLAN_ID_GROWTH,
    RAZORPAY_PLAN_ID_STARTER: process.env.RAZORPAY_PLAN_ID_STARTER,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  });

  if (!parsed.success) {
    const invalidKeys = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");

    throw new Error(
      `Missing or invalid Razorpay environment variables: ${invalidKeys}. Add them to .env.local before using Razorpay billing.`,
    );
  }

  return parsed.data;
}
