import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { GuideDownloadForm } from "@/components/landing/guide-download-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-display",
  weight: ["600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-body",
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const guideTitle = "Free Signal-Based Outbound Playbook | Frithly";
const guideDescription =
  "Download Frithly's free Signal-Based Outbound Playbook and learn how to find companies with a reason to buy before outreach starts.";

const primaryButtonClassName =
  "rounded-[3px] border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] px-5 text-[#241522] shadow-none hover:brightness-[1.08] hover:text-[#241522] focus-visible:ring-[#e7a6d6]";

const ghostButtonClassName =
  "rounded-[3px] border border-[#262b31] bg-transparent px-5 text-[#f3f1ea] shadow-none hover:border-[#9ba1a8] hover:bg-transparent hover:text-[#f3f1ea] focus-visible:ring-[#e7a6d6]";

const values = [
  "Find companies showing a reason to buy",
  "Separate useful timing from noisy market activity",
  "Turn signals into stronger first conversations",
] as const;

const sneakPeek = [
  {
    body: "Use practical business events like hiring, funding, launches, expansion, and leadership changes to spot accounts that may have a timely reason to care.",
    title: "Buying-signal taxonomy",
  },
  {
    body: "Score accounts by fit, timing, contact quality, and outreach relevance so your team can prioritize the opportunities most likely to deserve rep time.",
    title: "Account scoring model",
  },
  {
    body: "Translate a signal into a clear, credible reason to reach out now without sounding fake, over-personalized, or generic.",
    title: "Why-now framework",
  },
  {
    body: "Pressure-test each account before outreach by checking whether the signal is fresh, the buyer is real, and the angle is strong enough to send.",
    title: "Manual QA checklist",
  },
] as const;

const guideDeliverables = [
  "A buying-signal checklist for finding accounts before competitors notice the same window.",
  "A prioritization model for ranking accounts by fit, timing, signal strength, and contact quality.",
  "A Why Now framework for turning market events into credible outbound angles.",
  "Signal-led email examples that show what to mention, what to avoid, and how to keep the message natural.",
  "A manual review checklist for removing weak accounts, stale signals, bad contacts, and forced personalization.",
  "A simple operating workflow for building smaller account sets that are easier for a sales team to work.",
] as const;

const audience = [
  "B2B founders",
  "Outbound agencies",
  "Consultants",
  "Revenue teams",
] as const;

export const metadata: Metadata = buildPublicMetadata({
  description: guideDescription,
  keywords: [
    "free outbound playbook",
    "signal based outbound guide",
    "buying signals",
    "why now outreach",
    "Frithly guide",
  ],
  path: "/guides",
  title: guideTitle,
});

function SectionShell({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <section
      className={cn(
        "relative border-t border-[#1e2227] py-[76px] sm:py-[96px] lg:py-[120px]",
        className,
      )}
      id={id}
    >
      <Container className="relative max-w-[1180px] px-5 sm:px-8">{children}</Container>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        monoFont.className,
        "mb-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]",
      )}
    >
      <span className="h-px w-8 bg-[#e7a6d6]/70" />
      {children}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  lede,
  title,
}: {
  eyebrow?: string;
  lede?: string;
  title: React.ReactNode;
}) {
  return (
    <div className="max-w-[650px]">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          displayFont.className,
          "text-[28px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#f3f1ea] sm:text-[38px]",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 max-w-[590px] text-[16px] leading-[1.7] text-[#9ba1a8]">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

function ValueCard({
  body,
  index,
  title,
}: {
  body: string;
  index: string;
  title: string;
}) {
  return (
    <article className="rounded-[6px] border border-[#262b31] bg-[#14171b] p-5 sm:p-6">
      <p
        className={cn(
          monoFont.className,
          "text-[11px] font-medium uppercase tracking-[0.12em] text-[#e7a6d6]",
        )}
      >
        {index}
      </p>
      <h3
        className={cn(
          displayFont.className,
          "mt-5 text-[18px] font-semibold leading-snug text-[#f3f1ea]",
        )}
      >
        {title}
      </h3>
      <p className="mt-3 text-[14px] leading-[1.65] text-[#9ba1a8]">{body}</p>
    </article>
  );
}

export default function GuidesPage() {
  return (
    <div
      className={cn(
        bodyFont.className,
        "relative min-h-screen overflow-hidden bg-[#0c0e11] pt-[66px] text-[#f3f1ea]",
      )}
    >
      <Navbar />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Free Guide", path: "/guides" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: guideDescription,
          path: "/guides",
          title: guideTitle,
        })}
      />

      <main className="relative isolate bg-[#0c0e11] text-[#f3f1ea]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_78%_8%,rgba(238,159,203,0.16),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(182,171,232,0.14),transparent_26%)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.08]" />

        <section className="relative py-[76px] sm:py-[96px] lg:py-[120px]">
          <Container className="relative grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-[650px]">
              <div
                className={cn(
                  monoFont.className,
                  "mb-5 text-[12px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]",
                )}
              >
                Free field guide
              </div>
              <h1
                className={cn(
                  displayFont.className,
                  "text-[36px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#f3f1ea] sm:text-[56px]",
                )}
              >
                Find companies with a reason to buy.
              </h1>
              <p className="mt-6 max-w-[610px] text-[17px] leading-[1.7] text-[#9ba1a8] sm:text-[18px]">
                A practical playbook for using buying signals, timing, and manual review to build
                better outbound conversations before the first email is sent.
              </p>

              <div className="mt-8 grid gap-3">
                {values.map((value) => (
                  <div
                    className="flex items-center gap-3 text-[15px] font-medium text-[#f3f1ea]"
                    key={value}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#4bc996]/50 text-[10px] text-[#4bc996]">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {value}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className={primaryButtonClassName} size="lg">
                  <a href="#download-guide">
                    Get the free guide
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild className={ghostButtonClassName} size="lg" variant="secondary">
                  <Link href="/briefing">Request a free briefing</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-8 rounded-full bg-[rgba(182,171,232,0.16)] blur-3xl" />
              <div className="relative overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] p-5 sm:p-7">
                <div className="h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
                <Image
                  alt="Frithly Signal-Based Outbound Playbook guide"
                  className="relative mx-auto mt-5 h-auto w-full max-w-[500px] drop-shadow-[0_42px_100px_rgba(0,0,0,0.58)]"
                  height={1344}
                  priority
                  src="/guides/frithly-signal-playbook-book.png"
                  width={1152}
                />
              </div>
            </div>
          </Container>
        </section>

        <section className="relative border-t border-[#1e2227] py-8">
          <Container className="max-w-[1180px] px-5 sm:px-8">
            <div className="grid gap-0 overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] sm:grid-cols-2 lg:grid-cols-4">
              {audience.map((item) => (
                <div
                  className={cn(
                    monoFont.className,
                    "border-b border-[#1e2227] px-5 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#9ba1a8] sm:border-r lg:border-b-0",
                  )}
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </Container>
        </section>

        <SectionShell id="guide-value">
          <div className="grid gap-10 lg:grid-cols-[0.36fr_0.64fr] lg:items-start">
            <SectionHeader
              eyebrow="What the guide helps you do"
              lede="The guide is built to help you move from broad targeting to better-timed outreach. It shows what to look for, how to judge whether a signal matters, and how to turn that context into a stronger first conversation."
              title="Use signals without making outbound feel complicated."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {sneakPeek.map((item, index) => (
                <ValueCard
                  body={item.body}
                  index={`0${index + 1}`}
                  key={item.title}
                  title={item.title}
                />
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell id="download-guide">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_0.78fr] lg:items-start">
            <div className="rounded-[6px] border border-[#262b31] bg-[#14171b] p-6 sm:p-8">
              <Sparkles className="h-5 w-5 text-[#e7a6d6]" aria-hidden="true" />
              <h2
                className={cn(
                  displayFont.className,
                  "mt-5 text-[28px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#f3f1ea] sm:text-[38px]",
                )}
              >
                What do you get?
              </h2>
              <p className="mt-5 text-[16px] leading-[1.7] text-[#9ba1a8]">
                A focused playbook your team can use before launching outbound. It gives you the
                filters, scoring logic, and messaging structure needed to find better-fit accounts,
                explain why now matters, and avoid sending weak outreach to the wrong companies.
              </p>
              <div className="mt-7 divide-y divide-[#1e2227] border-y border-[#262b31]">
                {guideDeliverables.map((item) => (
                  <div className="flex gap-3 py-4 text-[15px] leading-6 text-[#f3f1ea]" key={item}>
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#4bc996]/50 text-[10px] text-[#4bc996]">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <GuideDownloadForm />
          </div>
        </SectionShell>

        <SectionShell className="overflow-hidden py-[96px] sm:py-[120px]" id="guide-next-step">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(238,159,203,0.12),transparent_34%),radial-gradient(circle_at_52%_52%,rgba(182,171,232,0.1),transparent_30%)]" />
          <div className="relative mx-auto max-w-[720px] text-center">
            <Eyebrow>Next step</Eyebrow>
            <h2
              className={cn(
                displayFont.className,
                "text-[32px] font-semibold leading-[1.08] text-[#f3f1ea] sm:text-[44px]",
              )}
            >
              Want the framework applied to your market?
            </h2>
            <p className="mx-auto mt-5 max-w-[590px] text-[16px] leading-[1.7] text-[#9ba1a8]">
              After you read the guide, Frithly can prepare a small sample of signal-qualified
              opportunities for your ICP.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className={ghostButtonClassName} size="lg" variant="secondary">
                <Link href="/book-call">Book a 1:1 call</Link>
              </Button>
              <Button asChild className={primaryButtonClassName} size="lg">
                <Link href="/briefing">
                  Request a sample
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </SectionShell>
      </main>

      <Footer />
      <CookieBanner />
    </div>
  );
}
