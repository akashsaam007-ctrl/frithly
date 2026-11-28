# Frithly

Signal-to-meeting outbound for small B2B teams. Frithly watches companies for buying signals, finds the right person and a verified email, writes a first email that passes an 11-point check, and sends it with follow-ups only after the user approves.

## What's in milestone 1

| Area | What it does | Where |
|---|---|---|
| Sign-in | Email + 6-digit code, no passwords. 5 codes/hour, 5 tries/code, 30-day sessions | `apps/web/lib/auth.ts` |
| Onboarding | Offer, proof point, target titles, hiring roles, companies to watch, postal address, opt-out line, time zone | `apps/web/app/onboarding` |
| Signal collectors (in-house) | Job boards with full descriptions (Greenhouse, Lever, Ashby, Workable, SmartRecruiters), DNS (vendor TXT verifications, MX gateway, SPF senders), certificate logs (crt.sh subdomains), GitHub public repo dependencies, Hacker News launches, Google News boolean queries (leadership, compliance, funding/expansion, layoffs), pricing page changes. Polite: robots.txt, 1.5 s per host | `packages/engine/src/scanners` |
| Delta memory | Every source is hashed per company (`snapshots`); unchanged content is skipped and costs no AI. DNS, certificates and GitHub use the first scan as a baseline. Every job post is tracked (`job_postings`) for open-days and reposts | `apps/worker/src/jobs/scan.ts` |
| Scoring engine | Base weights (tech removal / competitor in job post 45, new leader 40, first-in-function or migration 35, stale 45+ day role 30, compliance/SSO/enterprise AE 30, funding/new region 25, new api/docs/status subdomain 20…), time decay (1.0 ≤7d, 0.65 ≤21d, 0.35 ≤45d, then 0), strongest instance per subtype only. An account qualifies by any of three routes, each configurable per workspace: a known signal combo (7 patterns), one strong signal (≥35 decayed points, i.e. a fresh new leader, competitor in a job post, dropped tool, first hire or migration), or a stack of ≥60 points across ≥2 categories in 45 days. Suppression: layoffs, >40% drop in open roles in 14 days, staffing agencies, 45-day cooldown after emailing or skipping | `packages/core/src/scoring.ts` |
| Triage | Text signals (job posts, headlines) start unverified; one Claude Haiku call per company checks only the new ones for false positives and staffing agencies | `packages/engine/src/ai.ts` |
| Persona routing | Four signal combos (sales leader + team buildout, compliance/SSO + enterprise AE, competitor + stale role, new region + regional hire) map to a problem owner, hypothesis and angle; Claude grounds them in the evidence and the user's offer. The user's own buyer titles still win when choosing the contact | `scoring.ts`, `ai.ts` |
| Discovery (optional) | Companies hiring for the user's roles via TheirStack, when the user's own list runs low | `scanners/discover.ts` |
| People finder | Team/about pages → Claude Haiku extracts names and titles → best match for target titles | `packages/engine/src/people.ts` |
| Email finder (in-house) | 12 name patterns → MX lookup → one SMTP session with catch-all test → stop at first hit. Learned pattern cached per domain. Optional Prospeo fallback for catch-all domains | `packages/engine/src/verify.ts` |
| Drafts | Claude Sonnet writes from the signal stack, hypothesis and angle; problem-first, under 75 words, never mentions DNS, certificates or code (no surveillance tone); the 11-point check runs and failed checks are fed back for up to two rewrites | `packages/engine/src/ai.ts` |
| Daily list | Released each morning in the user's time zone. Trial: 100 companies in 5 drops over 14 days | `apps/worker/src/jobs/release.ts` |
| Review + approve | Live 11-point check in the browser; the server re-checks before approving | `apps/web/app/app/o/[id]` |
| Sequencer (in-house) | Email + LinkedIn + call steps. Warm-up ramp 10 → 40/day per mailbox, sending window, 4–9 min spacing, same-thread follow-ups, sticky mailbox per thread | `apps/worker/src/jobs/send.ts` |
| Mailboxes | SMTP/IMAP (Google Workspace app password, Zoho, any host) and Microsoft 365 via OAuth (Graph). Secrets AES-256-GCM encrypted | `packages/engine/src/mail.ts` |
| Replies | Polled every 5 min, matched by thread headers, classified (rules first, Claude only if unclear). Any reply stops follow-ups; "no" → do-not-contact; opt-out → global list; out-of-office → push 5 days; bounce → email marked invalid | `apps/worker/src/jobs/poll.ts` |
| Compliance | Footer with signature, opt-out line and postal address on every email; `List-Unsubscribe` + one-click (RFC 8058); global suppression list | `packages/core/src/compliance.ts`, `apps/web/app/u` |
| LinkedIn | Assisted: sequence steps become tasks with the profile link. No automation in milestone 1 | `apps/web/app/app/tasks` |
| Billing | Stripe Checkout (Starter $49, Pro $149, yearly $490/$1,490), 20% off the first month via a once-only coupon, add-ons as subscription items, webhook sync, customer portal | `apps/web/lib/billing.ts` |

