alter table campaign_applications
  add column if not exists linkedin_profile text,
  add column if not exists whatsapp_number text,
  add column if not exists preferred_contact_method text,
  add column if not exists telegram_handle text;

update campaign_applications
set whatsapp_number = coalesce(nullif(trim(whatsapp_number), ''), 'Not provided')
where whatsapp_number is null or trim(whatsapp_number) = '';

update campaign_applications
set preferred_contact_method = coalesce(nullif(trim(preferred_contact_method), ''), 'email')
where preferred_contact_method is null or trim(preferred_contact_method) = '';

alter table campaign_applications
  alter column whatsapp_number set not null,
  alter column preferred_contact_method set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'campaign_applications_preferred_contact_method_check'
  ) then
    alter table campaign_applications
      add constraint campaign_applications_preferred_contact_method_check
      check (preferred_contact_method in ('email', 'whatsapp', 'linkedin', 'telegram'));
  end if;
end $$;
