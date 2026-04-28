import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

type BriefsPageProps = {
  searchParams?: Promise<{ page?: string | string[] | undefined }>;
};

export default async function BriefsPage({ searchParams }: BriefsPageProps) {
  const { batches } = await getCurrentCustomerContext();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams?.page[0]
    : resolvedSearchParams?.page;
  const currentPage = Math.max(Number(pageParam ?? "1") || 1, 1);
  const pageSize = 10;
  const totalPages = Math.max(Math.ceil(batches.length / pageSize), 1);
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const visibleBatches = batches.slice(pageStart, pageStart + pageSize);

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Briefs</p>
        <h1 className="text-4xl md:text-5xl">All deliveries</h1>
        <p className="text-muted">
          Most recent first. Use these pages to review lead quality and replay your best openers.
        </p>
      </div>

      {batches.length === 0 ? (
        <EmptyState
          description="Your first brief will appear here after the next delivery window. We'll list every batch with lead counts and feedback trends once they start landing."
          title="No briefs yet"
        />
      ) : (
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
                {visibleBatches.map((batch) => (
                  <tr key={batch.id} className="border-t border-border">
                    <td className="py-4 pr-6 text-ink">{batch.deliveryDateLabel}</td>
                    <td className="py-4 pr-6 text-ink">{batch.leadCount}</td>
                    <td className="py-4 pr-6 text-ink">
                      {batch.positiveRate !== null ? `${batch.positiveRate}%` : "--"}
                    </td>
                    <td className="py-4">
                      <Link
                        href={`${ROUTES.BRIEFS}/${batch.id}`}
                        className="font-semibold text-terracotta underline underline-offset-4"
                      >
                        View -&gt;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex items-center justify-between text-sm text-muted">
              <span>
                Showing {pageStart + 1}-{Math.min(pageStart + visibleBatches.length, batches.length)}{" "}
                of {batches.length} briefs
              </span>
              <div className="flex gap-3">
                <Link
                  aria-disabled={safePage <= 1}
                  className={`rounded-lg border border-border px-4 py-2 ${
                    safePage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-white"
                  }`}
                  href={safePage <= 1 ? ROUTES.BRIEFS : `${ROUTES.BRIEFS}?page=${safePage - 1}`}
                >
                  Previous
                </Link>
                <Link
                  aria-disabled={safePage >= totalPages}
                  className={`rounded-lg border border-border px-4 py-2 ${
                    safePage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-white"
                  }`}
                  href={
                    safePage >= totalPages ? ROUTES.BRIEFS : `${ROUTES.BRIEFS}?page=${safePage + 1}`
                  }
                >
                  Next
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
