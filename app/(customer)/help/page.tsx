import { HelpForm } from "@/components/customer/help-form";
import { Faq } from "@/components/landing/faq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SUPPORT_EMAIL } from "@/lib/constants";

export default function HelpPage() {
  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Help</p>
        <h1 className="text-4xl md:text-5xl">Support and onboarding</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <details className="rounded-xl border border-border p-4">
            <summary className="cursor-pointer text-base font-semibold text-ink">
              Open onboarding checklist
            </summary>
            <ul className="mt-4 space-y-2 text-muted">
              <li>1. Confirm your ICP and exclusions.</li>
              <li>2. Review Monday&apos;s top 10 leads first.</li>
              <li>3. Track which opener angles win the fastest replies.</li>
            </ul>
          </details>
        </CardContent>
      </Card>

      <Faq />

      <Card>
        <CardHeader>
          <CardTitle>Contact support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <HelpForm />
          <p className="text-sm text-muted">
            Email me directly:{" "}
            <a className="font-semibold text-terracotta underline underline-offset-4" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
