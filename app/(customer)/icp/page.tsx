import { IcpForm, type IcpFormValues } from "@/components/customer/icp-form";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
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

function buildInitialValues(context: Awaited<ReturnType<typeof getCurrentCustomerContext>>): {
  initialUpdatedAtLabel: string | null;
  initialValues: IcpFormValues;
} {
  const icp = context.activeIcp;

  return {
    initialUpdatedAtLabel: formatUpdatedAtLabel(icp?.updated_at ?? null),
    initialValues: {
      brandVoice: icp?.brand_voice ?? "professional",
      companySizeMax: icp?.company_size_max?.toString() ?? "",
      companySizeMin: icp?.company_size_min?.toString() ?? "",
      exclusions: icp?.exclusions?.join(", ") ?? "",
      geographies: icp?.geographies?.join(", ") ?? "",
      industries: icp?.target_industries?.join(", ") ?? "",
      productDescription: icp?.product_description ?? "",
      signals: icp?.signals?.join(", ") ?? "",
      titles: icp?.target_titles?.join(", ") ?? "",
    },
  };
}

export default async function IcpPage() {
  const context = await getCurrentCustomerContext();
  const { initialUpdatedAtLabel, initialValues } = buildInitialValues(context);

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          ICP settings
        </p>
        <h1 className="text-4xl md:text-5xl">Refine who Frithly should find for you.</h1>
      </div>
      <Card>
        <CardContent className="p-6 md:p-8">
          <IcpForm
            initialUpdatedAtLabel={initialUpdatedAtLabel}
            initialValues={initialValues}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
