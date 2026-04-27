import { BatchBuilder } from "@/components/admin/batch-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function AdminBatchNewPage() {
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
          <BatchBuilder />
        </CardContent>
      </Card>
    </Container>
  );
}