Not in milestone 1: Gmail OAuth (needs Google's restricted-scope review and a CASA assessment; Google Workspace users connect with an app password for now), LinkedIn automation via Unipile ($29 add-on), CRM sync, team seats UI, multi-client workspaces.

## The app

The signed-in app follows the workspace reference design: a sidebar with counts and a usage meter, a top bar with search (⌘K), notifications and per-page actions, and a company drawer.

| Section | What it does |
|---|---|
| **Today** | The daily list. Road-to-first-meeting steps, filters by kind of signal, timing (Act today / This week / Soon), fit score, Approve / Skip / Not a fit (with Undo), **Approve top 5**, J/K/A/S/N keys. The drawer has **Draft** (live 11-point check, follow-ups waiting for approval, rewrite), **Signals** (points, decay, days left), **People** (use another contact, find email) and **Activity**. |
| **Inbox** | Replies grouped by type (Interested, Not now, Out of office, Not interested, Bounced). Thread view, suggested reply sent in-thread from your mailbox, Book a meeting, Snooze to a task, Move to deals, why you wrote. |
| **Companies** | Every account plus watched companies with no signal yet; search, status filters, the same drawer, Look up now. |
| **People** | Everyone found on team pages; copy email or find it for 1 credit. |
| **Deals** | Kanban (Replied → Meeting → Proposal → Won / Lost) with drag and drop, values, notes, 14-day stale flags. |
| **Tasks** | LinkedIn steps, calls, follow-ups to approve and your own tasks. |
| **Find & enrich** | Look up one company or a list (credits shown before charging), add to the free daily watchlist, recent lookups. |
| **Outreach** | Sequence editor (channels, days, what each step says), mailboxes with warm-up and SPF/DKIM/DMARC checks, approval mode (every email / first only), what's up next. |
| **Analytics** | Companies contacted, emails, replies, meetings, won deals; weekly chart; reply rate by signal. All from your own data. |
| **Integrations** | Microsoft 365 mailbox, CSV/JSON export. HubSpot, Pipedrive, Salesforce, Calendar, Slack, Zapier are marked coming soon. |
| **Settings** | Profile and sending details, signal settings (gate, competitors, roles, per-signal watch), do-not-contact, team invites, data export. |
| **Billing** | Plans with first-month offer and yearly, add-ons, credit history, Stripe portal. |

Onboarding is four steps: website (we read your site to fill in what you sell), who you sell to, moments to watch, and sending details plus mailbox.

## Layout

```
apps/web       Next.js 16 app (Vercel)
apps/worker    Background jobs on pg-boss (VPS; needs outbound port 25)
packages/core  Plans, 11-point check, email patterns, crypto, scheduling, compliance (no I/O)
packages/db    Drizzle schema + migrations (Postgres)
packages/engine Scanners, SMTP verifier, Claude, mail send/read
infra          Worker Dockerfile and compose file
```

## Run locally

```bash
pnpm install
cp .env.example .env            # fill DATABASE_URL, ENCRYPTION_KEY, ANTHROPIC_API_KEY at least
export $(grep -v '^#' .env | xargs)
pnpm db:migrate
pnpm --filter @frithly/web dev   # http://localhost:3000 — sign-in codes print to this log
pnpm --filter @frithly/worker dev
```

Tests: `pnpm test` (add `TEST_DATABASE_URL` pointing at a separate database whose name contains `test`, e.g. `frithly_test`; the integration tests wipe it and refuse any other name).

## Go live: step by step

1. **Database.** Create a Supabase (or Neon) project in a region near your users. Copy the *direct* connection string (port 5432) into `DATABASE_URL`.
2. **Secrets.** `openssl rand -base64 32` → `ENCRYPTION_KEY`. Use the same value on Vercel and the VPS. If it changes, every connected mailbox must reconnect.
3. **VPS for the worker.** Hetzner or OVH, smallest instance is enough to start. Ask support to unblock outbound port 25 (Hetzner requires a request after the first paid invoice). Set the server's reverse DNS (PTR) to the hostname in `VERIFY_HELO` and add an A record for it. Use a separate domain for `VERIFY_FROM`.
   ```bash
   git clone <this repo> && cd frithly && cp .env.example .env && nano .env
   docker compose -f infra/docker-compose.yml up -d --build
   docker compose -f infra/docker-compose.yml logs -f
   ```
   The worker applies migrations on start.
4. **Web app on Vercel.** Import the repo, set **Root Directory = `apps/web`** (Vercel detects the pnpm workspace), add the env vars, deploy. Point `app.frithly.com` at it and set `APP_URL`.
5. **Sign-in email.** Create a Resend (or Postmark) account, verify `frithly.com`, put the SMTP details in `SYSTEM_SMTP_*`.
6. **Stripe.** Create products and prices: Starter $49/mo and $490/yr, Pro $149/mo and $1,490/yr, add-ons (opportunities $39, mailbox $6, seat $9, phones $49, all monthly). Create a coupon: 20% off, duration *once*. Add a webhook to `$APP_URL/api/stripe/webhook` for `checkout.session.completed` and `customer.subscription.*`. Turn on the customer portal.
7. **Microsoft 365 mailboxes.** In Azure → App registrations: multi-tenant + personal accounts, redirect URI `$APP_URL/api/mailbox/microsoft/callback`, delegated permissions `Mail.Send`, `Mail.ReadWrite`, `User.Read`, `offline_access`, then a client secret. Put them in `MS_CLIENT_ID` / `MS_CLIENT_SECRET`. Publisher verification avoids the "unverified" warning.
8. **Anthropic.** Create an API key and set a monthly spend limit in the console.
9. **Smoke test.** Sign up with your own email, add 10 companies you know, connect a test mailbox, approve one email to yourself, reply "no" and check it lands in Do not contact.

## Operating notes

- **Deliverability:** tell users to send from a separate domain (e.g. `trybrightline.com`) with SPF, DKIM and DMARC. The worker caps each mailbox by warm-up day; keep `ALLOW_CATCH_ALL=0` until bounce rates are known.
- **SMTP verification etiquette:** one session per domain per lookup, stops at the first valid address, results cached in `domain_mail`. Some providers (Microsoft 365, Google) return "valid" for everything or rate-limit; those come back as catch-all or unknown and are never sent to by default.
- **Costs to watch:** Claude (Sonnet drafts, up to 3 attempts each; Haiku for extraction and reply sorting), optional Prospeo/TheirStack, Stripe fees.
- **Logs:** the worker writes one JSON line per event (`scope`, `msg`). Check `mailboxes.last_error` for connection problems.
