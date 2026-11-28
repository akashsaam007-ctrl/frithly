CREATE TABLE "job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"ext_id" text NOT NULL,
	"title" text NOT NULL,
	"location" text,
	"url" text,
	"text_hash" text,
	"posted_at" timestamp with time zone,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"source" text NOT NULL,
	"hash" text NOT NULL,
	"payload" jsonb NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "github_org" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "icp_tier" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "cooldown_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "is_agency" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "active_signals" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "combo" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "persona" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "hypothesis" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "angle" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "evaluated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "subtype" text;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "evidence" text;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "event_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "base_weight" integer;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "verified" boolean;--> statement-breakpoint
ALTER TABLE "signals" ADD COLUMN "meta" jsonb;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_company_ext" ON "job_postings" USING btree ("company_id","ext_id");--> statement-breakpoint
CREATE INDEX "snap_company_source" ON "snapshots" USING btree ("company_id","source","captured_at");