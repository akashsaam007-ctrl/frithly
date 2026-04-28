import type { Metadata } from "next";
import { CashfreePayLoader } from "@/components/billing/cashfree-pay-loader";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  description: "Secure checkout handoff for Frithly subscriptions.",
  title: "Secure checkout | Frithly",
};

type PayPageProps = {
  searchParams?: Promise<{
    subscription_id?: string | string[] | undefined;
    subscription_session_id?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function PayPage({ searchParams }: PayPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const subscriptionId = readParam(resolvedSearchParams?.subscription_id);
  const subscriptionSessionId = readParam(resolvedSearchParams?.subscription_session_id);
  const environment =
    process.env.CASHFREE_ENVIRONMENT === "production" ? "production" : "sandbox";

  return (
    <main className="py-16 md:py-24">
      <Container width="narrow" className="space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
            Billing
          </p>
          <h1>Complete your Frithly subscription</h1>
          <p className="text-muted">
            You&apos;ll finish authorisation in Cashfree&apos;s hosted checkout, then we&apos;ll
            confirm activation by email as soon as the subscription becomes active.
          </p>
        </div>

        <CashfreePayLoader
          environment={environment}
          subscriptionId={subscriptionId}
          subscriptionSessionId={subscriptionSessionId}
        />
      </Container>
    </main>
  );
}
