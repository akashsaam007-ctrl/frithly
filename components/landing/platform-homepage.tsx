"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { platformFaqs } from "@/components/landing/platform-homepage-data";
import { ROUTES } from "@/lib/constants";
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

const primaryButtonClassName =
  "rounded-[3px] border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] px-5 text-[#241522] shadow-none hover:brightness-[1.08] hover:text-[#241522] focus-visible:ring-[#e7a6d6]";

const ghostButtonClassName =
  "rounded-[3px] border border-[#262b31] bg-transparent px-5 text-[#f3f1ea] shadow-none hover:border-[#9ba1a8] hover:bg-transparent hover:text-[#f3f1ea] focus-visible:ring-[#e7a6d6]";

const briefFields = [
  {
    label: "Company",
    note: "Website, LinkedIn company page and funding history attached in the delivered file.",
    value: "42 employees · United Kingdom · product analytics",
  },
  {
    label: "Buying signal",
    note: "No outbound function existed before this hire. Seventeen days of relevance remaining.",
    value: "First SDR role posted — three days ago",
  },
  {
    label: "Decision-maker",
    note: "Named. Confirmed in role this morning, not inherited from a database.",
    value: "Sales Director",
  },
  {
    label: "Contact",
    note: "Both checked on the day of delivery. If either fails, the opportunity is replaced.",
    value: "Live inbox, tested · direct line, not switchboard",
  },
  {
    label: "Why now",
    note: "List-building would eat the entire first month of a hire they just spent weeks recruiting. That is the opening line, and it writes itself.",
    value: "Their new rep starts in three weeks with nothing to work",
  },
  {
    label: "Outreach",
    note: "No funding-history name-drop, no compliment about their blog. The signal is the personalisation.",
    value: "Four emails, written to this trigger",
  },
  {
    label: "Source",
    note: "Every claim in this file is checkable by you. That is deliberate.",
    value: "Original job posting, cited and linked",
  },
] as const;

const triggerSignals = [
  {
    body: "Outbound just became a function. Someone starts in three weeks with no pipeline to work.",
    index: "01",
    title: "First SDR hire",
  },
  {
    body: "Capital in, targets reset. Budget moves faster than at any other point in the year.",
    index: "02",
    title: "Funding round",
  },
  {
    body: "A short window where outbound relevance spikes, then closes again.",
    index: "03",
    title: "Product launch",
  },
  {
    body: "More reps against the same sourcing. Account quality suddenly matters.",
    index: "04",
    title: "Sales expansion",
  },
  {
    body: "First ninety days. Tooling is briefly, genuinely replaceable.",
    index: "05",
    title: "New revenue lead",
  },
] as const;

const funnelRows = [
  { label: "Analytics · 40", reason: "no live trigger" },
  { label: "Security · 120", reason: "trigger 47d old" },
  { label: "Devtools · 18", reason: "headcount low" },
  { label: "Fintech · 260", reason: "outside ICP" },
  { label: "Martech · 64", reason: "no DM found" },
  { label: "Logistics · 90", reason: "already a customer" },
  { label: "HR tech · 35", reason: "trigger 62d old" },
  { label: "Payments · 150", reason: "wrong region" },
  { label: "AI infra · 22", reason: "no live trigger" },
  { label: "Insurtech · 78", reason: "outside ICP" },
  { label: "Proptech · 44", reason: "role was a backfill" },
  { label: "Data · 190", reason: "no DM found" },
  { label: "Legal · 30", reason: "trigger 51d old" },
  { label: "Cloud · 110", reason: "already a customer" },
  { label: "Commerce · 55", reason: "outside ICP" },
  { label: "Support · 82", reason: "no live trigger" },
  { label: "Observability · 26", reason: "headcount low" },
  { label: "Identity · 140", reason: "wrong region" },
  { label: "Workflow · 48", reason: "trigger 38d old" },
  { label: "Billing · 96", reason: "no DM found" },
  { label: "Search · 33", reason: "outside ICP" },
  { label: "Network · 175", reason: "already a customer" },
  { label: "CRM · 60", reason: "role was a backfill" },
  { label: "Analytics · 42", reason: "live trigger · 3d" },
] as const;

const ledgerColumns = [
  {
    foot: "You paid once for the data and a second time in reputation. The second bill arrives later and lasts longer.",
    headline: "2,000 contacts",
    highlight: false,
    rows: [
      { label: "Replies", value: "~10, at a 0.5% rate" },
      { label: "Rep hours", value: "~18 hrs cleaning, triaging, chasing bounces" },
      { label: "Accounts spent", strong: "2,000 burned", value: "for roughly 12 months" },
      { label: "Domain", value: "Bounce rate rises; every future send pays the tax" },
      { label: "Market left", value: "2,000 fewer companies you can approach cold" },
    ],
    title: "A bought list",
  },
  {
    foot: "Roughly a third of the replies for one fortieth of the market spent — and your rep keeps their week.",
    headline: "50 companies",
    highlight: true,
    rows: [
      { label: "Replies", value: "~3, at 6.2% on scored briefings" },
      { label: "Rep hours", value: "~0 spent on research; the hours go to selling" },
      { label: "Accounts spent", strong: "50 approached", value: "each with a real reason" },
      { label: "Domain", value: "Verified contacts, negligible bounce" },
      { label: "Market left", value: "1,950 companies still reachable later" },
    ],
    title: "A month of briefings",
  },
] as const;

