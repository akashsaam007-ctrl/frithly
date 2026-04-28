-- Rename legacy Stripe-labelled billing columns to provider-neutral names.
-- Safe to run once in Supabase SQL Editor after the app code has been updated.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'stripe_customer_id'
  ) then
    alter table public.customers
      rename column stripe_customer_id to billing_customer_id;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'stripe_subscription_id'
  ) then
    alter table public.customers
      rename column stripe_subscription_id to billing_subscription_id;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_customers_stripe_id'
  ) then
    alter index public.idx_customers_stripe_id
      rename to idx_customers_billing_customer_id;
  end if;
end $$;

create index if not exists idx_customers_billing_customer_id
  on public.customers(billing_customer_id);
