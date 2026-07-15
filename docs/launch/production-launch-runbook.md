# Production Launch Runbook

## Purpose
This runbook is the source of truth for moving Frithly from local validation into controlled production launch.

Use it for:
- first production deployment
- post-deploy smoke testing
- first internal production campaign
- first pilot customer onboarding

This is intentionally biased toward safety and operational clarity over speed.

## Current launch posture
Frithly is ready for controlled pilot launch, not open self-serve scale.

Current operating assumptions:
- Google sign-in only
- onboarding is qualification-led
- SMTP remains human-gated
- outbound remains manual or semi-manual
- pilot customer count stays small

## Required preflight

### 1. Apply Supabase migrations
Run both migrations in Supabase SQL Editor, in this order:

1. [2026-05-09-add-campaign-applications.sql](</C:/Projects/lead full/lib/supabase/migrations/2026-05-09-add-campaign-applications.sql>)
2. [2026-05-09-add-campaign-application-review-fields.sql](</C:/Projects/lead full/lib/supabase/migrations/2026-05-09-add-campaign-application-review-fields.sql>)

Why both matter:
- the first creates `campaign_applications`
- the second adds review notes, recommended plan, review timestamps, and status support needed by `/admin/applications`

Do not launch production onboarding until both are applied.

### 2. Confirm auth and domain settings
Verify these before deploy:
- Supabase Google provider is enabled
- Google OAuth redirect URI includes `https://frithly.com/auth/callback`
- `NEXT_PUBLIC_APP_URL=https://frithly.com`
- login flow is Google-only
- old magic-link links fail gracefully instead of hanging

### 3. Confirm environment variables

Frontend / product shell:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `LEADGEN_BACKEND_API_URL`
- `LEADGEN_BACKEND_SHARED_SECRET`
- `EMAIL_PROVIDER=google_workspace`
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=hello@frithly.com`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL=hello@frithly.com`
- `SMTP_REPLY_TO=hello@frithly.com`
- `ADMIN_EMAIL_ALLOWLIST`

