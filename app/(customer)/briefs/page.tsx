import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { demoBatches } from "@/lib/utils/demo-data";
import { ROUTES } from "@/lib/constants";

export default function BriefsPage() {
  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Briefs</p>
        <h1 className="text-4xl md:text-5xl">All deliveries</h1>
        <p className="text-muted">Most recent first. Use these pages to review lead quality and replay your best openers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly briefs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-4 pr-6 font-medium">Delivery date</th>
                <th className="pb-4 pr-6 font-medium">Lead count</th>
                <th className="pb-4 pr-6 font-medium">% positive feedback</th>
                <th className="pb-4 font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {demoBatches.map((batch) => (
                <tr key={batch.id} className="border-t border-border">
                  <td className="py-4 pr-6 text-ink">{batch.deliveryDate}</td>
                  <td className="py-4 pr-6 text-ink">{batch.leadCount}</td>
                  <td className="py-4 pr-6 text-ink">
                    {Math.round((batch.positiveCount / batch.leadCount) * 100)}%
                  </td>
                  <td className="py-4">
                    <Link
                      href={`${ROUTES.BRIEFS}/${batch.id}`}
                      className="font-semibold text-terracotta underline underline-offset-4"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex items-center justify-between text-sm text-muted">
            <span>Showing 3 of 3 briefs</span>
            <div className="flex gap-3">
              <button className="rounded-lg border border-border px-4 py-2" disabled type="button">
                Previous
              </button>
              <button className="rounded-lg border border-border px-4 py-2" disabled type="button">
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