const volumeNotes = [
  {
    body: "One rep can hold about forty real conversations a week. Handing them five hundred contacts does not raise that ceiling — it just moves their week from selling to sorting.",
    title: "A rep is the bottleneck, not the list",
  },
  {
    body: "A company emailed badly this month is unreachable for the next year, whatever changes at their end. Your addressable market is finite and non-renewable. Volume spends it fastest.",
    title: "You can only knock once",
  },
  {
    body: "Bounces and complaints follow the domain, not the campaign. Cheap data raises the cost of every message you send afterwards, including the good ones.",
    title: "Deliverability compounds",
  },
] as const;

const firstWeeks = [
  {
    body: "Thirty minutes on your ICP, your offer, and which triggers matter for your sales cycle. It is the only meeting.",
    day: "Day 1",
    title: "One call",
  },
  {
    body: "The account universe is built and the criteria are shown to you for approval before anything is sourced.",
    day: "Day 2–3",
    title: "Calibration",
  },
  {
    body: "Seven briefings with sequences. You say what's off; the criteria are retuned the same day.",
    day: "Day 7",
    title: "First delivery",
  },
  {
    body: "Eight more, adjusted. Then continue or stop — and the $750 comes off your first month.",
    day: "Day 14",
    title: "You decide",
  },
] as const;

const founderNotes = [
  "I built the sourcing pipeline, the scoring model, the verification workflow and the sending infrastructure, and I do the manual qualification on every account myself. When something is wrong with a delivery, you email me and I answer.",
  "That is the trade. There is no account manager and no 24-hour desk. What there is instead: the person who designed the standard is the person applying it, every week, to every file.",
  "Comfortable with four to five hours of overlap with US hours, and a full working day with the UK and EU.",
] as const;

const tiers = [
  {
    amount: "$1,200",
    features: ["5 briefings every Tuesday", "20 per month", "500 accounts monitored", "All five triggers"],
    highlight: false,
    name: "Signal",
    plan: "signal",
  },
  {
    amount: "$2,400",
    features: ["12 briefings every Tuesday", "50 per month", "1,500 accounts monitored", "All five triggers"],
    highlight: true,
    name: "Pipeline — most teams",
    plan: "pipeline",
  },
  {
    amount: "$3,900",
    features: ["25 briefings every Tuesday", "100 per month", "4,000 accounts monitored", "All five triggers"],
    highlight: false,
    name: "Engine",
    plan: "engine",
  },
] as const;

const trialFields = [
  {
    label: "You receive",
    note: "Verified decision-makers, live triggers, four-email sequences. The same standard as a full engagement.",
    value: "Fifteen briefings over two weeks",
  },
  {
    label: "If you continue",
    note: "So assessing the work costs nothing if we proceed together.",
    value: "The $750 is credited in full against your first month",
  },
  {
    label: "If you don't",
    note: "No clawback, no lock-in, no follow-up sequence aimed at you.",
    value: "You keep everything delivered",
  },
] as const;

const limits = [
  {
    body: "If your market produces fewer live triggers than your plan allows, we tell you and credit the difference. Loosening the criteria to hit a number would make the number meaningless.",
    title: "We won't pad a thin month.",
  },
  {
    body: "A briefing delivered to you goes to nobody else — not your competitor, not next quarter, not at a discount.",
    title: "We won't resell your accounts.",
  },
  {
    body: "Those depend on your offer, your market, your inbox health and your follow-up. We guarantee research quality, because that is the part we control.",
    title: "We won't guarantee meetings.",
  },
  {
    body: "Your sender reputation took years to build. We hand you the work; you decide what leaves your name.",
    title: "We won't send from your domains.",
  },
] as const;

function revealProps(enableMotion: boolean, delay = 0) {
  if (!enableMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 20 },
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    viewport: { amount: 0.2, once: true },
    whileInView: { opacity: 1, y: 0 },
  };
}

function SectionShell({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <section
      className={cn(
        "relative border-t border-[#1e2227] py-10 sm:py-[96px] lg:py-[120px]",
        className,
      )}
      id={id}
    >
      <Container className="relative max-w-[1180px] px-5 sm:px-8">{children}</Container>
    </section>
  );
}

