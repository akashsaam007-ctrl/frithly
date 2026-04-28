import { BatchBuilder } from "@/components/admin/batch-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getAdminBatchBuilderData } from "@/lib/supabase/admin-data";
import { getDefaultBatchDeliveryDate } from "@/lib/admin/batch-builder";

export default async function AdminBatchNewPage() {
  const customers = await getAdminBatchBuilderData();

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Batches</p>
        <h1 className="text-4xl md:text-5xl">Create a new batch</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch builder</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <BatchBuilder
            customers={customers}
            defaultDeliveryDate={getDefaultBatchDeliveryDate()}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
