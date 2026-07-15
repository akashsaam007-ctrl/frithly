alter table sample_requests
  add column if not exists company_website text,
  add column if not exists company_sizes text[] default '{}',
  add column if not exists target_regions text[] default '{}',
  add column if not exists offer_description text,
  add column if not exists target_description text,
  add column if not exists additional_requirements text,
  add column if not exists whatsapp text,
  add column if not exists request_type text default 'personalized_sample_leads',
  add column if not exists request_id text,
  add column if not exists source text default 'website_sample_request',
  add column if not exists submitted_at timestamptz default now(),
  add column if not exists meeting_status text default 'not_scheduled',
  add column if not exists meeting_id text,
  add column if not exists meeting_time timestamptz;

alter table sample_requests
  alter column status set default 'new';

alter table sample_requests
  drop constraint if exists sample_requests_status_check;

alter table sample_requests
  add constraint sample_requests_status_check
  check (
    status in (
      'pending',
      'researching',
      'delivered',
      'converted',
      'declined',
      'new',
      'under_review',
      'sample_ready',
      'meeting_scheduled',
      'review_completed',
      'qualified',
      'not_qualified',
      'closed'
    )
  );

create unique index if not exists idx_sample_requests_request_id on sample_requests(request_id);
