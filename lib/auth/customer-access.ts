import type { Database } from "@/types/database.types";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

type CustomerAccessInput = Pick<CustomerRow, "plan" | "status"> | null | undefined;

const WORKSPACE_ACCESS_STATUSES = new Set<NonNullable<CustomerRow["status"]>>([
  "active",
  "pending",
]);

export function hasCustomerWorkspaceAccess(customer: CustomerAccessInput) {
  if (!customer?.plan || !customer.status) {
    return false;
  }

  return WORKSPACE_ACCESS_STATUSES.has(customer.status);
}

export function isCustomerPlanActivating(customer: CustomerAccessInput) {
  return Boolean(customer?.plan) && customer?.status === "pending";
}
