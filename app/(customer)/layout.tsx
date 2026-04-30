import { IdentifyUser } from "@/components/analytics/identify-user";
import { CustomerShell } from "@/components/customer/customer-shell";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companyName, customer } = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customer);

  return (
    <CustomerShell companyName={companyName} hasWorkspaceAccess={hasWorkspaceAccess}>
      <IdentifyUser distinctId={customer.id} email={customer.email} type="customer" />
      {children}
    </CustomerShell>
  );
}
