import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
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
            <input
              className="h-11 rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink outline-none"
              defaultValue={search}
              name="q"
              placeholder="Search by name or email"
              type="search"
            />
            <select
              className="h-11 rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink outline-none"
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
            <button className="btn-secondary" type="submit">
              Apply
            </button>
          </form>

          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="pb-4 pr-6 font-medium">Name</th>
                    <th className="pb-4 pr-6 font-medium">Email</th>
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
                      <td className="py-4 pr-6 text-ink">{customer.planLabel}</td>
                      <td className="py-4 pr-6 text-ink capitalize">{customer.status}</td>
                      <td className="py-4 pr-6 text-ink">{customer.mrrLabel}</td>
                      <td className="py-4 pr-6 text-ink">{customer.signupDateLabel}</td>
                      <td className="py-4 pr-6 text-ink">{customer.lastBatchLabel}</td>
                      <td className="py-4">
                        <Link
                          href={`${ROUTES.ADMIN_CUSTOMERS}/${customer.id}`}
                          className="font-semibold text-terracotta underline underline-offset-4"
                        >
                          Open -&gt;
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
