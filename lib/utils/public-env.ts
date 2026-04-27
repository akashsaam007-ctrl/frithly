import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_CALCOM_URL: z.string().url(),
  NEXT_PUBLIC_ENABLE_DEMO_MODE: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  NEXT_PUBLIC_STRIPE_LINK_DESIGN_PARTNER: z.string().url(),
  NEXT_PUBLIC_STRIPE_LINK_GROWTH: z.string().url(),
  NEXT_PUBLIC_STRIPE_LINK_SCALE: z.string().url(),
  NEXT_PUBLIC_STRIPE_LINK_STARTER: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
});

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CALCOM_URL: process.env.NEXT_PUBLIC_CALCOM_URL,
  NEXT_PUBLIC_ENABLE_DEMO_MODE: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_STRIPE_LINK_DESIGN_PARTNER:
    process.env.NEXT_PUBLIC_STRIPE_LINK_DESIGN_PARTNER,
  NEXT_PUBLIC_STRIPE_LINK_GROWTH: process.env.NEXT_PUBLIC_STRIPE_LINK_GROWTH,
  NEXT_PUBLIC_STRIPE_LINK_SCALE: process.env.NEXT_PUBLIC_STRIPE_LINK_SCALE,
  NEXT_PUBLIC_STRIPE_LINK_STARTER: process.env.NEXT_PUBLIC_STRIPE_LINK_STARTER,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
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
