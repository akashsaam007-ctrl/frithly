import { IdentifyUser } from "@/components/analytics/identify-user";
import { CustomerShell } from "@/components/customer/customer-shell";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companyName, customer } = await getCurrentCustomerContext();

  return (
    <CustomerShell companyName={companyName}>
      <IdentifyUser distinctId={customer.id} email={customer.email} type="customer" />
      {children}
    </CustomerShell>
  );
}
