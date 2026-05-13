import { LeadStudio } from "@/components/admin/lead-studio";
import { Container } from "@/components/ui/container";
import { backendApi } from "@/lib/backend-api/client";
import type { BackendCampaignRead } from "@/lib/backend-api/types";
import { getAdminLeadStudioData } from "@/lib/supabase/admin-data";

type AdminLeadStudioPageProps = {
  searchParams?: Promise<{ customer?: string }>;
};

export default async function AdminLeadStudioPage({
  searchParams,
}: AdminLeadStudioPageProps) {
  const customers = await getAdminLeadStudioData();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedCustomerId = resolvedSearchParams?.customer?.trim() ?? "";
  const initialCustomerId = customers.some((customer) => customer.id === requestedCustomerId)
    ? requestedCustomerId
    : null;
  let initialCampaigns: BackendCampaignRead[] = [];
  let initialBackendError: string | null = null;

  try {
    initialCampaigns = await backendApi.campaigns.list(24);
  } catch (error) {
    initialBackendError =
      error instanceof Error
        ? error.message
        : "The backend campaign history could not be loaded right now.";
  }

  return (
    <Container className="space-y-8 px-0">
      <LeadStudio
        customers={customers}
        initialCustomerId={initialCustomerId}
        initialBackendError={initialBackendError}
        initialCampaigns={initialCampaigns}
      />
    </Container>
  );
}