function SectionHeader({
  lede,
  title,
}: {
  lede?: string;
  title: ReactNode;
}) {
  return (
    <div className="max-w-[640px]">
      <h2
        className={cn(
          displayFont.className,
          "text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#f3f1ea] sm:text-[38px]",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-3 max-w-[560px] text-[13.5px] leading-[1.55] text-[#9ba1a8] sm:mt-5 sm:text-[16px] sm:leading-[1.7]">
        {lede}
      </p>
      ) : null}
    </div>
  );
}

function DocumentPanel({
  badge,
  children,
  eyebrow,
  footnote,
  title,
}: {
  badge: string;
  children: ReactNode;
  eyebrow: string;
  footnote: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b]">
      <div className="h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#262b31] bg-[#1b1f24] px-4 py-4 sm:gap-4 sm:px-7 sm:py-5">
        <div>
          <div
            className={cn(
              monoFont.className,
              "text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]",
            )}
          >
            {eyebrow}
          </div>
          <div
            className={cn(
              displayFont.className,
              "mt-1.5 text-[18px] font-semibold leading-[1.25] text-[#f3f1ea] sm:mt-2 sm:text-[26px]",
            )}
          >
            {title}
          </div>
        </div>
        <div
          className={cn(
            monoFont.className,
            "rounded-[3px] border border-[#4bc996]/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#4bc996]",
          )}
        >
          {badge}
        </div>
      </div>
      <div className="divide-y divide-[#1e2227]">{children}</div>
      <div
        className={cn(
          monoFont.className,
          "border-t border-[#262b31] bg-[#1b1f24] px-4 py-3.5 text-[10px] leading-[1.8] tracking-[0.06em] text-[#5c636b] sm:px-7 sm:py-4 sm:text-[11px] sm:leading-[1.9] sm:tracking-[0.08em]",
        )}
      >
        {footnote}
      </div>
    </div>
  );
}

function DocumentRow({
  label,
  note,
  value,
}: {
  label: string;
  note: string;
  value: string;
}) {
  return (
    <div className="grid gap-1.5 px-4 py-4 sm:grid-cols-[0.28fr_0.72fr] sm:gap-6 sm:px-7 sm:py-5">
      <div
        className={cn(
          monoFont.className,
          "text-[11px] uppercase tracking-[0.12em] text-[#5c636b] sm:pt-1",
        )}
      >
        {label}
      </div>
      <div>
        <div className="text-[15px] leading-[1.5] text-[#f3f1ea] sm:text-[16px] sm:leading-[1.55]">{value}</div>
        <div className="mt-1.5 text-[13px] leading-[1.6] text-[#9ba1a8] sm:mt-2 sm:text-[14px] sm:leading-[1.65]">
          {note}
        </div>
      </div>
    </div>
  );
}

function DecayChart({ enableMotion }: { enableMotion: boolean }) {
  const curve = "M0,44 C120,50 220,70 330,96 C430,120 500,150 560,176";

  return (
    <svg
      aria-label="Signal value falls to zero at twenty days"
      className="mt-5 block h-auto w-full"
      role="img"
      viewBox="0 0 880 220"
    >
      <defs>
        <linearGradient id="frithly-decay" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ee9fcb" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#ee9fcb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line stroke="#262b31" strokeWidth="1" x1="0" x2="880" y1="176" y2="176" />
      <line stroke="#1e2227" strokeDasharray="2 6" strokeWidth="1" x1="0" x2="880" y1="40" y2="40" />
      <motion.path
        d={`${curve} L560,176 L0,176 Z`}
        fill="url(#frithly-decay)"
        {...(enableMotion
          ? {
              initial: { opacity: 0 },
              transition: { delay: 0.5, duration: 1.2 },
              viewport: { amount: 0.4, once: true },
              whileInView: { opacity: 1 },
            }
          : {})}
      />
      <motion.path
        d={curve}
        fill="none"
        stroke="#ee9fcb"
        strokeWidth="2.4"
        {...(enableMotion
          ? {
              initial: { pathLength: 0 },
              transition: { duration: 1.8, ease: [0.16, 1, 0.3, 1] as const },
              viewport: { amount: 0.4, once: true },
              whileInView: { pathLength: 1 },
            }
          : {})}
      />
      <line stroke="#b6abe8" strokeDasharray="3 4" strokeWidth="1" x1="560" x2="560" y1="18" y2="196" />
      <text className={monoFont.className} fill="#b6abe8" fontSize="11" x="570" y="30">
        DAY 20 — DISCARDED
      </text>
      <text className={monoFont.className} fill="#5c636b" fontSize="11" x="4" y="34">
        FULL VALUE
      </text>
      <text className={monoFont.className} fill="#5c636b" fontSize="11" x="4" y="196">
        DAY 0
      </text>
      <text className={monoFont.className} fill="#5c636b" fontSize="11" x="272" y="196">
        DAY 10
      </text>
    </svg>
  );
}