Resend fallback, only if `EMAIL_PROVIDER=resend`:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO`

Backend / intelligence engine:
- `TENANT_SHARED_SECRET`
- production database URL
- production Redis URL
- Ollama or AI runtime config, if used in production
- SMTP validation remains disabled by default until manual ops approves live use

### 4. Confirm deployment targets
- frontend: Vercel
- backend API: production host or VPS
- Celery workers: production runtime
- Redis: production
- Postgres: production

## Deployment order

### Step 1. Deploy backend
Deploy the current FastAPI backend first.

Required checks:
- health endpoint responds
- queue workers start cleanly
- beat or recurring job scheduler starts cleanly if used
- no import or migration errors

Minimum acceptance:
- `GET /health` returns success
- workers connect to Redis
- logs show no startup exceptions

### Step 2. Deploy frontend
Deploy the current `lead full` build to Vercel.

Critical frontend changes included in this release:
- Google-only login
- `/verify` compatibility fallback
- retired magic-link endpoint
- `/admin/applications` onboarding control center

After deploy:
- hard refresh production
- test in clean browser
- test in incognito

### Step 3. Verify production routing
Confirm:
- `/login` shows Google-only sign-in
- `/verify?code=...` hands off into `/auth/callback`
- `/api/auth/magic-link` returns deprecation response, not active link sending
- protected admin routes reject non-admins
- protected customer routes redirect cleanly when session is missing

## Production smoke test

Use a dedicated test email alias and label all test records clearly.

Recommended test identity pattern:
- `qa+prod-smoke@yourdomain.com`
- company name prefix: `QA Smoke - ...`

### A. Public onboarding submission
Submit a real application from `/apply`.

Suggested payload:
- industry: `SEO agencies`
- geography: `United Kingdom`
- cities: `Manchester`, `Birmingham`, `Bristol`
- lead goal: `25`
- minimum score: `70`
- required contactability: `strong`
- founder confidence minimum: `0.7`
- company size: `5-50`

Expected result:
- form submission succeeds
- row lands in `campaign_applications`
- no new fallback row lands in `sample_requests` for this submission
- confirmation email sends
- internal alert email sends

### B. Admin intake review
Log in as admin and open `/admin/applications`.

Test:
- queue loads
- selected application detail loads
- auto-generated feasibility summary appears
- risk indicators render
- note fields save
- plan recommendation can be set

Run these transitions:
1. `pending -> reviewing`
2. `reviewing -> qualified`
3. `qualified -> accepted`
4. `accepted -> onboarding`
5. `onboarding -> active`

Expected result:
- each transition succeeds
- review notes persist
- recommended plan persists
- review timestamps populate

### C. Customer record creation
At `accepted` or later:
- confirm a customer row is created or updated
- confirm customer email matches application email
- confirm plan is set
- confirm status progresses from `pending` to `active` at final activation

Expected result:
- no duplicate customer records for the same email
- company name and plan are correct

### D. Customer workspace access
Use the activated customer account.

Confirm these routes load:
- `/dashboard`
- `/campaigns`
- `/recommendations`
- `/drafts`
- `/cohorts`
- `/analytics`
- `/exports`
- `/smtp`

Expected result:
- session routing is correct
- no unauthorized redirect loops
- app shell renders

### E. Campaign creation
Create one internal production campaign through `/campaigns`.

Recommended internal validation ICP:
- industry: `SEO agencies`
- region: `United Kingdom`
- cities: `Manchester`, `Birmingham`, `Bristol`
- lead goal: `25`
- minimum score: `70`
- founder confidence minimum: `0.7`
- required contactability: `strong`

Expected result:
- campaign stores correctly
- progress renders
- no customer/workspace leakage

### F. Recommendation and draft validation
Within the campaign:
- verify recommendations load
- verify reasons render
- approve one recommendation
- generate draft
- edit and save draft

Expected result:
- draft generation works
- recommendation actions persist
- tenant-scoped data remains consistent

### G. Cohort and export validation
Create a small internal cohort.

Check:
- cohort membership renders
- readiness funnel renders
- export preview works
- CSV or JSON export downloads correctly

Expected result:
- cohort is usable
- export is scoped and formatted correctly

### H. SMTP safety validation
Do not bulk-validate.

Only test manual SMTP validation on a reviewed premium lead.

Expected result:
- manual gating works
- state renders in `/smtp`
- no uncontrolled validation behavior

## Email delivery validation

Use:
- a real recipient inbox you control
- the production domain
- Resend dashboard

Verify both:
- onboarding confirmation email
- internal application alert email

Check:
- delivery success
- spam placement
- subject line clarity
- dark/light rendering
- mobile rendering
- reply-to behavior

Minimum acceptance:
- both emails deliver
- neither lands in spam during initial controlled tests

## Internal real campaign
Run one real internal campaign before onboarding external pilots.

Goal:
- validate production orchestration under real conditions
- surface recommendation quality issues before customer-facing use

Suggested internal pass:
1. create campaign
2. wait for qualified leads
3. review recommendations
4. generate drafts
5. create cohort
6. export reviewed leads

Capture:
- campaign completion time
- recommendation density
- send-ready lead count
- any queue or worker issues

## Pilot customer onboarding
Start with 3 to 5 customers only.

Best initial fit:
- UK agencies
- SEO / PPC firms
- high-ticket service businesses
- founder-led or small GTM teams

Avoid early pilots that require:
- large outbound volumes
- highly unusual geographies
- impossible confidence thresholds
- heavy CRM customization

## Outcome tracking
Once pilots start, measure:
- bounce rate
- open rate
- reply rate
- positive reply rate
- meetings booked
- premium cohort performance
- recommendation quality by score band

This is now the main unknown.

## Go / no-go checklist
Go only if all of these are true:
- Supabase migrations applied
- Google login works in production
- `/admin/applications` works end to end
- canonical onboarding storage is active
- confirmation and alert emails deliver
- one internal production campaign succeeds
- one reviewed cohort exports cleanly

No-go if any of these are true:
- production login still hits stale `/verify` behavior
- new applications still depend on fallback storage
- admin review transitions fail
- customer activation creates duplicate or broken records
- recommendation or draft pages fail under real customer session
- outbound email delivery lands in spam during initial tests

## Cleanup after smoke test
After the production smoke test:
- delete QA applications
- delete QA customers
- remove QA campaign and cohort records if they are visible in the product
- document all defects before pilot onboarding

## Recommended next sequence
1. Apply Supabase migrations
2. Deploy frontend and backend
3. Run this smoke test completely
4. Run one internal production campaign
5. Onboard 3 to 5 pilot customers
6. Measure real outcomes before adding more major features
