alter table public.campaign_applications
  add column if not exists qualification_notes text,
  add column if not exists feasibility_notes text,
  add column if not exists risk_notes text,
  add column if not exists onboarding_notes text,
  add column if not exists recommended_plan text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.campaign_applications
  drop constraint if exists campaign_applications_status_check;

alter table public.campaign_applications
  add constraint campaign_applications_status_check check (
    status in ('pending', 'reviewing', 'qualified', 'accepted', 'rejected', 'onboarding', 'active')
  );

alter table public.campaign_applications
  drop constraint if exists campaign_applications_recommended_plan_check;

alter table public.campaign_applications
  add constraint campaign_applications_recommended_plan_check check (
    recommended_plan in ('design_partner', 'starter', 'growth', 'scale') or recommended_plan is null
  );

create index if not exists idx_campaign_applications_status_created_at
  on public.campaign_applications(status, created_at desc);
