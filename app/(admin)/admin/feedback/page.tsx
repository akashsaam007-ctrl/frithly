import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { demoFeedback } from "@/lib/utils/demo-data";

export default function AdminFeedbackPage() {
  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Feedback</p>
        <h1 className="text-4xl md:text-5xl">Customer feedback feed</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest lead feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoFeedback.map((entry) => (
            <div key={`${entry.customer}-${entry.leadName}`} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-ink">
                  {entry.customer} · {entry.leadName}
                </p>
                <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-ink capitalize">
                  {entry.rating}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{entry.batchDate}</p>
              <p className="mt-3 text-muted">{entry.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">% positive last 30d</p>
            <p className="text-4xl font-bold text-ink">82%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">Top complained-about customer</p>
            <p className="text-2xl font-semibold text-ink">ForgeOps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">Top praised lead type</p>
            <p className="text-2xl font-semibold text-ink">Hiring-trigger leads</p>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
