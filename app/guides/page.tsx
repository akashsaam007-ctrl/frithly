import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { GuideDownloadForm } from "@/components/landing/guide-download-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const guideTitle = "Free Signal-Based Outbound Playbook | Frithly";
const guideDescription =
  "Download Frithly's free Signal-Based Outbound Playbook and learn how to find companies with a reason to buy before outreach starts.";

const values = [
  "Spot buying signals before your competitors do",
  "Know why an account matters now",
  "Turn timing into stronger outbound angles",
] as const;

const sneakPeek = [
  {
    body: "The commercial events worth monitoring before you build a list.",
    title: "Buying signals",
  },
  {
    body: "A simple way to decide which accounts deserve rep time.",
    title: "Scoring model",
  },
  {
    body: "A practical check to keep weak angles out of outreach.",
    title: "Manual QA",
  },
] as const;

const audience = [
  "B2B founders",
  "Agencies",
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

function GradientButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Button
      asChild
      className="h-14 rounded-[0.95rem] border-transparent bg-[linear-gradient(135deg,#ffd083_0%,#f3a0d5_52%,#9e8cff_100%)] px-7 text-[#050507] shadow-[0_18px_52px_rgba(158,140,255,0.18)] hover:brightness-[1.03] hover:text-[#050507]"
    >
      <a href={href}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </a>
    </Button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72">
      {children}
    </p>
  );
}

export default function GuidesPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_12%,rgba(255,208,131,0.08),transparent_32%),radial-gradient(circle_at_76%_18%,rgba(158,140,255,0.14),transparent_34%),linear-gradient(180deg,#050507_0%,#09070d_45%,#050507_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.08]" />

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

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(5,5,7,0.78)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Logo imageClassName="h-8 sm:h-9" priority />
          <div className="flex items-center gap-3">
            <Link className="hidden text-sm font-semibold text-white/68 transition-colors hover:text-white sm:inline-flex" href="/">
              Back to Frithly
            </Link>
            <Button
              asChild
              className="h-10 rounded-[0.85rem] border-white/[0.1] bg-white/[0.035] px-4 text-sm text-white shadow-none hover:bg-white/[0.07] hover:text-white"
              variant="secondary"
            >
              <a href="#download-guide">Get the guide</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)] lg:items-center lg:pt-24">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-transparent bg-clip-text bg-[linear-gradient(90deg,#ffd083,#f3a0d5,#9e8cff)]">
            Free field guide
          </p>
          <h1 className="mt-5 max-w-[650px] text-[3.05rem] font-semibold leading-[0.94] tracking-[-0.07em] text-white sm:text-[4.25rem] lg:text-[4.75rem]">
            Find companies with a reason to buy.
          </h1>
          <p className="mt-6 max-w-[620px] text-[1.03rem] leading-8 text-[#b7b3c5] sm:text-[1.12rem]">
            A simple guide to using buying signals, timing, and manual review to create better
            outbound conversations before the first email is sent.
          </p>

          <ul className="mt-8 space-y-3.5">
            {values.map((value) => (
              <li key={value} className="flex items-start gap-3 text-[0.98rem] text-white/82">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white shadow-[0_0_22px_rgba(158,140,255,0.16)]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{value}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <GradientButton href="#download-guide">Get the free guide</GradientButton>
            <Button
              asChild
              className="h-14 rounded-[0.95rem] border-white/[0.1] bg-white/[0.03] px-7 text-white shadow-none hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
              variant="secondary"
            >
              <Link href="/sample">Request sample</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-10 rounded-full bg-[rgba(158,140,255,0.18)] blur-3xl" />
          <Image
            alt="Frithly Signal-Based Outbound Playbook guide"
            className="relative mx-auto h-auto w-full max-w-[520px] drop-shadow-[0_42px_100px_rgba(0,0,0,0.58)]"
            height={1344}
            priority
            src="/guides/frithly-signal-playbook-book.png"
            width={1152}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {audience.map((item) => (
            <div
              key={item}
              className="rounded-[1rem] border border-white/[0.08] bg-white/[0.025] px-5 py-4 text-center text-sm font-semibold text-white/72"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.44fr_0.56fr] lg:items-start">
        <div>
          <SectionLabel>Sneak peek</SectionLabel>
          <h2 className="mt-5 text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[3rem]">
            What the guide helps you do
          </h2>
          <p className="mt-5 max-w-xl text-[1rem] leading-8 text-[#b7b3c5]">
            No giant framework dump here. The guide gives you a practical way to find better
            accounts, understand why now matters, and avoid weak outreach angles.
          </p>
        </div>

        <div className="grid gap-4">
          {sneakPeek.map((item, index) => (
            <article
              key={item.title}
              className="rounded-[1.15rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-7 text-white/58">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.48fr_0.52fr] lg:items-center">
        <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(255,208,131,0.38),rgba(243,160,213,0.28),rgba(158,140,255,0.42))] p-px">
          <div className="rounded-[1.35rem] bg-[#08070b]/95 p-6 sm:p-8">
            <Sparkles className="h-5 w-5 text-white/72" aria-hidden="true" />
            <h2 className="mt-5 text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-[2.6rem]">
              Built for teams that want better conversations, not bigger lists.
            </h2>
            <p className="mt-5 text-[0.98rem] leading-8 text-[#b7b3c5]">
              Use it to rethink targeting, spot timely account changes, and create outreach that
              has a real reason to exist.
            </p>
          </div>
        </div>
        <GuideDownloadForm />
      </section>

      <section className="mx-auto max-w-[920px] px-5 py-16 text-center sm:px-8 sm:py-20">
        <SectionLabel>Next step</SectionLabel>
        <h2 className="mt-5 text-[2.15rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-[3rem]">
          Want the framework applied to your market?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[1rem] leading-8 text-[#b7b3c5]">
          After you read the guide, Frithly can prepare a small sample of signal-qualified
          opportunities for your ICP.
        </p>
        <Button
          asChild
          className="mt-8 h-14 rounded-[0.95rem] border-white/[0.1] bg-white/[0.03] px-7 text-white shadow-none hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
          variant="secondary"
        >
          <Link href="/sample">
            Request a sample
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-center text-sm text-white/42 sm:px-8">
        Copyright 2026 Frithly. All rights reserved. <span className="mx-2 text-white/18">|</span>
        <a className="transition-colors hover:text-white" href="mailto:hello@frithly.com">
          hello@frithly.com
        </a>
      </footer>

      <CookieBanner />
    </main>
  );
}
