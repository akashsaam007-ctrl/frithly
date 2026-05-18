import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/page-event";
import { CampaignApplicationForm } from "@/components/landing/campaign-application-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Container } from "@/components/ui/container";
import { APP_NAME } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Apply for a Frithly campaign. Share your ICP, commercial goals, contact preferences, and outbound constraints so we can review fit and respond with the right next step.",
  keywords: [
    "Frithly application",
    "apply for Frithly",
    "Frithly campaign application",
    "outbound intelligence application",
  ],
  path: "/apply",
  title: `Apply for a campaign | ${APP_NAME}`,
});

export default function ApplyPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,_rgba(212,98,58,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(97,146,186,0.12),_transparent_28%),linear-gradient(180deg,#050c14_0%,#07111b_42%,#050d15_100%)] py-16 sm:py-20">
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Apply for a Frithly campaign. Share your ICP, commercial goals, contact preferences, and outbound constraints so Frithly can review fit and reply with the best next step.",
          path: "/apply",
          title: `Apply for a campaign | ${APP_NAME}`,
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Apply", path: "/apply" },
        ])}
      />
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="apply-page-viewed"
        properties={{ location: "apply_page" }}
      />

      <Container className="space-y-10 sm:space-y-14">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-terracotta shadow-sm">
            Campaign application
          </span>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div className="space-y-4">
              <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl">
                Tell us what a strong Frithly rollout needs to achieve.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                Share your target market, contact expectations, and commercial constraints. We
                review every application manually before we recommend the right plan, meeting, or
                next step.
              </p>
            </div>

            <aside className="rounded-[1.9rem] border border-white/10 bg-[#0b1520]/90 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                What happens next
              </p>
              <div className="mt-5 space-y-5">
                {[
                  "We review the brief against your ICP, markets, and outbound motion.",
                  "If the fit is strong, we reply with the right rollout path or a strategy call.",
                  "If more context is needed, we come back with specific questions instead of guesswork.",
                ].map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-terracotta">
                      {index + 1}
                    </div>
                    <p className="text-base leading-8 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="rounded-[1.9rem] border border-white/10 bg-[#0b1520]/90 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-8">
          <CampaignApplicationForm />
        </section>
      </Container>
    </main>
  );
}
