import { publicEnv } from "@/lib/utils/public-env";

export const isDemoMode = publicEnv.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";
