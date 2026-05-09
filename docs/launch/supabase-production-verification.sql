-- Frithly production verification queries
-- Run these in Supabase SQL Editor during production rollout and smoke testing.

-- 1. Confirm canonical onboarding table exists.
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'campaign_applications';

-- 2. Confirm review fields exist for /admin/applications.
select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'campaign_applications'
  and column_name in (
    'qualification_notes',
    'feasibility_notes',
    'risk_notes',
    'onboarding_notes',
    'recommended_plan',
    'reviewed_at',
    'updated_at'
  )
order by column_name;

-- 3. Confirm the allowed application statuses are being used.
select
  status,
  count(*) as application_count
from public.campaign_applications
group by status
order by application_count desc, status asc;

-- 4. Inspect the most recent onboarding submissions.
select
  id,
  created_at,
  reviewed_at,
  updated_at,
  full_name,
  email,
  company,
  industry,
  status,
  recommended_plan
from public.campaign_applications
order by created_at desc
limit 25;

-- 5. Confirm canonical onboarding is being used instead of fallback sample requests.
select
  count(*) as fallback_campaign_application_rows
from public.sample_requests
where notes ilike '%campaign_application_fallback%';

-- 6. Inspect recent fallback rows directly.
select
  id,
  created_at,
  email,
  company,
  status,
  left(notes, 300) as notes_preview
from public.sample_requests
where notes ilike '%campaign_application_fallback%'
order by created_at desc
limit 25;

-- 7. See application-to-customer linkage by email.
select
  a.created_at as application_created_at,
  a.email,
  a.company,
  a.status as application_status,
  a.recommended_plan,
  c.id as customer_id,
  c.plan as customer_plan,
  c.status as customer_status,
  c.signup_date,
  c.updated_at as customer_updated_at
from public.campaign_applications a
left join public.customers c
  on lower(c.email) = lower(a.email)
order by a.created_at desc
limit 50;

-- 8. Find accepted or active applications without a linked customer record.
select
  a.id,
  a.created_at,
  a.email,
  a.company,
  a.status,
  a.recommended_plan
from public.campaign_applications a
left join public.customers c
  on lower(c.email) = lower(a.email)
where a.status in ('accepted', 'onboarding', 'active')
  and c.id is null
order by a.created_at desc;

-- 9. Find duplicate customer rows by email.
select
  lower(email) as normalized_email,
  count(*) as duplicate_count,
  array_agg(id order by created_at asc) as customer_ids
from public.customers
group by lower(email)
having count(*) > 1
order by duplicate_count desc, normalized_email asc;

-- 10. Confirm admin role bootstrap or persisted admin rows.
select
  email,
  role,
  plan,
  status,
  signup_date
from public.customers
where role = 'admin'
order by signup_date desc nulls last, created_at desc nulls last;

-- 11. Review the newest QA or smoke-test applications quickly.
select
  id,
  created_at,
  full_name,
  email,
  company,
  status,
  recommended_plan,
  reviewed_at
from public.campaign_applications
where lower(email) like 'qa+%'
   or company ilike 'QA %'
order by created_at desc;

-- 12. Review the newest QA or smoke-test customers.
select
  id,
  email,
  company_name,
  role,
  plan,
  status,
  signup_date,
  updated_at
from public.customers
where lower(email) like 'qa+%'
   or company_name ilike 'QA %'
order by signup_date desc nulls last, created_at desc nulls last;

-- 13. Cleanup helper for QA campaign applications.
-- Uncomment only when you explicitly want to remove QA rows.
-- delete from public.campaign_applications
-- where lower(email) like 'qa+%'
--    or company ilike 'QA %';

-- 14. Cleanup helper for QA fallback sample requests.
-- Uncomment only when you explicitly want to remove QA rows.
-- delete from public.sample_requests
-- where lower(email) like 'qa+%'
--    or company ilike 'QA %';

-- 15. Cleanup helper for QA customers.
-- Uncomment only when you explicitly want to remove QA rows.
-- delete from public.customers
-- where lower(email) like 'qa+%'
--    or company_name ilike 'QA %';
