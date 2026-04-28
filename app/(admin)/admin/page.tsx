import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { getAdminOverviewData } from "@/lib/supabase/admin-data";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverviewData();

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Admin overview
        </p>
        <h1 className="text-4xl md:text-5xl">Operational snapshot</h1>
      </div>

      <section id="metrics" className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active customers", overview.activeCustomers],
          ["Total MRR", overview.totalMrrLabel],
          ["Lead approval rate", overview.leadApprovalRateLabel],
          ["Open feedback issues", overview.openFeedbackIssues],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="space-y-2 p-6">
              <p className="text-sm text-muted">{label}</p>
              <p className="text-4xl font-bold text-ink">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted">
            {overview.recentActivity.length > 0 ? (
              overview.recentActivity.map((item) => <p key={item.id}>{item.text}</p>)
            ) : (
              <p>No recent customer or batch activity yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={ROUTES.ADMIN_BATCHES_NEW} className="btn-primary w-full justify-center">
              Create batch
            </Link>
            <Link href={ROUTES.ADMIN_CUSTOMERS} className="btn-secondary w-full justify-center">
              View customers
            </Link>
            <Link href={ROUTES.ADMIN_FEEDBACK} className="btn-secondary w-full justify-center">
              View feedback
            </Link>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Customers needing attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.customersNeedingAttention.length > 0 ? (
            overview.customersNeedingAttention.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4">
                <p className="font-semibold text-ink">{item.label}</p>
                <p className="mt-2 text-sm text-muted">{item.reason}</p>
              </div>
            ))
          ) : (
            <p className="text-muted">No active customers need attention right now.</p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
