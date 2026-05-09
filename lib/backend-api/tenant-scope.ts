import "server-only";

import type { BackendTenantScope } from "@/lib/backend-api/client";
import type { CustomerContext } from "@/lib/supabase/customer-data";

export function tenantScopeFromCustomerContext(customerContext: CustomerContext): BackendTenantScope {
  return {
    customerId: customerContext.customer.id,
    organizationName: customerContext.companyName,
  };
}
