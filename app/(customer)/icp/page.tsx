import { IcpForm } from "@/components/customer/icp-form";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function IcpPage() {
  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">ICP settings</p>
        <h1 className="text-4xl md:text-5xl">Refine who Frithly should find for you.</h1>
      </div>
      <Card>
        <CardContent className="p-6 md:p-8">
          <IcpForm />
        </CardContent>
      </Card>
    </Container>
  );
}
