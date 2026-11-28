import { sql } from 'drizzle-orm';
import {
  boolean, date, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid,
} from 'drizzle-orm/pg-core';

const id = () => uuid('id').primaryKey().defaultRandom();
const created = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const planEnum = pgEnum('plan', ['trial', 'starter', 'pro', 'agency', 'expired']);
export const emailStatusEnum = pgEnum('email_status', ['valid', 'catch_all', 'invalid', 'unknown', 'none']);
export const oppStatusEnum = pgEnum('opp_status', ['new', 'saved', 'skipped', 'nofit', 'approved', 'sequencing', 'replied', 'meeting', 'won', 'lost']);
export const enrollStatusEnum = pgEnum('enroll_status', ['waiting_mailbox', 'active', 'paused', 'stopped', 'done']);
export const mailboxProviderEnum = pgEnum('mailbox_provider', ['smtp', 'microsoft']);

/* ---------- Auth ---------- */
export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: created(),
});

export const otpCodes = pgTable('otp_codes', {
  id: id(),
  email: text('email').notNull(),
  codeHash: text('code_hash').notNull(),
  attempts: integer('attempts').notNull().default(0),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [index('otp_email_idx').on(t.email)]);

export const sessions = pgTable('sessions', {
  /** sha256 of the cookie token */
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: created(),
});

/* ---------- Workspace ---------- */
export interface Profile {
  offer: string;
  proofPoint: string;
  industries: string[];
  sizes: string[];
  countries: string[];
  keywords: string[];
  titles: string[];
  hiringRoles: string[];
  /** Competitor product names to look for in job posts. */
  competitors?: string[];
  /** Promotion gate overrides; defaults are 60 points across 2 categories. */
  gate?: { minScore?: number; minCategories?: number; strongSingle?: number; allowCombos?: boolean; allowSingle?: boolean };
}
export interface Sending {
  signature: string;
  postalAddress: string;
  optOutLine: string;
  tz: string;
  days: number[];
  startHour: number;
  endHour: number;
}

export const workspaces = pgTable('workspaces', {
  id: id(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  plan: planEnum('plan').notNull().default('trial'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  periodEndsAt: timestamp('period_ends_at', { withTimezone: true }),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  addons: jsonb('addons').$type<Record<string, number>>().notNull().default({}),
  profile: jsonb('profile').$type<Profile>(),
  sending: jsonb('sending').$type<Sending>(),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  prefs: jsonb('prefs').$type<Prefs>().notNull().default({}),
  website: text('website'),
  createdAt: created(),
});

export interface Prefs {
  /** 'every' = approve each follow-up too; 'first' = follow-ups send on their own */
  approval?: 'every' | 'first';
  /** Signal subtypes switched off by the user */
  unwatched?: string[];
  notesClearedAt?: string;
}

export const members = pgTable('members', {
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('owner'),
}, (t) => [primaryKey({ columns: [t.workspaceId, t.userId] })]);

/* ---------- Companies, signals, contacts ---------- */
export const companies = pgTable('companies', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  name: text('name').notNull(),
  industry: text('industry'),
  size: text('size'),
  country: text('country'),
  source: text('source').notNull().default('import'),
  /** e.g. { provider: 'greenhouse', slug: 'acme' } */
  ats: jsonb('ats').$type<{ provider: 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'smartrecruiters'; slug: string } | null>(),
  githubOrg: text('github_org'),
  icpTier: text('icp_tier'),
  /** No new outreach to this company until this date. */
  cooldownUntil: timestamp('cooldown_until', { withTimezone: true }),
  isAgency: boolean('is_agency').notNull().default(false),
  siteHash: text('site_hash'),
  tech: jsonb('tech').$type<string[]>().notNull().default([]),
  lastScannedAt: timestamp('last_scanned_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex('company_ws_domain').on(t.workspaceId, t.domain)]);

export const signals = pgTable('signals', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  label: text('label').notNull(),
  detail: text('detail'),
  url: text('url'),
  fingerprint: text('fingerprint').notNull(),
  category: text('category'),
  subtype: text('subtype'),
  /** Exact quote from the job post, DNS record, certificate or headline. */
  evidence: text('evidence'),
  /** When it actually happened (publication date), which drives time decay. */
  eventDate: timestamp('event_date', { withTimezone: true }),
  baseWeight: integer('base_weight'),
  /** null = waiting for triage, true = confirmed, false = rejected as a false positive */
  verified: boolean('verified'),
  meta: jsonb('meta').$type<Record<string, string>>(),
  seenAt: timestamp('seen_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('signal_fp').on(t.workspaceId, t.fingerprint), index('signal_company').on(t.companyId)]);

export const contacts = pgTable('contacts', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role'),
  email: text('email'),
  emailStatus: emailStatusEnum('email_status').notNull().default('none'),
  linkedinUrl: text('linkedin_url'),
  phone: text('phone'),
  source: text('source'),
  createdAt: created(),
}, (t) => [index('contact_company').on(t.companyId)]);

/** Delta memory: one row each time a source's content changes for a company. Unchanged = skipped, no AI spent. */
export const snapshots = pgTable('snapshots', {
  id: id(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  source: text('source').notNull(), // ats | ats_count | dns | ssl | github | news | site
  hash: text('hash').notNull(),
  payload: jsonb('payload').$type<unknown>().notNull(),
  capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('snap_company_source').on(t.companyId, t.source, t.capturedAt)]);

/** Every job post we've seen, so we know how long roles stay open and when they're reposted. */
export const jobPostings = pgTable('job_postings', {
  id: id(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  extId: text('ext_id').notNull(),
  title: text('title').notNull(),
  location: text('location'),
  url: text('url'),
  textHash: text('text_hash'),
  postedAt: timestamp('posted_at', { withTimezone: true }),
  firstSeen: timestamp('first_seen', { withTimezone: true }).notNull().defaultNow(),
  lastSeen: timestamp('last_seen', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
}, (t) => [uniqueIndex('job_company_ext').on(t.companyId, t.extId)]);

/** Global cache of what we learned about a domain's mail server. */
export const domainMail = pgTable('domain_mail', {
  domain: text('domain').primaryKey(),
  mx: text('mx'),
  catchAll: boolean('catch_all'),
  pattern: text('pattern'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ---------- Opportunities and outreach ---------- */
export const opportunities = pgTable('opportunities', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  signalId: uuid('signal_id').references(() => signals.id, { onDelete: 'set null' }),
  score: integer('score').notNull().default(0),
  status: oppStatusEnum('status').notNull().default('new'),
  releasedOn: date('released_on'),
  activeSignals: integer('active_signals').notNull().default(0),
  combo: text('combo'),
  /** combo | single | stack: which route got it onto the list */
  promotedBy: text('promoted_by'),
  persona: text('persona'),
  hypothesis: text('hypothesis'),
  angle: text('angle'),
  evaluatedAt: timestamp('evaluated_at', { withTimezone: true }),
  /** When the user last acted on it (approve, skip), for the activity log. */
  actedAt: timestamp('acted_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [index('opp_ws_status').on(t.workspaceId, t.status), uniqueIndex('opp_ws_company').on(t.workspaceId, t.companyId)]);

export const drafts = pgTable('drafts', {
  id: id(),
  opportunityId: uuid('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  stepIndex: integer('step_index').notNull().default(0),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex('draft_opp_step').on(t.opportunityId, t.stepIndex)]);

export const sequences = pgTable('sequences', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  steps: jsonb('steps').$type<{ channel: string; day: number; brief: string; sameThread?: boolean }[]>().notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: created(),
});

export const mailboxes = pgTable('mailboxes', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  fromName: text('from_name'),
  provider: mailboxProviderEnum('provider').notNull(),
  /** host/port/secure/user for SMTP and IMAP; tenant info for Microsoft */
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  /** encrypted password or OAuth refresh token */
  secretEnc: text('secret_enc').notNull(),
  warmupStartedAt: timestamp('warmup_started_at', { withTimezone: true }).notNull().defaultNow(),
  capMax: integer('cap_max').notNull().default(40),
  sentDay: date('sent_day'),
  sentToday: integer('sent_today').notNull().default(0),
  nextSendAt: timestamp('next_send_at', { withTimezone: true }),
  status: text('status').notNull().default('active'),
  lastError: text('last_error'),
  imapCursor: integer('imap_cursor'),
  lastPolledAt: timestamp('last_polled_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex('mailbox_ws_email').on(t.workspaceId, t.email)]);

export const enrollments = pgTable('enrollments', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  sequenceId: uuid('sequence_id').notNull().references(() => sequences.id),
  mailboxId: uuid('mailbox_id').references(() => mailboxes.id, { onDelete: 'set null' }),
  stepIndex: integer('step_index').notNull().default(0),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }),
  status: enrollStatusEnum('status').notNull().default('active'),
  stoppedReason: text('stopped_reason'),
  threadMessageId: text('thread_message_id'),
  unsubToken: text('unsub_token').notNull().unique(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [index('enroll_due').on(t.status, t.nextRunAt), uniqueIndex('enroll_opp').on(t.opportunityId)]);

export const messages = pgTable('messages', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  enrollmentId: uuid('enrollment_id').references(() => enrollments.id, { onDelete: 'set null' }),
  mailboxId: uuid('mailbox_id').references(() => mailboxes.id, { onDelete: 'set null' }),
  direction: text('direction').notNull(), // 'out' | 'in'
  messageId: text('message_id'),
  /** Provider's own id (Microsoft Graph message id), used to reply in-thread. */
  providerId: text('provider_id'),
  inReplyTo: text('in_reply_to'),
  fromAddr: text('from_addr').notNull(),
  toAddr: text('to_addr').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  classification: text('classification'),
  readAt: timestamp('read_at', { withTimezone: true }),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('msg_ws_dir').on(t.workspaceId, t.direction, t.at), uniqueIndex('msg_mid').on(t.workspaceId, t.messageId)]);

export const tasks = pgTable('tasks', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').references(() => opportunities.id, { onDelete: 'cascade' }),
  enrollmentId: uuid('enrollment_id').references(() => enrollments.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // linkedin_invite | linkedin_message | call_task | custom
  title: text('title').notNull(),
  note: text('note'),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull().defaultNow(),
  doneAt: timestamp('done_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [index('task_ws_open').on(t.workspaceId, t.doneAt)]);

/** workspace_id NULL = global suppression (opt-outs shared across every workspace). */
export const suppressions = pgTable('suppressions', {
  id: id(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  reason: text('reason').notNull(),
  createdAt: created(),
}, (t) => [
  uniqueIndex('supp_ws_email').on(t.workspaceId, t.email).where(sql`${t.workspaceId} is not null`),
  uniqueIndex('supp_global_email').on(t.email).where(sql`${t.workspaceId} is null`),
]);

/** Deals pipeline: Replied → Meeting → Proposal → Won / Lost. */
export const deals = pgTable('deals', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').references(() => opportunities.id, { onDelete: 'set null' }),
  stage: text('stage').notNull().default('Replied'),
  valueUsd: integer('value_usd').notNull().default(0),
  note: text('note'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: created(),
}, (t) => [index('deal_ws').on(t.workspaceId), uniqueIndex('deal_ws_company').on(t.workspaceId, t.companyId)]);

/** Lookup credits: negative = spent, positive = refunded. Balance = plan credits + this month's sum. */
export const credits = pgTable('credits', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  delta: integer('delta').notNull(),
  reason: text('reason').notNull(),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('credit_ws_at').on(t.workspaceId, t.at)]);

export const invites = pgTable('invites', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex('invite_ws_email').on(t.workspaceId, t.email)]);

/** Companies the user looked up by hand (Find & enrich). */
export const lookups = pgTable('lookups', {
  id: id(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
});

export const usage = pgTable('usage', {
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  month: text('month').notNull(), // YYYY-MM
  opportunities: integer('opportunities').notNull().default(0),
  lookups: integer('lookups').notNull().default(0),
  aiDrafts: integer('ai_drafts').notNull().default(0),
}, (t) => [primaryKey({ columns: [t.workspaceId, t.month] })]);

export const stripeEvents = pgTable('stripe_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  createdAt: created(),
});
