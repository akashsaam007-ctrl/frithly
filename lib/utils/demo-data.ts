export const demoCustomer = {
  companyName: "Northstar Labs",
  firstName: "Alex",
  plan: "Growth",
};

export const demoBatches = [
  {
    deliveryDate: "Monday, 28 April 2026",
    id: "batch-2026-04-28",
    leadCount: 50,
    negativeCount: 6,
    positiveCount: 18,
    verificationRate: "94%",
    verifiedEmails: 47,
  },
  {
    deliveryDate: "Monday, 21 April 2026",
    id: "batch-2026-04-21",
    leadCount: 50,
    negativeCount: 5,
    positiveCount: 16,
    verificationRate: "92%",
    verifiedEmails: 46,
  },
  {
    deliveryDate: "Monday, 14 April 2026",
    id: "batch-2026-04-14",
    leadCount: 50,
    negativeCount: 4,
    positiveCount: 15,
    verificationRate: "96%",
    verifiedEmails: 48,
  },
] as const;

export const demoLeads = [
  {
    company: "Volcano Digital",
    email: "sarah@volcano.io",
    emailStatus: "verified",
    fitScore: "Best fit",
    id: "lead-1",
    name: "Sarah Chen",
    openers: [
      'Saw you hired 4 AMs in 60 days - that is exactly when your tracking stack usually starts to break. Curious how you are handling it now?',
      "Caught your Agency Built episode on scaling onboarding. You mentioned 6 tools for deliverables - we built something that collapses that into one.",
      "Your post about juggling 6 tools to track client deliverables sounded painfully familiar. Mind if I send a 60-second loom?",
    ],
    rating: "positive",
    recommendedAngle: "Situational",
    role: "Head of Operations",
    signals: [
      "Posted about juggling 6 tools",
      "Featured on Agency Built podcast",
      "Hired 4 AMs in 60 days",
    ],
    triggerSummary: "Rapid hiring and process strain are creating immediate operational pain.",
    whyNow:
      "Just hired 4 Account Managers in the last 60 days, signalling rapid client growth right before process debt compounds.",
  },
  {
    company: "Forge Metrics",
    email: "olivia@forgemetrics.com",
    emailStatus: "verified",
    fitScore: "High signal",
    id: "lead-2",
    name: "Olivia Brooks",
    openers: [
      "Noticed you opened two RevOps roles and a CS Ops role this month - usually a sign the existing process is under pressure.",
      "Your LinkedIn note about pipeline leakage after handoff stood out. We built for exactly that gap.",
      "Congrats on the new enterprise push. Curious how you are keeping onboarding consistent as deal size climbs?",
    ],
    rating: "positive",
    recommendedAngle: "Company signal",
    role: "VP Revenue Operations",
    signals: [
      "Opened 3 ops roles",
      "Launched enterprise pricing page",
      "Posted about pipeline leakage",
    ],
    triggerSummary: "Ops hiring and enterprise expansion make the timing unusually strong.",
    whyNow:
      "Enterprise expansion and new operations hiring suggest they are actively trying to fix scale bottlenecks.",
  },
  {
    company: "Relay Partners",
    email: "mike@relaypartners.co",
    emailStatus: "risky",
    fitScore: "Solid fit",
    id: "lead-3",
    name: "Mike Patel",
    openers: [
      "Saw your team just crossed 20 consultants and added SDR capacity. How are you keeping outbound research quality high?",
      "Your post on inconsistent outreach quality hit a nerve - it is usually a research problem long before it is a messaging problem.",
      "You are hiring for demand gen and SDR roles at the same time, which usually means the top-of-funnel engine is getting rebuilt.",
    ],
    rating: "negative",
    recommendedAngle: "Content",
    role: "Director of Growth",
    signals: [
      "Hiring SDR and demand gen roles",
      "Posted about outreach quality variance",
      "Expanded consultant headcount",
    ],
    triggerSummary: "New hiring suggests a top-of-funnel rebuild with room for research support.",
    whyNow:
      "Their growth team is adding SDR capacity, which usually means lead quality becomes a blocker quickly.",
  },
] as const;

export const demoInvoices = [
  { amount: "£999.00", date: "28 Apr 2026", id: "INV-1048", status: "Paid" },
  { amount: "£999.00", date: "28 Mar 2026", id: "INV-0987", status: "Paid" },
  { amount: "£999.00", date: "28 Feb 2026", id: "INV-0901", status: "Paid" },
] as const;

export const demoAdminMetrics = {
  activeCustomers: 7,
  leadApprovalRate: "84%",
  openFeedbackIssues: 3,
  totalMrr: "£6,494",
};

export const demoAdminCustomers = [
  {
    email: "alex@northstarlabs.com",
    lastBatch: "28 Apr 2026",
    mrr: "£999",
    name: "Northstar Labs",
    plan: "Growth",
    signupDate: "05 Feb 2026",
    status: "active",
  },
  {
    email: "maya@harborworks.io",
    lastBatch: "28 Apr 2026",
    mrr: "£499",
    name: "Harbor Works",
    plan: "Starter",
    signupDate: "11 Mar 2026",
    status: "active",
  },
  {
    email: "jordan@forgeops.com",
    lastBatch: "21 Apr 2026",
    mrr: "£1,999",
    name: "ForgeOps",
    plan: "Scale",
    signupDate: "18 Jan 2026",
    status: "paused",
  },
] as const;

export const demoFeedback = [
  {
    batchDate: "28 Apr 2026",
    comment: "Great context. Option A booked two replies.",
    customer: "Northstar Labs",
    leadName: "Sarah Chen",
    rating: "positive",
  },
  {
    batchDate: "28 Apr 2026",
    comment: "Good company fit, but email was risky and bounced.",
    customer: "Northstar Labs",
    leadName: "Mike Patel",
    rating: "negative",
  },
  {
    batchDate: "21 Apr 2026",
    comment: "The enterprise trigger angle was exactly right.",
    customer: "Harbor Works",
    leadName: "Olivia Brooks",
    rating: "positive",
  },
] as const;
