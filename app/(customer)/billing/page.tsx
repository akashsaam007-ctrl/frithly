import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { demoInvoices } from "@/lib/utils/demo-data";

export default function BillingPage() {
  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Billing</p>
        <h1 className="text-4xl md:text-5xl">Plan and payment history</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-semibold text-ink">Growth · £999/month</p>
          <p className="text-muted">Next billing date: 28 May 2026 · Lifetime value paid: £2,997</p>
          <button className="btn-secondary" disabled type="button">
            Manage subscription
          </button>
          <p className="text-sm text-muted">
            Stripe Customer Portal will open here once live billing credentials are connected.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center"
            >
              <div>
                <p className="font-semibold text-ink">{invoice.id}</p>
                <p className="text-sm text-muted">
                  {invoice.date} · {invoice.status}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-ink">{invoice.amount}</p>
                <button className="text-sm font-semibold text-terracotta" type="button">
                  Download
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
}
