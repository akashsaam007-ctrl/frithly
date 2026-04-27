import { CustomerShell } from "@/components/customer/customer-shell";
import { demoCustomer } from "@/lib/utils/demo-data";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerShell companyName={demoCustomer.companyName}>{children}</CustomerShell>;
}
