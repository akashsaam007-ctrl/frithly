import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CustomerPageHero } from "@/components/customer/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

function formatUpdatedAtLabel(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderList(values: string[] | null | undefined, fallback: string) {
  if (!values || values.length === 0) {
    return fallback;
  }

  return values.join(", ");
}

export default async function IcpPage() {
  const context = await getCurrentCustomerContext();
  const activeIcp = context.activeIcp;
  const updatedAtLabel = formatUpdatedAtLabel(activeIcp?.updated_at ?? null);

  return (
    <Container className="space-y-8 px-0">
      <CustomerPageHero
        eyebrow={
          <>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Admin-managed targeting brief
          </>
        }
        title={<>Your ICP is managed inside Frithly admin.</>}
        description={
          <>
            Your operator uploads and maintains the active targeting brief used for discovery,
            review, and weekly delivery. Use this page to review the current brief and contact
            support if you want it changed.
          </>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={ROUTES.HELP}>Request a brief update</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={ROUTES.DASHBOARD}>Back to dashboard</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={activeIcp ? "success" : "muted"}>
              {activeIcp ? "Active brief attached" : "No active brief yet"}
            </Badge>
            <Badge variant="muted">
              {updatedAtLabel ? `Last updated ${updatedAtLabel}` : "Waiting for admin upload"}
            </Badge>
          </div>

          {activeIcp ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">
                  Product
                </p>
                <p className="text-sm leading-7 text-white/76">{activeIcp.product_description}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">
                  Buyer titles
                </p>
                <p className="text-sm leading-7 text-white/76">
                  {renderList(activeIcp.target_titles, "No titles listed yet.")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">
                  Target industries
                </p>
                <p className="text-sm leading-7 text-white/76">
                  {renderList(activeIcp.target_industries, "No industries listed yet.")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">
                  Geographies
                </p>
                <p className="text-sm leading-7 text-white/76">
                  {renderList(activeIcp.geographies, "No geographies listed yet.")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">
                  Company size
                </p>
                <p className="text-sm leading-7 text-white/76">
                  {activeIcp.company_size_min || activeIcp.company_size_max
                    ? `${activeIcp.company_size_min ?? 0} - ${activeIcp.company_size_max ?? "up"} employees`
                    : "Open size range"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">
                  Signals
                </p>
                <p className="text-sm leading-7 text-white/76">
                  {renderList(activeIcp.signals, "No priority signals listed yet.")}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/48">
                  Exclusions
                </p>
                <p className="text-sm leading-7 text-white/76">
                  {renderList(activeIcp.exclusions, "No exclusions listed yet.")}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm leading-7 text-white/58">
              Admin has not uploaded an active ICP for this workspace yet. Once it is attached,
              Frithly will use it for lead generation and weekly delivery.
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
