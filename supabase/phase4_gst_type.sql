-- =============================================================================
-- WPT Accounts — GST registration type on customers & vendors
-- Run in Supabase SQL Editor
-- =============================================================================

-- Customers
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'gst_type'
  ) then
    alter table public.customers
      add column gst_type text not null default 'unregistered'
        check (gst_type in (
          'regular',
          'composition',
          'unregistered',
          'consumer',
          'sez'
        ));
  end if;
end $$;

-- Vendors
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vendors'
      and column_name = 'gst_type'
  ) then
    alter table public.vendors
      add column gst_type text not null default 'unregistered'
        check (gst_type in (
          'regular',
          'composition',
          'unregistered',
          'consumer',
          'sez'
        ));
  end if;
end $$;

comment on column public.customers.gst_type is
  'GST registration: regular | composition | unregistered | consumer | sez';
comment on column public.vendors.gst_type is
  'GST registration: regular | composition | unregistered | consumer | sez';

-- =============================================================================
-- DONE
-- =============================================================================
