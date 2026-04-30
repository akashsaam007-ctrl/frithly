export type ProofPage = {
  description: string;
  disclaimer: string;
  faqs: Array<{
    answer: string;
    question: string;
  }>;
  kicker: string;
  outcomes: Array<{
    detail: string;
    label: string;
    value: string;
  }>;
  profile: Array<{
    label: string;
    value: string;
  }>;
  relatedGuideSlugs: string[];
  relatedProofSlugs: string[];
  sections: Array<{
    body: string[];
    points?: string[];
    title: string;
  }>;
  slug: string;
  summary: string;
  title: string;
};

export const proofPages: ProofPage[] = [
  {
    slug: "founder-led-outbound-case-study",
    title: "Founder-led outbound case study: replacing list wrangling with a Monday-ready brief",
    kicker: "Composite case study",
    description:
      "A representative Frithly scenario for a founder-led SaaS team that has outbound demand but no appetite for spending every week inside Apollo, LinkedIn, and spreadsheets.",
    summary:
      "This proof page shows what changes when a founder stops treating outbound research like a side task and starts receiving a focused weekly brief instead.",
    disclaimer:
      "This is a representative Frithly scenario built from the operating patterns we design for. It illustrates the motion and the kind of change teams buy, not a quoted customer testimonial.",
    profile: [
      { label: "Company stage", value: "Seed-stage B2B SaaS" },
      { label: "Outbound owner", value: "Founder plus 1 AE" },
      { label: "Target buyer", value: "Revenue and GTM leaders" },
      { label: "Main constraint", value: "Not enough time for manual research" },
    ],
    outcomes: [
      {
        label: "Research workflow",
        value: "From ad-hoc tabs to one weekly brief",
        detail:
          "The founder stops rebuilding account research from scratch before every send.",
      },
      {
        label: "Lead prioritization",
        value: "Why-now context attached",
        detail:
          "Each account shows a commercial reason it is worth contacting now, not just that it fits the ICP.",
      },
      {
        label: "Message prep",
        value: "Opening angles included",
        detail:
          "The team starts with real first-touch direction instead of a blank page and a list export.",
      },
    ],
    sections: [
      {
        title: "Before Frithly",
        body: [
          "The founder already knew outbound could work, but the process was too expensive in attention. Every batch meant opening Apollo, checking LinkedIn, scanning recent activity, and trying to piece together a reason to reach out.",
          "The actual bottleneck was not access to names. It was the founder still acting as the research layer for the whole motion.",
        ],
        points: [
          "Lead data existed, but message confidence did not.",
          "Prospects were being contacted without enough timing context.",
          "Outbound happened in bursts instead of on a reliable weekly cadence.",
        ],
      },
      {
        title: "What Frithly changed",
        body: [
          "Frithly replaced the open-ended research workload with a Monday-ready brief of accounts, verified contacts, and why-now signals. The founder could scan the brief, decide what to send first, and keep moving.",
          "Instead of turning the founder into a part-time analyst, the workflow became review, refine, send, and learn.",
        ],
      },
      {
        title: "What the motion looks like now",
        body: [
          "The team starts the week with a smaller, sharper batch and a clear reason each account is in it. The founder still controls positioning quality, but no longer has to manufacture context account by account.",
          "That creates a healthier rhythm: fewer tabs, faster first touches, and more energy spent on the conversation itself.",
        ],
        points: [
          "One weekly batch the team can trust",
          "A clearer split between strategy and research labor",
          "A repeatable process that does not depend on founder stamina",
        ],
      },
    ],
    faqs: [
      {
        question: "Is this meant to replace Apollo completely?",
        answer:
          "Not necessarily. Some teams keep Apollo for access and use Frithly to convert raw data into a weekly outbound motion that is actually usable.",
      },
      {
        question: "Why does this matter more for founders than larger teams?",
        answer:
          "Founders feel the opportunity cost faster because every hour spent researching accounts is an hour not spent selling, hiring, or refining the product.",
      },
    ],
    relatedGuideSlugs: [
      "apollo-alternative-for-founders",
      "personalized-outbound-lead-research",
    ],
    relatedProofSlugs: [
      "small-sdr-team-outbound-case-study",
      "weekly-research-brief-case-study",
    ],
  },
  {
    slug: "small-sdr-team-outbound-case-study",
    title: "Small SDR team case study: turning inconsistent outbound into a weekly operating rhythm",
    kicker: "Composite case study",
    description:
      "A representative Frithly scenario for an early SDR team that already has tools, but still struggles to produce consistent first-touch quality every week.",
    summary:
      "This page shows how a small outbound team can use Frithly to tighten research quality, rep prep time, and weekly execution without hiring a dedicated researcher first.",
    disclaimer:
      "This is a composite scenario that reflects the type of sales team Frithly is built for. It is meant to show the operating change, not claim a specific customer's numbers.",
    profile: [
      { label: "Company stage", value: "Early-stage SaaS with 2 SDRs and 1 AE" },
      { label: "Outbound owner", value: "SDR pod with founder oversight" },
      { label: "Target buyer", value: "Sales, RevOps, and growth leaders" },
      { label: "Main constraint", value: "Inconsistent research quality between reps" },
    ],
    outcomes: [
      {
        label: "Rep prep time",
        value: "Less time lost before the first send",
        detail:
          "Reps begin with researched accounts and opener angles instead of building context from scattered tools.",
      },
      {
        label: "Weekly cadence",
        value: "Predictable Monday delivery",
        detail:
          "The team starts each week from the same quality bar, which makes coaching and execution easier.",
      },
      {
        label: "Feedback loop",
        value: "Mid-week refinement becomes possible",
        detail:
          "With a cleaner batch and clearer message logic, reply data can shape next week's targeting more quickly.",
      },
    ],
    sections: [
      {
        title: "Before Frithly",
        body: [
          "The SDR team had coverage, but not consistency. One rep might find a strong account and angle; another might work from a list that still needed another hour of context gathering.",
          "That made coaching difficult because output quality depended too heavily on who had the stronger research instincts that week.",
        ],
        points: [
          "A lot of outbound energy disappeared into prep work.",
          "Managers could review activity, but not easily standardize lead quality.",
          "The team never quite trusted the first list it started from.",
        ],
      },
      {
        title: "What Frithly changed",
        body: [
          "Frithly moved more of the research and prioritization upstream. Each week, the SDR team received a brief that already reflected account fit, timing signals, and plausible opening angles.",
          "The team still owned the final message, but it was no longer starting cold.",
        ],
      },
      {
        title: "How the rhythm improved",
        body: [
          "Because the batch quality was more consistent, coaching moved from 'find better accounts' to 'improve sequencing and replies.' That is a healthier place for a small SDR team to be.",
          "Growth-plan style refreshes also make it easier to adjust mid-week instead of waiting for the next research cycle.",
        ],
        points: [
          "Sharper Monday starts",
          "Cleaner rep-to-rep consistency",
          "A more coachable outbound system",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Frithly only useful if a team already has SDRs?",
        answer:
          "No. It works before or after SDR hiring, but small SDR teams often feel the benefit quickly because the output becomes more standardized.",
      },
      {
        question: "Does this remove the need for rep personalization?",
        answer:
          "No. It reduces the research burden and gives reps a better starting point, but the final tone and delivery still belong to the rep.",
      },
    ],
    relatedGuideSlugs: [
      "weekly-sales-prospect-research-service",
      "b2b-lead-intelligence",
    ],
    relatedProofSlugs: [
      "founder-led-outbound-case-study",
      "weekly-research-brief-case-study",
    ],
  },
  {
    slug: "weekly-research-brief-case-study",
    title: "Weekly research brief case study: creating a cleaner outbound system without hiring a researcher",
    kicker: "Composite case study",
    description:
      "A representative Frithly scenario for teams that want the benefit of a dedicated research motion before taking on another full-time GTM hire.",
    summary:
      "This proof page is about the teams that do not need another tool seat. They need a finished weekly output that shortens the distance between targeting and outreach.",
    disclaimer:
      "This case-study style page is representative rather than testimonial-based. It captures the motion Frithly is designed to support and the kinds of operating gains buyers look for.",
    profile: [
      { label: "Company stage", value: "Lean GTM team building outbound from scratch" },
      { label: "Outbound owner", value: "Founder, AE, or RevOps lead" },
      { label: "Target buyer", value: "B2B SaaS and services buyers" },
      { label: "Main constraint", value: "Research quality without adding headcount" },
    ],
    outcomes: [
      {
        label: "Hiring pressure",
        value: "Quality improves before headcount expands",
        detail:
          "Teams get a usable research layer without needing to add a dedicated internal researcher first.",
      },
      {
        label: "Weekly output",
        value: "One brief replaces scattered prep work",
        detail:
          "A shared brief becomes the operating artifact instead of a mix of notes, exports, and private tabs.",
      },
      {
        label: "Decision speed",
        value: "Easier to judge fit and scale",
        detail:
          "Because the output arrives in a consistent format, leadership can see whether the motion deserves more budget or headcount.",
      },
    ],
    sections: [
      {
        title: "Before Frithly",
        body: [
          "The team knew it needed better research quality, but hiring an internal researcher or adding another heavy tool was still hard to justify. Outbound was happening, yet the process behind it felt improvised.",
          "What the team really wanted was a clean weekly artifact it could work from and evaluate over time.",
        ],
        points: [
          "The motion was still too manual to scale confidently.",
          "There was not enough signal to know which accounts mattered now.",
          "Leadership could not easily separate data access problems from execution problems.",
        ],
      },
      {
        title: "What Frithly changed",
        body: [
          "Frithly introduced a weekly research brief that packaged account fit, signals, contacts, and messaging angles together. Instead of buying more software and hoping adoption would solve the problem, the team bought finished output.",
          "That let the GTM lead evaluate the motion on output quality and response quality, not on whether reps remembered to do the prep work.",
        ],
      },
      {
        title: "Why this matters strategically",
        body: [
          "A weekly brief is not only an execution tool. It is also a way to test whether outbound deserves more investment. If the team can improve quality and consistency first, future hiring becomes a much easier decision.",
        ],
        points: [
          "Better signal before bigger spend",
          "A repeatable artifact to review every week",
          "A simpler path from experiment to process",
        ],
      },
    ],
    faqs: [
      {
        question: "Is a weekly brief enough for teams that need scale?",
        answer:
          "For many lean teams, yes. It creates enough structure to improve results before committing to a larger internal research or SDR build-out.",
      },
      {
        question: "How is this different from outsourcing list building?",
        answer:
          "List building focuses on raw records. Frithly is designed to provide researched, prioritized, and message-aware outbound input the team can actually act on.",
      },
    ],
    relatedGuideSlugs: [
      "weekly-sales-prospect-research-service",
      "sales-intelligence-for-early-stage-saas",
    ],
    relatedProofSlugs: [
      "founder-led-outbound-case-study",
      "small-sdr-team-outbound-case-study",
    ],
  },
];

export function getProofPage(slug: string) {
  return proofPages.find((page) => page.slug === slug);
}
