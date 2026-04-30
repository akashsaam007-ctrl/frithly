import "server-only";

import type { User } from "@supabase/supabase-js";
import { getBootstrapRoleForEmail, isMissingCustomerRoleColumnError } from "@/lib/auth/admin-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

function getPreferredFullName(user: Pick<User, "email" | "user_metadata">) {
  const metadata = user.user_metadata ?? {};

  const fullName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    [metadata.given_name, metadata.family_name]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" ")
      .trim();

  if (fullName) {
    return fullName;
  }

  return user.email?.split("@")[0] ?? null;
}

export async function ensureCustomerRecordForUser(
  user: Pick<User, "email" | "user_metadata">,
): Promise<CustomerRow | null> {
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const bootstrapRole = getBootstrapRoleForEmail(normalizedEmail);
  const adminClient = createSupabaseAdminClient();
  const { data: existingCustomer, error: existingCustomerError } = await adminClient
    .from("customers")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingCustomerError) {
    throw new Error(existingCustomerError.message);
  }

  if (existingCustomer) {
    return existingCustomer;
  }

  const { data: createdCustomer, error: createCustomerError } = await adminClient
    .from("customers")
    .insert({
      email: normalizedEmail,
      full_name: getPreferredFullName(user),
      role: bootstrapRole,
      status: "pending",
    })
    .select("*")
    .single();

  if (createCustomerError) {
    if (isMissingCustomerRoleColumnError(createCustomerError.message)) {
      const { data: legacyCreatedCustomer, error: legacyCreateCustomerError } = await adminClient
        .from("customers")
        .insert({
          email: normalizedEmail,
          full_name: getPreferredFullName(user),
          status: "pending",
        })
        .select("*")
        .single();

      if (!legacyCreateCustomerError && legacyCreatedCustomer) {
        return legacyCreatedCustomer;
      }
    }

    const { data: fallbackCustomer, error: fallbackError } = await adminClient
      .from("customers")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    if (fallbackCustomer) {
      return fallbackCustomer;
    }

    throw new Error(createCustomerError.message);
  }

  return createdCustomer;
}
