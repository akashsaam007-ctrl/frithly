import type { Metadata } from "next";
import Link from "next/link";
import { PageEvent } from "@/components/analytics/page-event";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { APP_NAME, CALCOM_URL, ROUTES } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Learn what Frithly is, who it is built for, and why we focus on weekly researched leads, verified contacts, and ready-to-use outbound context for serious B2B teams.",
  keywords: [
    "about Frithly",
    "Frithly company",
    "B2B lead intelligence service",
    "weekly outbound research",
    "sales prospect research service",
  ],
  path: "/about",
  title: "About Frithly | B2B Lead Intelligence Built for Real Outbound Teams",
});

const principles = [
  {
    body: "Big lead lists are easy to buy. Useful outbound context is not. Frithly exists to close that gap.",
    title: "Signal over volume",
  },
  {
    body: "We package research so reps can use it quickly, not spend half the week cleaning and interpreting raw data.",
    title: "Research that ships",
  },
  {
    body: "The goal is not more spreadsheet rows. The goal is better conversations, faster.",
    title: "Built for action",
  },
];

const forTeams = [
  "Founder-led teams doing outbound without a full research function",
  "Small SDR teams that need better weekly lead quality",
  "Agencies and operators who need sharper prospect context before they write",
];

export default function AboutPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,_rgba(212,98,58,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(141,216,207,0.18),_transparent_28%),#faf8f5] py-16 sm:py-20">
      <StructuredData data={buildOrganizationSchema()} />
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Learn what Frithly is, who it is built for, and why we focus on weekly researched leads, verified contacts, and ready-to-use outbound context for serious B2B teams.",
          path: "/about",
          title: "About Frithly | B2B Lead Intelligence Built for Real Outbound Teams",
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="about-page-viewed"
        properties={{ location: "about_page" }}
      />

      <Container className="space-y-12 sm:space-y-16">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-terracotta shadow-sm">
              About Frithly
            </span>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl">
                We help outbound teams start the week with leads they can actually use.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                {APP_NAME} was built for teams that are tired of stitching together list tools,
                enrichment exports, manual notes, and generic messaging. We focus on researched
                accounts, verified contacts, and why-now context that helps outbound feel more
                thoughtful and more commercially useful.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href={ROUTES.SAMPLE}>Get a free sample</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={CALCOM_URL}>Talk to sales</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/80 bg-white/90 p-6 shadow-[0_24px_60px_rgba(26,26,26,0.08)] backdrop-blur">
            <div className="space-y-5">
              <div className="border-b border-border/80 pb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                  What we believe
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                  Better outbound starts before the first email.
                </h2>
              </div>
              <p className="text-base leading-8 text-muted">
                Frithly is designed around a simple idea: if the research is sharper, the message
                gets better and the pipeline gets more believable.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {principles.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-border/80 bg-white/90 p-6 shadow-[0_16px_40px_rgba(26,26,26,0.05)]"
            >
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-ink">{item.title}</h2>
              <p className="mt-3 text-base leading-8 text-muted">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 rounded-[2rem] border border-border/80 bg-ink px-6 py-8 text-white shadow-[0_24px_70px_rgba(26,26,26,0.14)] sm:px-8 sm:py-10 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta-200">
              Who it is for
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">
              Teams that want more signal, not just more rows.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-white/75">
              We are a fit when your team already knows outbound matters, but the current research
              workflow is too manual, too noisy, or too hard to turn into good messaging quickly.
            </p>
          </div>

          <div className="space-y-4">
            {forTeams.map((item) => (
              <div
                key={item}
                className="rounded-[1.35rem] border border-white/10 bg-white/5 px-5 py-4 text-base leading-7 text-white/85"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                Work with us
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-ink">
                Want to see what Frithly would look like for your team?
              </h2>
              <p className="max-w-2xl text-base leading-8 text-muted">
                Start with a sample if you want to evaluate quality first, or book a conversation
                if you already know you need a stronger outbound research engine.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href={ROUTES.SAMPLE}>Get free sample</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={CALCOM_URL}>Book intro call</Link>
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
