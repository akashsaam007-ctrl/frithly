export type IntentGuide = {
  answer: string;
  bullets: string[];
  description: string;
  faqs: Array<{
    answer: string;
    question: string;
  }>;
  kicker: string;
  relatedSlugs: string[];
  sections: Array<{
    body: string[];
    points?: string[];
    title: string;
  }>;
  slug: string;
  title: string;
};

export const intentGuides: IntentGuide[] = [
  {
    slug: "b2b-lead-intelligence",
    title: "B2B lead intelligence for teams that need pipeline, not raw contact data",
    kicker: "Lead intelligence",
    description:
      "B2B lead intelligence is the layer between raw lead data and usable outbound pipeline. Frithly turns researched accounts, verified contacts, and why-now context into a weekly brief your team can actually work from.",
    answer:
      "B2B lead intelligence means more than finding names and email addresses. It means knowing which accounts matter now, why they matter now, and what angle gives your team a stronger first touch.",
    bullets: [
      "Researched accounts instead of bulk list exports",
      "Verified contact details with timing context",
      "Personalized opener angles attached to each lead",
      "A repeatable weekly rhythm for outbound teams",
    ],
    sections: [
      {
        title: "What makes lead intelligence different from a lead database",
        body: [
          "A lead database helps you discover contacts. Lead intelligence helps you decide who is worth contacting first and what to say when you do.",
          "That distinction matters because most outbound teams are not blocked by access to names. They are blocked by research quality, timing confidence, and the hours required to turn a list into outreach.",
        ],
        points: [
          "Lead databases optimize for access and coverage.",
          "Lead intelligence optimizes for prioritization and message quality.",
          "Teams buy intelligence when the bottleneck is execution, not data volume.",
        ],
      },
      {
        title: "Who usually needs B2B lead intelligence",
        body: [
          "Founder-led outbound teams use it when manual research is stealing selling time. Early sales teams use it when reps have tools but still lack context. Growing GTM teams use it when they need a weekly operating rhythm that feels reliable.",
        ],
        points: [
          "Founders who still carry pipeline personally",
          "SDRs and AEs who need stronger first touches",
          "Revenue operations teams trying to standardize outbound quality",
        ],
      },
      {
        title: "How Frithly approaches weekly lead intelligence",
        body: [
          "Frithly packages lead intelligence as a Monday-ready brief of researched accounts, verified contacts, and why-now signals. That makes it usable immediately, not after another round of spreadsheet cleanup.",
          "The goal is simple: reduce the distance between finding a prospect and sending a thoughtful first message.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is B2B lead intelligence just another name for lead generation?",
        answer:
          "Not really. Lead generation is broader and often volume-focused. Lead intelligence is specifically about research quality, prioritization, and message readiness.",
      },
      {
        question: "Can a team use both a database and a lead intelligence service?",
        answer:
          "Yes. Many teams keep Apollo or Sales Navigator for access, then use a lead intelligence layer to turn raw records into better weekly execution.",
      },
    ],
    relatedSlugs: [
      "personalized-outbound-lead-research",
      "weekly-sales-prospect-research-service",
    ],
  },
  {
    slug: "apollo-alternative-for-founders",
    title: "Apollo alternative for founders who need research-ready leads, not another tool to manage",
    kicker: "Founder-led outbound",
    description:
      "If you are looking for an Apollo alternative for founders, the real question is whether you need another database or a service that turns outbound research into a usable weekly brief. Frithly is built for the second case.",
    answer:
      "For founders, Apollo is useful when you want data access. It becomes painful when you also need to decide who matters this week, research the account, verify the contact, and write an opening angle yourself.",
    bullets: [
      "Less manual research before each outreach batch",
      "Less time spent stitching together Apollo, LinkedIn, and notes",
      "A clearer weekly pipeline rhythm for founder-led selling",
      "Better first touches without building a research function",
    ],
    sections: [
      {
        title: "Why founders outgrow database-first outbound",
        body: [
          "Founders usually start with whatever gives them fast access to prospects. That often means Apollo, LinkedIn, and a spreadsheet. The problem comes later: every send still needs context and cleanup.",
          "Once the founder becomes the bottleneck for message quality, tool access is no longer the hard part.",
        ],
      },
      {
        title: "What founders typically want instead",
        body: [
          "They want a short, reliable list of accounts they can believe in. They want to know why each account is relevant now. And they want to send better first messages without spending half a day researching.",
        ],
        points: [
          "A smaller, sharper batch instead of another giant list",
          "Context that supports outbound without extra tabs",
          "A repeatable weekly system that does not depend on founder energy alone",
        ],
      },
      {
        title: "Where Frithly fits as an Apollo alternative",
        body: [
          "Frithly is not trying to be a larger database. It is for founders who already know that access to contacts is not the only problem.",
          "The service works best when you still care deeply about outbound quality but do not want to personally manage every research step.",
        ],
      },
    ],
    faqs: [
      {
        question: "Should founders replace Apollo completely?",
        answer:
          "Not always. Some keep Apollo for data access and layer Frithly on top for weekly prioritization, context, and outreach-ready research.",
      },
      {
        question: "Who gets the most value from this alternative?",
        answer:
          "Founders doing outbound themselves or guiding a very small sales team usually feel the value fastest.",
      },
    ],
    relatedSlugs: [
      "sales-intelligence-for-early-stage-saas",
      "b2b-lead-intelligence",
    ],
  },
  {
    slug: "weekly-sales-prospect-research-service",
    title: "A weekly sales prospect research service for teams that want execution-ready outbound every Monday",
    kicker: "Weekly service model",
    description:
      "A weekly sales prospect research service should deliver more than names. Frithly provides researched accounts, verified contacts, signals, and message angles on a repeatable weekly cadence.",
    answer:
      "The value of a weekly prospect research service is consistency. Teams stop rebuilding research workflows from scratch every week and start working from a finished brief.",
    bullets: [
      "Monday-ready lead batches",
      "Research attached to each account",
      "A service model instead of another seat-based tool",
      "A repeatable outbound rhythm for small and growing teams",
    ],
    sections: [
      {
        title: "Why cadence matters as much as lead quality",
        body: [
          "Most outbound teams do not fail because they never find prospects. They fail because their research process is inconsistent and hard to sustain.",
          "A weekly service fixes that by turning research into a rhythm. The team knows when the next brief lands and what quality bar to expect.",
        ],
      },
      {
        title: "What a useful weekly research service should include",
        body: [
          "A useful service should not stop at account names. It should package account fit, why-now signals, verified contacts, and message angles in the same delivery.",
        ],
        points: [
          "ICP-aligned accounts",
          "Timing context and account triggers",
          "Verified contact information where available",
          "Personalized opening angles that reduce drafting time",
        ],
      },
      {
        title: "How Frithly is designed for weekly execution",
        body: [
          "Frithly is intentionally built around a weekly operating rhythm. Teams receive a Monday-ready brief, and Growth customers also get a mid-week refresh so momentum does not stall after one send.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is this better than hiring an internal researcher?",
        answer:
          "For many small teams, yes. It gives them a repeatable output without taking on another full-time role before the motion is fully proven.",
      },
      {
        question: "Does a weekly service still work if our ICP changes often?",
        answer:
          "Yes. Weekly services can work well for evolving ICPs because targeting can be refined as reply data and sales feedback come in.",
      },
    ],
    relatedSlugs: [
      "b2b-lead-intelligence",
      "personalized-outbound-lead-research",
    ],
  },
  {
    slug: "personalized-outbound-lead-research",
    title: "Personalized outbound lead research for teams that care about first-touch quality",
    kicker: "Personalized research",
    description:
      "Personalized outbound lead research means each account arrives with context, contact confidence, and a plausible opening angle. Frithly packages that work before your reps start writing.",
    answer:
      "Personalized outbound lead research is valuable because the strongest first message usually depends on timing, company context, and role-specific relevance, not just a job title and an email address.",
    bullets: [
      "Why-now context attached to each account",
      "Role-aware opener angles",
      "Fewer generic first touches",
      "Less rep time lost to manual research",
    ],
    sections: [
      {
        title: "Why personalization breaks at scale in most outbound teams",
        body: [
          "Teams often want personalization, but their workflows are still list-first. Reps get handed rows of data and told to make the message feel relevant later.",
          "That usually produces either low-volume craftsmanship or high-volume generic messaging. Neither is a great long-term system.",
        ],
      },
      {
        title: "What better personalization actually looks like",
        body: [
          "Better personalization is not adding random one-line trivia. It is understanding why the account might be worth contacting now and what angle would feel commercially relevant.",
        ],
        points: [
          "Recent hiring or GTM changes",
          "Content or positioning shifts",
          "Operational friction signals",
          "A role-specific angle tied to the account context",
        ],
      },
      {
        title: "How Frithly supports personalized outbound without slowing the team down",
        body: [
          "Frithly moves the personalization work earlier in the process. Instead of asking reps to invent context from scratch, it delivers a researched brief with angles already attached.",
        ],
      },
    ],
    faqs: [
      {
        question: "Does personalized research mean every email is fully written for us?",
        answer:
          "Not exactly. Frithly delivers opening angles and context that make drafting easier, but your team still owns the final message.",
      },
      {
        question: "Is this only useful for low-volume outbound?",
        answer:
          "No. It is especially useful when a team wants to preserve quality while gradually increasing outbound volume.",
      },
    ],
    relatedSlugs: [
      "weekly-sales-prospect-research-service",
      "b2b-lead-intelligence",
    ],
  },
  {
    slug: "sales-intelligence-for-early-stage-saas",
    title: "Sales intelligence for early-stage SaaS teams that need sharper outbound before they scale",
    kicker: "Early-stage SaaS",
    description:
      "Early-stage SaaS teams need sales intelligence that improves weekly outbound execution before they invest in a larger sales machine. Frithly is built for that stage.",
    answer:
      "For early-stage SaaS, good sales intelligence is less about buying the most data and more about helping the team learn which accounts, signals, and messages actually create traction.",
    bullets: [
      "Better weekly prospecting before hiring a large SDR team",
      "More confidence in ICP and messaging refinement",
      "A repeatable system for founder-led or early sales motion",
      "Useful research without enterprise complexity",
    ],
    sections: [
      {
        title: "What early-stage SaaS teams actually need from sales intelligence",
        body: [
          "At an early stage, the goal is rarely maximum contact coverage. The goal is learning. Teams need enough precision to discover which ICPs convert, which triggers matter, and which messaging gets responses.",
        ],
      },
      {
        title: "Why traditional sales intelligence can feel heavy too early",
        body: [
          "Some platforms assume you already have mature process, clear segmentation, and the time to work a complex stack. Many early-stage teams do not.",
          "That is why smaller teams often benefit from a service model that turns research into action without requiring another operational layer.",
        ],
      },
      {
        title: "How Frithly fits the early-stage SaaS use case",
        body: [
          "Frithly works well when the team needs to improve outbound learning loops quickly. The weekly brief gives founders and early reps a clearer starting point for testing segments, timing, and messaging.",
        ],
        points: [
          "Useful for founder-led sales and first SDR hires",
          "Useful when ICP is directionally clear but still evolving",
          "Useful when you want better signal before increasing volume",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Frithly only for SaaS companies?",
        answer:
          "No, but early-stage SaaS teams are one of the strongest fits because they often need better outbound intelligence before scaling headcount.",
      },
      {
        question: "Can this help before we have a fully locked ICP?",
        answer:
          "Yes. Many early-stage teams use the first few weeks of research and outreach to sharpen ICP rather than assume it is already perfect.",
      },
    ],
    relatedSlugs: [
      "apollo-alternative-for-founders",
      "b2b-lead-intelligence",
    ],
  },
];

export function getIntentGuide(slug: string) {
  return intentGuides.find((guide) => guide.slug === slug) ?? null;
}
