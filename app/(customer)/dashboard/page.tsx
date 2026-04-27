import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { demoBatches, demoCustomer } from "@/lib/utils/demo-data";
import { ROUTES } from "@/lib/constants";
import { getNextMondayLabel } from "@/lib/utils";

export default function DashboardPage() {
  const latestBatch = demoBatches[0];

  return (
    <Container className="space-y-8 px-0">
      <section className="rounded-2xl border border-border bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">Welcome back, {demoCustomer.firstName}!</h1>
        <p className="mt-3 max-w-3xl text-muted">
          Your team&apos;s next batch is on track and last week&apos;s top leads are ready for follow-up.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Latest brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-muted">{latestBatch.deliveryDate}</p>
            <h2 className="text-3xl md:text-4xl">{latestBatch.leadCount} new leads this week</h2>
            <p className="text-muted">
              {latestBatch.positiveCount} leads marked positive, {latestBatch.negativeCount} marked
              negative.
            </p>
            <Link
              href={`${ROUTES.BRIEFS}/${latestBatch.id}`}
              className="btn-primary inline-flex"
            >
              View Brief →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold text-ink">Next delivery: Monday {getNextMondayLabel()} at 10 AM</p>
            <p className="text-muted">
              We&apos;re currently researching candidates matching your ICP and recent trigger
              signals.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Total leads delivered</p>
            <p className="text-4xl font-bold text-ink">150</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Average ICP match rate</p>
            <p className="text-4xl font-bold text-ink">84%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Days subscribed</p>
            <p className="text-4xl font-bold text-ink">82</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>ICP at-a-glance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted">
            Heads of Sales, VP Sales, and CROs at B2B SaaS companies with 11-500 employees across
            the UK and US. Prioritise funding, hiring, and outbound-process pain signals.
          </p>
          <Link href={ROUTES.ICP} className="font-semibold text-terracotta underline underline-offset-4">
            Edit ICP →
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
