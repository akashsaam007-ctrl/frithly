CREATE TYPE "public"."email_status" AS ENUM('valid', 'catch_all', 'invalid', 'unknown', 'none');--> statement-breakpoint
CREATE TYPE "public"."enroll_status" AS ENUM('waiting_mailbox', 'active', 'paused', 'stopped', 'done');--> statement-breakpoint
CREATE TYPE "public"."mailbox_provider" AS ENUM('smtp', 'microsoft');--> statement-breakpoint
CREATE TYPE "public"."opp_status" AS ENUM('new', 'saved', 'skipped', 'approved', 'sequencing', 'replied', 'meeting', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('trial', 'starter', 'pro', 'agency', 'expired');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"size" text,
	"country" text,
	"source" text DEFAULT 'import' NOT NULL,
	"ats" jsonb,
	"site_hash" text,
	"tech" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_scanned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"email_status" "email_status" DEFAULT 'none' NOT NULL,
	"linkedin_url" text,
	"phone" text,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_mail" (
	"domain" text PRIMARY KEY NOT NULL,
	"mx" text,
	"catch_all" boolean,
	"pattern" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"step_index" integer DEFAULT 0 NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"sequence_id" uuid NOT NULL,
	"mailbox_id" uuid,
	"step_index" integer DEFAULT 0 NOT NULL,
	"next_run_at" timestamp with time zone,
	"status" "enroll_status" DEFAULT 'active' NOT NULL,
	"stopped_reason" text,
	"thread_message_id" text,
	"unsub_token" text NOT NULL,
	"started_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enrollments_unsub_token_unique" UNIQUE("unsub_token")
);
--> statement-breakpoint
CREATE TABLE "mailboxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"from_name" text,
	"provider" "mailbox_provider" NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret_enc" text NOT NULL,
	"warmup_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cap_max" integer DEFAULT 40 NOT NULL,
	"sent_day" date,
	"sent_today" integer DEFAULT 0 NOT NULL,
	"next_send_at" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"last_error" text,
	"imap_cursor" integer,
	"last_polled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	CONSTRAINT "members_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"enrollment_id" uuid,
	"mailbox_id" uuid,
	"direction" text NOT NULL,
	"message_id" text,
	"provider_id" text,
	"in_reply_to" text,
	"from_addr" text NOT NULL,
	"to_addr" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"classification" text,
	"read_at" timestamp with time zone,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"contact_id" uuid,
	"signal_id" uuid,
	"score" integer DEFAULT 0 NOT NULL,
	"status" "opp_status" DEFAULT 'new' NOT NULL,
	"released_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"steps" jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"detail" text,
	"url" text,
	"fingerprint" text NOT NULL,
	"seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid,
	"email" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"enrollment_id" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage" (
	"workspace_id" uuid NOT NULL,
	"month" text NOT NULL,
	"opportunities" integer DEFAULT 0 NOT NULL,
	"lookups" integer DEFAULT 0 NOT NULL,
	"ai_drafts" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_workspace_id_month_pk" PRIMARY KEY("workspace_id","month")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"plan" "plan" DEFAULT 'trial' NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"period_ends_at" timestamp with time zone,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"addons" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"profile" jsonb,
	"sending" jsonb,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_sequence_id_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."sequences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_mailbox_id_mailboxes_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailboxes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_mailbox_id_mailboxes_id_fk" FOREIGN KEY ("mailbox_id") REFERENCES "public"."mailboxes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signals" ADD CONSTRAINT "signals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppressions" ADD CONSTRAINT "suppressions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "company_ws_domain" ON "companies" USING btree ("workspace_id","domain");--> statement-breakpoint
CREATE INDEX "contact_company" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "draft_opp_step" ON "drafts" USING btree ("opportunity_id","step_index");--> statement-breakpoint
CREATE INDEX "enroll_due" ON "enrollments" USING btree ("status","next_run_at");--> statement-breakpoint
CREATE UNIQUE INDEX "enroll_opp" ON "enrollments" USING btree ("opportunity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mailbox_ws_email" ON "mailboxes" USING btree ("workspace_id","email");--> statement-breakpoint
CREATE INDEX "msg_ws_dir" ON "messages" USING btree ("workspace_id","direction","at");--> statement-breakpoint
CREATE UNIQUE INDEX "msg_mid" ON "messages" USING btree ("workspace_id","message_id");--> statement-breakpoint
CREATE INDEX "opp_ws_status" ON "opportunities" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "opp_ws_company" ON "opportunities" USING btree ("workspace_id","company_id");--> statement-breakpoint
CREATE INDEX "otp_email_idx" ON "otp_codes" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "signal_fp" ON "signals" USING btree ("workspace_id","fingerprint");--> statement-breakpoint
CREATE INDEX "signal_company" ON "signals" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "supp_ws_email" ON "suppressions" USING btree ("workspace_id","email") WHERE "suppressions"."workspace_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "supp_global_email" ON "suppressions" USING btree ("email") WHERE "suppressions"."workspace_id" is null;--> statement-breakpoint
CREATE INDEX "task_ws_open" ON "tasks" USING btree ("workspace_id","done_at");