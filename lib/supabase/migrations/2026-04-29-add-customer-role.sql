alter table customers
  add column if not exists role text not null default 'customer';

alter table customers
  drop constraint if exists customers_role_check;

alter table customers
  add constraint customers_role_check check (role in ('admin', 'customer'));

update customers
set role = 'customer'
where role is null;
