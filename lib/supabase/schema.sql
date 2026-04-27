create extension if not exists pgcrypto;

-- CUSTOMERS
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  company_name text,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  plan text check (plan in ('design_partner', 'starter', 'growth', 'scale')),
  status text default 'pending' check (status in ('pending', 'active', 'paused', 'cancelled', 'churned')),
  signup_date timestamptz default now(),
  cancelled_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ICPS
create table if not exists icps (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  name text default 'Primary ICP',
  product_description text not null,
  target_titles text[],
  target_industries text[],
  company_size_min int,
  company_size_max int,
  geographies text[],
  signals text[],
  exclusions text[],
  brand_voice text check (brand_voice in ('casual', 'professional', 'direct')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BATCHES
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  icp_id uuid references icps(id),
  delivery_date date not null,
  status text default 'draft' check (status in ('draft', 'researching', 'ready', 'delivered', 'archived')),
  total_leads int default 0,
  verified_emails int default 0,
  notes text,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

-- LEADS
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references batches(id) on delete cascade,
  full_name text not null,
  current_title text not null,
  company_name text not null,
  company_size int,
  company_location text,
  linkedin_url text,
  email text,
  email_status text check (email_status in ('verified', 'risky', 'unverified', 'pattern_based')),
  why_this_lead text,
  trigger_signals text[],
  fit_score int check (fit_score between 1 and 10),
  opener_a text,
  opener_a_signal text,
  opener_b text,
  opener_b_signal text,
  opener_c text,
  opener_c_signal text,
  recommended_opener text check (recommended_opener in ('a', 'b', 'c')),
  recommended_reason text,
  created_at timestamptz default now()
);

-- FEEDBACK
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  rating text check (rating in ('positive', 'negative')),
  comment text,
  created_at timestamptz default now()
);

-- SAMPLE REQUESTS
create table if not exists sample_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text,
  industry text,
  target_role text,
  company_size text,
  geography text,
  frustration text,
  status text default 'pending' check (status in ('pending', 'researching', 'delivered', 'converted', 'declined')),
  delivered_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_customers_email on customers(email);
create index if not exists idx_customers_stripe_id on customers(stripe_customer_id);
create index if not exists idx_batches_customer_id on batches(customer_id);
create index if not exists idx_batches_delivery_date on batches(delivery_date desc);
create index if not exists idx_leads_batch_id on leads(batch_id);
create index if not exists idx_feedback_customer_id on feedback(customer_id);
create index if not exists idx_sample_requests_status on sample_requests(status);

-- UPDATED_AT TRIGGER
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_customers_updated_at on customers;
create trigger update_customers_updated_at before update on customers
  for each row execute function update_updated_at_column();

drop trigger if exists update_icps_updated_at on icps;
create trigger update_icps_updated_at before update on icps
  for each row execute function update_updated_at_column();

-- ENABLE RLS
alter table customers enable row level security;
alter table icps enable row level security;
alter table batches enable row level security;
alter table leads enable row level security;
alter table feedback enable row level security;

-- CUSTOMERS: only see own record
drop policy if exists "Users see only their customer record" on customers;
create policy "Users see only their customer record" on customers
  for select using (auth.uid()::text = id::text or auth.email() = email);

-- ICPS: only see your own
drop policy if exists "Users see only their ICPs" on icps;
create policy "Users see only their ICPs" on icps
  for all using (
    customer_id in (select id from customers where email = auth.email())
  );

-- BATCHES: only see your own
drop policy if exists "Users see only their batches" on batches;
create policy "Users see only their batches" on batches
  for select using (
    customer_id in (select id from customers where email = auth.email())
  );

-- LEADS: only see leads from your batches
drop policy if exists "Users see only their leads" on leads;
create policy "Users see only their leads" on leads
  for select using (
    batch_id in (
      select id from batches where customer_id in (
        select id from customers where email = auth.email()
      )
    )
  );

-- FEEDBACK: only insert/see your own
drop policy if exists "Users see only their feedback" on feedback;
create policy "Users see only their feedback" on feedback
  for all using (
    customer_id in (select id from customers where email = auth.email())
  );
