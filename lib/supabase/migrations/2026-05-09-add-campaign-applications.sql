create table if not exists public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text not null,
  role text,
  website text,
  industry text not null,
  countries text[] not null default '{}',
  cities text[],
  company_size text not null,
  target_titles text[],
  services text[],
  lead_goal int not null,
  minimum_score int not null check (minimum_score between 50 and 90),
  required_contactability text not null check (required_contactability in ('strong', 'premium')),
  founder_confidence_min numeric(3,2) not null check (founder_confidence_min between 0.5 and 0.95),
  average_client_value numeric(12,2) not null,
  currency text not null check (currency in ('EUR', 'GBP', 'USD')),
  outbound_maturity text not null check (outbound_maturity in ('none', 'manual', 'structured', 'team')),
  current_challenges text not null,
  success_definition text,
  status text not null default 'pending' check (
    status in ('pending', 'reviewing', 'qualified', 'accepted', 'rejected', 'onboarding', 'active')
  ),
  created_at timestamptz default now()
);

create index if not exists idx_campaign_applications_status
  on public.campaign_applications(status);

create index if not exists idx_campaign_applications_created_at
  on public.campaign_applications(created_at desc);
