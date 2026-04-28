import "server-only";

import { ROUTES } from "@/lib/constants";
import { env } from "@/lib/utils/env";

const ADMIN_EMAIL_ALLOWLIST = env.ADMIN_EMAIL_ALLOWLIST.split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string) {
  return ADMIN_EMAIL_ALLOWLIST.includes(email.trim().toLowerCase());
}

export function getPostLoginRoute(email: string) {
  return isAdminEmail(email) ? ROUTES.ADMIN : ROUTES.DASHBOARD;
}
