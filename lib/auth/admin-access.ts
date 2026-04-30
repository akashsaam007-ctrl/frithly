import "server-only";

import { ROUTES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/utils/env";

export type AppRole = "admin" | "customer";

const bootstrapAdminEmailAllowlist = env.ADMIN_EMAIL_ALLOWLIST.split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isMissingCustomerRoleColumnError(message: string) {
  return /column\s+customers\.role\s+does\s+not\s+exist/i.test(message);
}

export function isBootstrapAdminEmail(email: string) {
  return bootstrapAdminEmailAllowlist.includes(email.trim().toLowerCase());
}

export function getBootstrapRoleForEmail(email: string): AppRole {
  return isBootstrapAdminEmail(email) ? "admin" : "customer";
}

export function getPostLoginRouteForRole(role: AppRole) {
  return role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD;
}

export async function getUserRoleByEmail(email: string): Promise<AppRole> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return "customer";
  }

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("customers")
    .select("role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    if (isMissingCustomerRoleColumnError(error.message)) {
      return getBootstrapRoleForEmail(normalizedEmail);
    }

    throw new Error(error.message);
  }

  if (data?.role === "admin" || data?.role === "customer") {
    return data.role;
  }

  return getBootstrapRoleForEmail(normalizedEmail);
}

export async function getPostLoginRoute(email: string) {
  const role = await getUserRoleByEmail(email);
  return getPostLoginRouteForRole(role);
}
