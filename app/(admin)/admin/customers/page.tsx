import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { demoAdminCustomers } from "@/lib/utils/demo-data";

export default function AdminCustomersPage() {
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">Search by name or email</div>
            <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">Filter by status</div>
            <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">Filter by plan</div>
          </div>

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
                {demoAdminCustomers.map((customer, index) => (
                  <tr key={customer.email} className="border-t border-border">
                    <td className="py-4 pr-6 text-ink">{customer.name}</td>
                    <td className="py-4 pr-6 text-ink">{customer.email}</td>
                    <td className="py-4 pr-6 text-ink">{customer.plan}</td>
                    <td className="py-4 pr-6 text-ink capitalize">{customer.status}</td>
                    <td className="py-4 pr-6 text-ink">{customer.mrr}</td>
                    <td className="py-4 pr-6 text-ink">{customer.signupDate}</td>
                    <td className="py-4 pr-6 text-ink">{customer.lastBatch}</td>
                    <td className="py-4">
                      <Link
                        href={`${ROUTES.ADMIN_CUSTOMERS}/${index + 1}`}
                        className="font-semibold text-terracotta underline underline-offset-4"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