function DiscardFunnel({ enableMotion }: { enableMotion: boolean }) {
  const keptIndex = funnelRows.length - 1;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const [discarded, setDiscarded] = useState<boolean[]>(() => funnelRows.map(() => false));
  const [delivered, setDelivered] = useState(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    const node = containerRef.current;

    if (!enableMotion || !node || typeof IntersectionObserver === "undefined") {
      startedRef.current = true;
      setDiscarded(funnelRows.map((_, index) => index !== keptIndex));
      setDelivered(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || startedRef.current) {
            return;
          }

          startedRef.current = true;
          observer.disconnect();

          const order = funnelRows
            .map((_, index) => index)
            .filter((index) => index !== keptIndex)
            .sort(() => Math.random() - 0.5);

          order.forEach((index, step) => {
            timeouts.push(
              setTimeout(() => {
                setDiscarded((current) => {
                  const next = [...current];
                  next[index] = true;
                  return next;
                });
              }, 200 + step * 90),
            );
          });

          timeouts.push(setTimeout(() => setDelivered(true), 200 + order.length * 90 + 320));
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [enableMotion, keptIndex]);

  const discardedCount = discarded.filter(Boolean).length;

  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-3 gap-px border border-[#262b31] bg-[#1e2227] md:grid-cols-4 lg:grid-cols-6">
        {funnelRows.map((row, index) => {
          const isKept = index === keptIndex;
          const isOut = discarded[index];

          return (
            <div
              className={cn(
                "min-h-[58px] bg-[#14171b] p-2 transition-all duration-500 sm:min-h-[78px] sm:p-3",
                isOut && "opacity-40",
                isKept && delivered && "bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] opacity-100",
              )}
              key={row.label}
            >
              <span
                className={cn(
                  "block text-[10.5px] leading-[1.3] sm:text-[12px] sm:leading-5",
                  isKept && delivered ? "font-semibold text-[#241522]" : "text-[#9ba1a8]",
                  isOut && "line-through",
                )}
              >
                {row.label}
              </span>
              <span
                className={cn(
                  monoFont.className,
                  "mt-1 block text-[9px] uppercase leading-[1.3] tracking-[0.05em] sm:text-[10px] sm:tracking-[0.08em]",
                  isKept && delivered ? "font-medium text-[#241522]" : "text-[#e7a6d6]",
                )}
              >
                {isKept ? (delivered ? row.reason : "") : isOut ? row.reason : ""}
              </span>
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          monoFont.className,
          "mt-5 flex flex-wrap justify-between gap-4 text-[11px] uppercase tracking-[0.12em] text-[#5c636b]",
        )}
      >
        <span>
          24 surfaced · <span className="text-[#e7a6d6]">{discardedCount}</span> discarded · 1 delivered
        </span>
        <span>Reasons recorded for every one</span>
      </div>
    </div>
  );
}

function FounderPortrait() {
  const [hasPhoto, setHasPhoto] = useState(true);

  return (
    <div className="relative flex aspect-[4/5] w-full max-w-[190px] items-center justify-center overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] sm:max-w-[260px]">
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Akash Manoharan"
          className="h-full w-full object-cover grayscale-[0.2] contrast-[1.04]"
          onError={() => setHasPhoto(false)}
          src="/akash.jpg"
        />
      ) : (
        <span className={cn(displayFont.className, "text-[56px] font-semibold text-[#5c636b]")}>AM</span>
      )}
    </div>
  );
}

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
  const enableMotion = !reduceMotion;
  const closingRef = useRef<HTMLDivElement | null>(null);
  const [showActionBar, setShowActionBar] = useState(false);

  useEffect(() => {
    let scrolledPastHero = false;
    let closingVisible = false;

    const update = () => setShowActionBar(scrolledPastHero && !closingVisible);
    const onScroll = () => {
      scrolledPastHero = window.scrollY > 520;
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const node = closingRef.current;
    let observer: IntersectionObserver | undefined;

    if (node && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            closingVisible = entry.isIntersecting;
            update();
          });
        },
        { threshold: 0.2 },
      );
      observer.observe(node);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className={cn(bodyFont.className, "relative isolate overflow-hidden bg-[#0c0e11] text-[#f3f1ea]")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_78%_8%,rgba(238,159,203,0.16),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(182,171,232,0.14),transparent_26%)]" />

      <section className="relative py-12 sm:py-[96px] lg:py-[116px]">
        <Container className="relative max-w-[1180px] px-5 sm:px-8">
          <motion.div className="max-w-[760px]" {...revealProps(enableMotion, 0.02)}>
            <div
              className={cn(
                monoFont.className,
                "mb-5 text-[12px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]",
              )}
            >
              Signal-qualified outbound research · since 2024
            </div>
            <h1
              className={cn(
                displayFont.className,
                "max-w-[15ch] text-[26px] font-semibold leading-[1.15] tracking-[-0.01em] text-[#f3f1ea] sm:text-[56px]",
              )}
            >
              Your rep doesn’t need more names. They need the{" "}
              <span className="bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] bg-clip-text text-transparent">
                right week
              </span>
              .
            </h1>
            <p className="mt-3.5 max-w-[560px] text-[14px] leading-[1.6] text-[#9ba1a8] sm:mt-6 sm:text-[18px] sm:leading-[1.7]">
              We find the moment a company is ready to buy, verify the person who can say yes, and
              deliver a briefing your team can send the same day. Every Tuesday. Nothing older than
              twenty days.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <Button asChild className={primaryButtonClassName} size="lg">
                <Link href={ROUTES.BOOK_MEETING}>Start with $750</Link>
              </Button>
              <Button asChild className={ghostButtonClassName} size="lg" variant="secondary">
                <Link href="#brief">Read a real briefing</Link>
              </Button>
            </div>
            <div
              className={cn(
                monoFont.className,
                "mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#1e2227] pt-5 text-[10px] uppercase tracking-[0.1em] text-[#5c636b] sm:mt-10 sm:gap-x-7 sm:gap-y-3 sm:pt-6 sm:text-[11px] sm:tracking-[0.12em] [&_b]:font-medium [&_b]:text-[#9ba1a8]",
              )}
            >
              <span>
                Operating since <b>2024</b>
              </span>
              <span>
                <b>24</b> engagements delivered
              </span>
              <span>
                Bengaluru · <b>UK &amp; US clients</b>
              </span>
              <span>
                GDPR · <b>DPA &amp; NDA standard</b>
              </span>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 grid grid-cols-2 gap-px border border-[#262b31] bg-[#1e2227] sm:mt-12 lg:grid-cols-4"
            {...revealProps(enableMotion, 0.1)}
          >
            {[
              { key: "Reply rate, scored vs unscored", value: "rate" },
              { key: "Records verified by hand", value: "26,000" },
              { key: "Engagements delivered", value: "24" },
              { key: "Maximum signal age", value: "20 days" },
            ].map((stat) => (
              <div className="bg-[#14171b] px-4 py-5 sm:px-5 sm:py-7" key={stat.key}>
                <div className={cn(displayFont.className, "text-[20px] font-semibold leading-[1.15] text-[#f3f1ea] sm:text-[32px]")}>
                  {stat.value === "rate" ? (
                    <span>
                      <span className="text-[#5c636b] line-through">2.1%</span>{" "}
                      <span className="text-[#5c636b]">→</span>{" "}
                      <span className="text-[#e7a6d6]">6.2%</span>
                    </span>
                  ) : stat.value === "20 days" ? (
                    <span>
                      20 <span className="text-[12px] font-medium text-[#5c636b] sm:text-[16px]">days</span>
                    </span>
                  ) : (
                    stat.value
                  )}
                </div>
                <div
                  className={cn(
                    monoFont.className,
                    "mt-2 text-[9.5px] uppercase leading-[1.5] tracking-[0.1em] text-[#5c636b] sm:mt-3 sm:text-[11px] sm:tracking-[0.12em]",
                  )}
                >
                  {stat.key}
                </div>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      <SectionShell id="brief">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            lede="This is a complete briefing in the format your team receives — not a summary of one. Read it and you’ll know whether this is worth $750 better than any paragraph I could write."
            title="One company, one live reason, everything checked."
          />
        </motion.div>
        <motion.div className="mt-8 sm:mt-12" {...revealProps(enableMotion, 0.08)}>
          <DocumentPanel
            badge="Verified by hand"
            eyebrow="Opportunity FR-0417 · delivered Tuesday 09:00 · single recipient"
            footnote="Example shown in the delivered format. Client identity withheld under NDA."
            title="Series A analytics platform"
          >
            {briefFields.map((field) => (
              <DocumentRow key={field.label} label={field.label} note={field.note} value={field.value} />
            ))}
          </DocumentPanel>
        </motion.div>
      </SectionShell>

      <SectionShell id="method">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            lede="Fit tells you a company could buy. A trigger tells you they might buy now. We only work the second kind — and we throw them away after twenty days."
            title="Five triggers. And a rule that costs us volume."
          />
        </motion.div>
        <motion.div
          className="mt-6 divide-y divide-[#1e2227] overflow-hidden rounded-[10px] border border-[#262b31] bg-[#14171b] sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-4 sm:divide-y-0 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent lg:grid-cols-3 xl:grid-cols-5"
          {...revealProps(enableMotion, 0.08)}
        >
          {triggerSignals.map((signal) => (
            <div
              className="px-4 py-3.5 sm:rounded-[6px] sm:border sm:border-[#262b31] sm:bg-[#14171b] sm:p-5"
              key={signal.title}
            >
              <div className="flex items-baseline gap-2.5 sm:block">
                <span
                  className={cn(
                    monoFont.className,
                    "text-[10px] font-medium uppercase tracking-[0.12em] text-[#e7a6d6] sm:mb-4 sm:block sm:text-[11px]",
                  )}
                >
                  {signal.index}
                </span>
                <h3 className={cn(displayFont.className, "text-[15px] font-semibold text-[#f3f1ea] sm:text-[18px]")}>
                  {signal.title}
                </h3>
              </div>
              <p className="mt-1 text-[12.5px] leading-[1.5] text-[#9ba1a8] sm:mt-3 sm:text-[14px] sm:leading-[1.65]">
                {signal.body}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div className="mt-14" {...revealProps(enableMotion, 0.08)}>
          <div
            className={cn(
              monoFont.className,
              "text-[11px] uppercase tracking-[0.14em] text-[#5c636b]",
            )}
          >
            Value of a signal, by age
          </div>
          <DecayChart enableMotion={enableMotion} />
          <p className="mt-6 max-w-[600px] text-[15px] leading-[1.7] text-[#9ba1a8]">
            A funding round from March is not a weak signal — it is{" "}
            <strong className="font-semibold text-[#f3f1ea]">no signal</strong>. It tells you what was
            true in March. Vendors paid per record have every reason to keep selling it to you anyway.
          </p>
        </motion.div>
      </SectionShell>

      <SectionShell id="discard">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            lede="Every rejection carries a recorded reason, and you receive that record alongside the work. Knowing what was discarded is how you audit a researcher."
            title="One week: twenty-four found, one delivered."
          />
        </motion.div>
        <motion.div className="mt-12" {...revealProps(enableMotion, 0.08)}>
          <DiscardFunnel enableMotion={enableMotion} />
        </motion.div>
      </SectionShell>

      <SectionShell id="fewer">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            lede="Everyone compares cost per lead. Almost nobody counts what volume actually spends — which is rep hours, domain reputation, and the one resource you cannot buy more of: companies you haven’t burned yet."
            title="Volume has a bill that never appears on the invoice."
          />
        </motion.div>

        <motion.div
          className="mt-12 grid gap-px border border-[#262b31] bg-[#1e2227] lg:grid-cols-2"
          {...revealProps(enableMotion, 0.08)}
        >
          {ledgerColumns.map((column) => (
            <div className={cn("bg-[#14171b]", column.highlight && "bg-[#1b1f24]")} key={column.title}>
              <div className="border-b border-[#1e2227] px-4 py-4 sm:px-6 sm:py-6">
                <div
                  className={cn(
                    monoFont.className,
                    "text-[11px] uppercase tracking-[0.14em]",
                    column.highlight ? "text-[#e7a6d6]" : "text-[#5c636b]",
                  )}
                >
                  {column.title}
                </div>
                <div
                  className={cn(
                    displayFont.className,
                    "mt-2 text-[21px] font-semibold text-[#f3f1ea] sm:mt-3 sm:text-[30px]",
                  )}
                >
                  {column.headline}
                </div>
              </div>
              {column.rows.map((row) => (
                <div
                  className="flex items-start justify-between gap-3 border-b border-[#1e2227] px-4 py-3 sm:gap-6 sm:px-6 sm:py-4"
                  key={row.label}
                >
                  <span
                    className={cn(
                      monoFont.className,
                      "shrink-0 pt-0.5 text-[9.5px] uppercase tracking-[0.1em] text-[#5c636b] sm:pt-1 sm:text-[11px] sm:tracking-[0.12em]",
                    )}
                  >
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      "max-w-[26ch] text-right text-[12.5px] leading-[1.5] sm:text-[14px] sm:leading-[1.6]",
                      column.highlight ? "text-[#f3f1ea]" : "text-[#9ba1a8]",
                    )}
                  >
                    {"strong" in row && row.strong ? (
                      <>
                        <strong className="font-semibold text-[#e7a6d6]">{row.strong}</strong>{" "}
                      </>
                    ) : null}
                    {row.value}
                  </span>
                </div>
              ))}
              <div
                className={cn(
                  "px-4 py-4 text-[13px] leading-[1.6] sm:px-6 sm:py-5 sm:text-[14px] sm:leading-[1.7]",
                  column.highlight ? "text-[#f3f1ea]" : "text-[#9ba1a8]",
                )}
              >
                {column.foot}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
          {...revealProps(enableMotion, 0.08)}
        >
          {volumeNotes.map((note) => (
            <div key={note.title}>
              <h3 className={cn(displayFont.className, "text-[15px] font-semibold text-[#f3f1ea] sm:text-[18px]")}>
                {note.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#9ba1a8] sm:mt-3 sm:text-[14px] sm:leading-[1.7]">
                {note.body}
              </p>
            </div>
          ))}
        </motion.div>

        <p
          className={cn(
            monoFont.className,
            "mt-10 text-[11px] uppercase leading-[2] tracking-[0.12em] text-[#5c636b]",
          )}
        >
          Illustrative figures at typical cold-list rates. The 6.2% is our observed reply rate on
          scored briefings.
        </p>
      </SectionShell>

      <SectionShell id="start">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            lede="No onboarding portal, no kickoff deck, no implementation phase. This is the whole thing."
            title="Your first two weeks, in full."
          />
        </motion.div>
        <motion.div
          className="mt-12 grid gap-px border border-[#262b31] bg-[#1e2227] sm:grid-cols-2 lg:grid-cols-4"
          {...revealProps(enableMotion, 0.08)}
        >
          {firstWeeks.map((step) => (
            <div className="relative bg-[#14171b] px-4 py-5 sm:px-6 sm:py-7" key={step.day}>
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,#ee9fcb,transparent)]" />
              <div
                className={cn(
                  monoFont.className,
                  "mb-3 text-[10px] uppercase tracking-[0.12em] text-[#e7a6d6] sm:mb-4 sm:text-[11px] sm:tracking-[0.14em]",
                )}
              >
                {step.day}
              </div>
              <h3 className={cn(displayFont.className, "text-[15px] font-semibold text-[#f3f1ea] sm:text-[18px]")}>
                {step.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#9ba1a8] sm:mt-3 sm:text-[14px] sm:leading-[1.65]">
                {step.body}
              </p>
            </div>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell id="who">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            title="You should know whose judgement you’re buying."
          />
        </motion.div>
        <motion.div
          className="mt-8 grid gap-7 sm:mt-12 sm:gap-10 lg:grid-cols-[260px_1fr] lg:gap-14"
          {...revealProps(enableMotion, 0.08)}
        >
          <div>
            <FounderPortrait />
            <div
              className={cn(
                monoFont.className,
                "mt-4 text-[11px] uppercase leading-[1.9] tracking-[0.12em] text-[#5c636b]",
              )}
            >
              Akash Manoharan
              <br />
              Founder · Bengaluru, IST
              <br />
              hello@frithly.com
            </div>
          </div>
          <div className="max-w-[640px] space-y-4 sm:space-y-5">
            <p className="text-[13.5px] leading-[1.7] text-[#9ba1a8] sm:text-[15px] sm:leading-[1.75]">{founderNotes[0]}</p>
            <p className="text-[13.5px] leading-[1.7] text-[#9ba1a8] sm:text-[15px] sm:leading-[1.75]">{founderNotes[1]}</p>
            <p className="text-[13.5px] leading-[1.7] text-[#9ba1a8] sm:text-[15px] sm:leading-[1.75]">
              It is also why I cap the work at four engagements at a time.{" "}
              <strong className="font-semibold text-[#f3f1ea]">
                The volumes on this page are what one person can deliver at this standard
              </strong>{" "}
              — not what would look impressive on a pricing page. When those four are taken, you’ll be
              told rather than sold to.
            </p>
            <p className="text-[13.5px] leading-[1.7] text-[#9ba1a8] sm:text-[15px] sm:leading-[1.75]">{founderNotes[2]}</p>
          </div>
        </motion.div>
      </SectionShell>

      <SectionShell id="result">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            lede="Clients are under NDA, so no names. The numbers are ours and they are real."
            title="One engagement, anonymised."
          />
        </motion.div>
        <motion.div
          className="mt-8 rounded-[6px] border border-[#262b31] bg-[#14171b] p-5 sm:mt-12 sm:p-9"
          {...revealProps(enableMotion, 0.08)}
        >
          <p
            className={cn(
              displayFont.className,
              "text-[17px] font-semibold leading-[1.4] text-[#f3f1ea] sm:text-[26px]",
            )}
          >
            Reply rate moved from 2.1% on their previously purchased lists to 6.2% on signal-scored
            briefings — roughly a threefold lift, with no change to their offer or their sender.
          </p>
          <div className="mt-6 grid gap-4 border-t border-[#1e2227] pt-5 sm:mt-8 sm:grid-cols-3 sm:gap-6 sm:pt-7">
            {[
              { label: "Client", value: "150 employees · SaaS, USA" },
              { label: "Trigger worked", value: "Sales expansion" },
              { label: "Result", value: "2.1% → 6.2% reply rate" },
            ].map((item) => (
              <div key={item.label}>
                <div
                  className={cn(
                    monoFont.className,
                    "mb-2 text-[11px] uppercase tracking-[0.12em] text-[#5c636b]",
                  )}
                >
                  {item.label}
                </div>
                <div className="text-[15px] leading-6 text-[#f3f1ea]">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </SectionShell>

      <SectionShell id="terms">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            lede="A researcher spends roughly a third of their week finding and verifying accounts. This replaces that third — at a standard a rep building lists between calls cannot hold."
            title="Priced against a researcher, not a database."
          />
        </motion.div>

        <motion.div
          className="mt-8 grid gap-px border border-[#262b31] bg-[#1e2227] sm:mt-12 lg:grid-cols-3"
          {...revealProps(enableMotion, 0.08)}
        >
          {tiers.map((tier) => (
            <div
              className={cn(
                "flex flex-col bg-[#14171b] px-4 py-5 sm:px-6 sm:py-8",
                tier.highlight && "bg-[#1b1f24]",
              )}
              key={tier.name}
            >
              <div className="flex items-baseline justify-between gap-3 sm:block">
                <div
                  className={cn(
                    monoFont.className,
                    "text-[10px] uppercase tracking-[0.14em] sm:mb-5 sm:text-[11px]",
                    tier.highlight ? "text-[#e7a6d6]" : "text-[#5c636b]",
                  )}
                >
                  {tier.name}
                </div>
                <div className={cn(displayFont.className, "text-[24px] font-semibold text-[#f3f1ea] sm:text-[36px]")}>
                  {tier.amount}
                  <span className="ml-1 text-[12px] font-medium text-[#5c636b] sm:text-[13px]">/mo</span>
                </div>
              </div>
              <ul className="my-4 flex flex-1 flex-col gap-2 sm:my-7 sm:gap-3">
                {tier.features.map((feature) => (
                  <li className="relative pl-5 text-[13px] leading-[1.55] text-[#9ba1a8] sm:text-[14px] sm:leading-[1.6]" key={feature}>
                    <span className="absolute left-0 top-[11px] h-px w-3 bg-[#e7a6d6]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={tier.highlight ? primaryButtonClassName : ghostButtonClassName}
                size="lg"
                variant={tier.highlight ? "primary" : "secondary"}
              >
                <Link href={`${ROUTES.BOOK_MEETING}?plan=${tier.plan}`}>Enquire</Link>
              </Button>
            </div>
          ))}
        </motion.div>

        <motion.div className="mt-8" {...revealProps(enableMotion, 0.08)}>
          <DocumentPanel
            badge="No minimum term"
            eyebrow="Start here"
            footnote="Retainers: three-month minimum, plus a one-time $750 onboarding — ICP definition, trigger calibration, sequence voice matching and a deliverability review. USD. White-label terms available for agencies."
            title="A trial, before any commitment — $750"
          >
            {trialFields.map((field) => (
              <DocumentRow key={field.label} label={field.label} note={field.note} value={field.value} />
            ))}
            <div className="px-5 py-6 sm:px-7">
              <Button asChild className={primaryButtonClassName} size="lg">
                <Link href={`${ROUTES.ENQUIRE}?plan=trial`}>Start the trial</Link>
              </Button>
            </div>
          </DocumentPanel>
        </motion.div>
      </SectionShell>

      <SectionShell id="limits">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            title="What we won’t do, stated before you ask."
          />
        </motion.div>
        <motion.div
          className="mt-12 grid gap-px border border-[#262b31] bg-[#1e2227] sm:grid-cols-2"
          {...revealProps(enableMotion, 0.08)}
        >
          {limits.map((limit) => (
            <div className="bg-[#14171b] px-4 py-5 sm:px-6 sm:py-7" key={limit.title}>
              <h3 className={cn(displayFont.className, "text-[15px] font-semibold text-[#f3f1ea] sm:text-[18px]")}>
                {limit.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#9ba1a8] sm:mt-3 sm:text-[14px] sm:leading-[1.7]">
                {limit.body}
              </p>
            </div>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell id="faq">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader title="Straight answers." />
        </motion.div>
        <motion.div className="mt-10 max-w-[760px]" {...revealProps(enableMotion, 0.08)}>
          <Accordion className="space-y-0 border-y border-[#262b31]" collapsible defaultValue="faq-0" type="single">
            {platformFaqs.map((faq, index) => (
              <AccordionItem
                className="border-b border-[#1e2227] last:border-b-0"
                key={faq.question}
                value={`faq-${index}`}
              >
                <AccordionTrigger
                  className={cn(
                    displayFont.className,
                    "py-4 text-left text-[15.5px] font-semibold text-[#f3f1ea] hover:no-underline sm:py-5 sm:text-[18px]",
                  )}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[13.5px] leading-[1.65] text-[#9ba1a8] sm:pb-5 sm:text-[15px] sm:leading-[1.7]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </SectionShell>

      <SectionShell className="overflow-hidden py-14 sm:py-[120px] lg:py-[140px]" id="cta">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(238,159,203,0.12),transparent_34%),radial-gradient(circle_at_52%_52%,rgba(182,171,232,0.1),transparent_30%)]" />
        <motion.div
          className="relative mx-auto max-w-[720px] text-center"
          ref={closingRef}
          {...revealProps(enableMotion, 0.02)}
        >
          <h2
            className={cn(
              displayFont.className,
              "text-[22px] font-semibold leading-[1.2] text-[#f3f1ea] sm:text-[44px]",
            )}
          >
            Ask for one briefing on your own market.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-[1.6] text-[#9ba1a8] sm:mt-5 sm:text-[16px] sm:leading-[1.7]">
            Free, no call required. If it isn’t obviously better than the lists you’re buying now,
            that’s a useful answer too.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Button asChild className={primaryButtonClassName} size="lg">
              <Link href={ROUTES.BRIEFING}>Request a free briefing</Link>
            </Button>
            <Button asChild className={ghostButtonClassName} size="lg" variant="secondary">
              <Link href={ROUTES.BOOK_MEETING}>Start the $750 trial</Link>
            </Button>
          </div>
        </motion.div>
      </SectionShell>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-[#262b31] bg-[#0c0e11]/95 px-4 py-2.5 backdrop-blur transition-transform duration-300 sm:hidden",
          showActionBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <Button asChild className={`${primaryButtonClassName} h-11 flex-1 text-[13px]`} size="md">
          <Link href={ROUTES.BRIEFING}>Free briefing</Link>
        </Button>
        <Button
          asChild
          className={`${ghostButtonClassName} h-11 flex-1 text-[13px]`}
          size="md"
          variant="secondary"
        >
          <Link href="#terms">See plans</Link>
        </Button>
      </div>
    </div>
  );
}
