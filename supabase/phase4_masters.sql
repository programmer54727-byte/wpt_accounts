-- =============================================================================
-- WPT Accounts — Phase 4 Masters Schema
-- stock_items, customers, vendors, tax_rates
-- Run in Supabase SQL Editor after phase2_schema.sql
-- =============================================================================

create table if not exists public.tax_rates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  rate numeric(8, 3) not null default 0 check (rate >= 0),
  tax_type text not null default 'simple'
    check (tax_type in ('simple', 'cgst_sgst', 'igst')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tax_rates_name_unique unique (company_id, name)
);

create index if not exists tax_rates_company_id_idx on public.tax_rates (company_id);

create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  code text,
  item_type text not null default 'goods'
    check (item_type in ('goods', 'service')),
  unit text not null default 'Nos',
  hsn_sac text,
  -- Legacy columns (kept for compatibility; prefer avg_rate)
  sale_rate numeric(14, 2) not null default 0 check (sale_rate >= 0),
  purchase_rate numeric(14, 2) not null default 0 check (purchase_rate >= 0),
  -- Average / closing rate: opening + inward only (outward ignored)
  avg_rate numeric(14, 2) not null default 0 check (avg_rate >= 0),
  gst_rate numeric(8, 3) not null default 0
    check (gst_rate >= 0 and gst_rate <= 100),
  tax_rate_id uuid references public.tax_rates (id) on delete set null,
  opening_qty numeric(14, 3) not null default 0,
  opening_value numeric(14, 2) not null default 0,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stock_items_name_unique unique (company_id, name),
  constraint stock_items_code_unique unique (company_id, code)
);

-- Migrations for existing tables
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stock_items' and column_name = 'gst_rate'
  ) then
    alter table public.stock_items
      add column gst_rate numeric(8, 3) not null default 0
        check (gst_rate >= 0 and gst_rate <= 100);
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stock_items' and column_name = 'avg_rate'
  ) then
    alter table public.stock_items
      add column avg_rate numeric(14, 2) not null default 0
        check (avg_rate >= 0);
  end if;
end $$;

create index if not exists stock_items_company_id_idx on public.stock_items (company_id);
create index if not exists stock_items_tax_rate_id_idx on public.stock_items (tax_rate_id);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  code text,
  gstin text,
  pan text,
  email text,
  phone text,
  billing_address text,
  city text,
  state text,
  pincode text,
  country text not null default 'India',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_name_unique unique (company_id, name),
  constraint customers_code_unique unique (company_id, code),
  constraint customers_gstin_unique unique (company_id, gstin)
);

create index if not exists customers_company_id_idx on public.customers (company_id);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  code text,
  gstin text,
  pan text,
  email text,
  phone text,
  billing_address text,
  city text,
  state text,
  pincode text,
  country text not null default 'India',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendors_name_unique unique (company_id, name),
  constraint vendors_code_unique unique (company_id, code),
  constraint vendors_gstin_unique unique (company_id, gstin)
);

create index if not exists vendors_company_id_idx on public.vendors (company_id);

drop trigger if exists tax_rates_set_updated_at on public.tax_rates;
create trigger tax_rates_set_updated_at
  before update on public.tax_rates
  for each row execute function public.set_updated_at();

drop trigger if exists stock_items_set_updated_at on public.stock_items;
create trigger stock_items_set_updated_at
  before update on public.stock_items
  for each row execute function public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists vendors_set_updated_at on public.vendors;
create trigger vendors_set_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();

alter table public.tax_rates enable row level security;
alter table public.stock_items enable row level security;
alter table public.customers enable row level security;
alter table public.vendors enable row level security;

drop policy if exists tax_rates_select on public.tax_rates;
create policy tax_rates_select on public.tax_rates for select to authenticated using (public.is_company_member(company_id));
drop policy if exists tax_rates_insert on public.tax_rates;
create policy tax_rates_insert on public.tax_rates for insert to authenticated with check (public.is_company_member(company_id));
drop policy if exists tax_rates_update on public.tax_rates;
create policy tax_rates_update on public.tax_rates for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
drop policy if exists tax_rates_delete on public.tax_rates;
create policy tax_rates_delete on public.tax_rates for delete to authenticated using (public.is_company_member(company_id));

drop policy if exists stock_items_select on public.stock_items;
create policy stock_items_select on public.stock_items for select to authenticated using (public.is_company_member(company_id));
drop policy if exists stock_items_insert on public.stock_items;
create policy stock_items_insert on public.stock_items for insert to authenticated with check (public.is_company_member(company_id));
drop policy if exists stock_items_update on public.stock_items;
create policy stock_items_update on public.stock_items for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
drop policy if exists stock_items_delete on public.stock_items;
create policy stock_items_delete on public.stock_items for delete to authenticated using (public.is_company_member(company_id));

drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers for select to authenticated using (public.is_company_member(company_id));
drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers for insert to authenticated with check (public.is_company_member(company_id));
drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
drop policy if exists customers_delete on public.customers;
create policy customers_delete on public.customers for delete to authenticated using (public.is_company_member(company_id));

drop policy if exists vendors_select on public.vendors;
create policy vendors_select on public.vendors for select to authenticated using (public.is_company_member(company_id));
drop policy if exists vendors_insert on public.vendors;
create policy vendors_insert on public.vendors for insert to authenticated with check (public.is_company_member(company_id));
drop policy if exists vendors_update on public.vendors;
create policy vendors_update on public.vendors for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
drop policy if exists vendors_delete on public.vendors;
create policy vendors_delete on public.vendors for delete to authenticated using (public.is_company_member(company_id));
