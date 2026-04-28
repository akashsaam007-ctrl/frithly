import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/constants";
import { getAdminFeedbackData } from "@/lib/supabase/admin-data";

type AdminFeedbackPageProps = {
  searchParams?: Promise<{
    customer?: string | string[] | undefined;
    rating?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminFeedbackPage({ searchParams }: AdminFeedbackPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const customer = readParam(resolvedSearchParams?.customer);
  const rating = readParam(resolvedSearchParams?.rating);
  const feedbackData = await getAdminFeedbackData({ customer, rating });

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
        <CardContent className="space-y-6">
          <form className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto]" method="get">
            <input
              className="h-11 rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink outline-none"
              defaultValue={customer}
              name="customer"
              placeholder="Filter by customer"
              type="search"
            />
            <select
              className="h-11 rounded-lg border border-border bg-white px-4 py-3 text-sm text-ink outline-none"
              defaultValue={rating}
              name="rating"
            >
              <option value="">All ratings</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
            <button className="btn-secondary" type="submit">
              Apply
            </button>
          </form>

          {feedbackData.entries.length > 0 ? (
            feedbackData.entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      <Link
                        href={`${ROUTES.ADMIN_CUSTOMERS}/${entry.customerId}`}
                        className="underline underline-offset-4"
                      >
                        {entry.customerName}
                      </Link>{" "}
                      | {entry.leadName}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {entry.batchDateLabel ?? "No batch date available"}
                    </p>
                  </div>
                  <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-ink capitalize">
                    {entry.rating}
                  </span>
                </div>
                <p className="mt-3 text-muted">{entry.comment ?? "No comment provided."}</p>
              </div>
            ))
          ) : (
            <EmptyState
              className="border-0 shadow-none"
              description="No feedback matched the current filters."
              title="No feedback found"
            />
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">% positive last 30d</p>
            <p className="text-4xl font-bold text-ink">{feedbackData.positiveLast30Label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">Top complained-about customer</p>
            <p className="text-2xl font-semibold text-ink">{feedbackData.topComplainedCustomer}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">Top praised lead type</p>
            <p className="text-2xl font-semibold text-ink">{feedbackData.topPraisedLeadType}</p>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
