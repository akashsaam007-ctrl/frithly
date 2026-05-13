import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CustomerIcpEditor } from "@/components/admin/customer-icp-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { getAdminCustomerDetail } from "@/lib/supabase/admin-data";

type AdminCustomerIcpPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerIcpPage({
  params,
}: AdminCustomerIcpPageProps) {
  const { id } = await params;
  const detail = await getAdminCustomerDetail(id);
  const customerLabel =
    detail.customer.company_name ?? detail.customer.full_name ?? detail.customer.email;
  const leadStudioHref = `${ROUTES.ADMIN_LEAD_STUDIO}?customer=${detail.customer.id}`;

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-2 bg-terracotta/12 px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-terracotta">
            <Sparkles className="h-3.5 w-3.5" />
            Customer ICP workspace
          </Badge>
          <Badge variant="muted">{detail.customer.plan ?? "unassigned"}</Badge>
          <Badge variant="muted" className="capitalize">
            {detail.customer.status ?? "pending"}
          </Badge>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl">{customerLabel}</h1>
            <p className="max-w-3xl text-base leading-8 text-white/68 md:text-lg">
              Upload and maintain the active ICP used for discovery, lead review, and weekly
              delivery. This is the admin source of truth for campaign generation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild type="button" variant="secondary">
              <Link href={`${ROUTES.ADMIN_CUSTOMERS}/${detail.customer.id}`}>
                <ArrowLeft className="h-4 w-4" />
                Back to customer
              </Link>
            </Button>
            <Button asChild type="button">
              <Link href={leadStudioHref}>Open lead studio</Link>
            </Button>
          </div>
        </div>
      </div>

      <CustomerIcpEditor
        customer={{
          email: detail.customer.email,
          id: detail.customer.id,
          label: customerLabel,
          planLabel: detail.customer.plan ?? "unassigned",
          status: detail.customer.status,
        }}
        initialIcp={
          detail.activeIcp
            ? {
                brandVoice: detail.activeIcp.brand_voice,
                companySizeMax: detail.activeIcp.company_size_max,
                companySizeMin: detail.activeIcp.company_size_min,
                exclusions: detail.activeIcp.exclusions ?? [],
                geographies: detail.activeIcp.geographies ?? [],
                id: detail.activeIcp.id,
                name: detail.activeIcp.name,
                productDescription: detail.activeIcp.product_description,
                signals: detail.activeIcp.signals ?? [],
                targetIndustries: detail.activeIcp.target_industries ?? [],
                targetTitles: detail.activeIcp.target_titles ?? [],
                updatedAt: detail.activeIcp.updated_at,
              }
            : null
        }
        leadStudioHref={leadStudioHref}
      />
    </Container>
  );
}
