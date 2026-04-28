import type { Metadata } from "next";
import { PaddlePayLoader } from "@/components/billing/paddle-pay-loader";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  description: "Secure checkout handoff for Frithly subscriptions.",
  title: "Secure checkout | Frithly",
};

type PayPageProps = {
  searchParams?: Promise<{
    _ptxn?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function PayPage({ searchParams }: PayPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const transactionId = readParam(resolvedSearchParams?._ptxn);
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? null;
  const environment = process.env.PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "live";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <main className="py-16 md:py-24">
      <Container width="narrow" className="space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
            Billing
          </p>
          <h1>Complete your Frithly subscription</h1>
          <p className="text-muted">
            You&apos;ll finish payment in Paddle, then we&apos;ll send your receipt and welcome email
            automatically.
          </p>
        </div>

        <PaddlePayLoader
          appUrl={appUrl}
          clientToken={clientToken}
          environment={environment}
          transactionId={transactionId}
        />
      </Container>
    </main>
  );
}
