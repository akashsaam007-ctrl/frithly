import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { CampaignApplicationForm } from "@/components/landing/campaign-application-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CALCOM_URL } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const applyDescription =
  "Apply for a Frithly campaign with your ICP, geography, lead goals, contactability thresholds, and current outbound challenges.";

const nextSteps = [
  "We review fit, campaign complexity, and likely recommendation density manually.",
  "If there is a fit, we reply with the best campaign shape and next-step recommendation.",
  "Only then do we move into a live pilot, demo, or campaign buildout.",
];

const qualificationSignals = [
  "Clear ICP and geography",
  "Quality thresholds matter more than raw volume",
  "Outbound team cares about founder confidence and contactability",
  "Higher-value client work where better opportunities materially change pipeline quality",
];

export const metadata: Metadata = buildPublicMetadata({
  description: applyDescription,
  keywords: [
    "apply for outbound campaign",
    "campaign application",
    "ICP onboarding form",
    "outbound onboarding",
    "Frithly apply",
  ],
  path: "/apply",
  title: "Apply for a Campaign | Frithly",
});

export default function ApplyPage() {
  return (
    <main className="py-20 md:py-24">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Apply for a Campaign", path: "/apply" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: applyDescription,
          path: "/apply",
          title: "Apply for a Campaign | Frithly",
        })}
      />
      <PageEvent
        name="apply_flow_viewed"
        oncePerSessionKey="apply-flow-viewed"
        properties={{ location: "apply_page" }}
      />

      <Container className="grid gap-10 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-terracotta/20 bg-terracotta/10 px-4 py-2 text-sm font-semibold text-terracotta">
            Qualification-driven onboarding
          </span>

          <div className="space-y-4">
            <h1>Apply for a campaign instead of jumping into generic self-serve.</h1>
            <p className="text-muted">
              Frithly works best when the ICP, quality thresholds, and commercial constraints are
              clear up front. This application gives us enough signal to shape the right campaign
              instead of pushing everyone into the same flow.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-5 p-6 md:p-7">
              <div>
                <h2 className="text-2xl">What happens next</h2>
                <p className="mt-2 text-muted">
                  We use this information to qualify fit and map the right orchestration path.
                </p>
              </div>

              <div className="space-y-3">
                {nextSteps.map((step) => (
                  <div key={step} className="flex items-start gap-3 text-sm leading-7 text-muted">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-terracotta" aria-hidden="true" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-ink text-white">
            <CardContent className="space-y-6 p-6 md:p-7">
              <div>
                <h2 className="text-2xl text-white">Best fit signals</h2>
                <p className="mt-2 text-white/70">
                  The strongest engagements usually share a few traits.
                </p>
              </div>

              <div className="space-y-3">
                {qualificationSignals.map((signal) => (
                  <div key={signal} className="flex items-start gap-3 text-sm leading-7 text-white/75">
                    <Sparkles className="mt-1 h-4 w-4 text-terracotta" aria-hidden="true" />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-terracotta" aria-hidden="true" />
                  Prefer a walkthrough first?
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  If you want to talk through the workflow before applying, you can still book a
                  short live walkthrough.
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-5 w-full">
                  <Link href={CALCOM_URL} rel="noreferrer" target="_blank">
                    <span className="inline-flex items-center gap-2">
                      Request a live walkthrough
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="mb-8 space-y-3">
              <h2 className="text-3xl">Campaign application</h2>
              <p className="text-muted">
                Give us the ICP, the quality bar, and the commercial context. We&apos;ll take it
                from there.
              </p>
            </div>
            <CampaignApplicationForm />
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
