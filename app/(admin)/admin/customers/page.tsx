import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { getAdminCustomersData } from "@/lib/supabase/admin-data";

type AdminCustomersPageProps = {
  searchParams?: Promise<{
    q?: string | string[] | undefined;
    status?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const search = readParam(resolvedSearchParams?.q);
  const status = readParam(resolvedSearchParams?.status);
  const customers = await getAdminCustomersData({ search, status });

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Customers</p>
        <h1 className="text-4xl md:text-5xl">Customer list</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto]" method="get">
            <Input
              defaultValue={search}
              name="q"
              placeholder="Search by name or email"
              type="search"
            />
            <select
              className="field-dark-select"
              defaultValue={status}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
              <option value="churned">Churned</option>
              <option value="pending">Pending</option>
            </select>
            <Button type="submit" variant="secondary">
              Apply
            </Button>
          </form>

          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="pb-4 pr-6 font-medium">Name</th>
                    <th className="pb-4 pr-6 font-medium">Email</th>
                    <th className="pb-4 pr-6 font-medium">Role</th>
                    <th className="pb-4 pr-6 font-medium">Plan</th>
                    <th className="pb-4 pr-6 font-medium">Status</th>
                    <th className="pb-4 pr-6 font-medium">MRR</th>
                    <th className="pb-4 pr-6 font-medium">Signup date</th>
                    <th className="pb-4 pr-6 font-medium">Last batch</th>
                    <th className="pb-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-border">
                      <td className="py-4 pr-6 text-ink">{customer.name}</td>
                      <td className="py-4 pr-6 text-ink">{customer.email}</td>
                      <td className="py-4 pr-6 text-ink capitalize">{customer.role}</td>
                      <td className="py-4 pr-6 text-ink">{customer.planLabel}</td>
                      <td className="py-4 pr-6 text-ink capitalize">{customer.status}</td>
                      <td className="py-4 pr-6 text-ink">{customer.mrrLabel}</td>
                      <td className="py-4 pr-6 text-ink">{customer.signupDateLabel}</td>
                      <td className="py-4 pr-6 text-ink">{customer.lastBatchLabel}</td>
                      <td className="py-4 whitespace-nowrap">
                        <Link
                          href={`${ROUTES.ADMIN_CUSTOMERS}/${customer.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-terracotta underline underline-offset-4 whitespace-nowrap"
                        >
                          Open record -&gt;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              className="border-0 shadow-none"
              description="No customers matched the current filters. Try clearing the search or status filter."
              title="No customers found"
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
