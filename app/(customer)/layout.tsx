import { CustomerShell } from "@/components/customer/customer-shell";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companyName } = await getCurrentCustomerContext();
  return <CustomerShell companyName={companyName}>{children}</CustomerShell>;
}
