-- =============================================================================
-- WPT Accounts — Phase 2 Schema
-- Multi-company + Chart of Accounts (Tally-style defaults) + RLS
--
-- How to use:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Paste this entire file
-- 3. Run
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. COMPANIES
-- =============================================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  gstin text,
  pan text,
  address text,
  city text,
  state text,
  pincode text,
  country text not null default 'India',
  financial_year_start date not null default make_date(
    extract(year from current_date)::int,
    4,
    1
  ),
  currency text not null default 'INR',
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_gstin_unique unique (gstin)
);

create index if not exists companies_created_by_idx on public.companies (created_by);

-- =============================================================================
-- 2. COMPANY MEMBERS
-- =============================================================================
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'accountant' check (role in ('accountant')),
  created_at timestamptz not null default now(),
  constraint company_members_unique unique (company_id, user_id)
);

create index if not exists company_members_user_id_idx on public.company_members (user_id);
create index if not exists company_members_company_id_idx on public.company_members (company_id);

-- =============================================================================
-- 3. CHART OF ACCOUNTS (Groups + Ledgers)
-- =============================================================================
create table if not exists public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  code text,
  parent_id uuid references public.chart_of_accounts (id) on delete restrict,
  -- asset | liability | equity | income | expense
  account_type text not null check (
    account_type in ('asset', 'liability', 'equity', 'income', 'expense')
  ),
  is_group boolean not null default false,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chart_of_accounts_name_unique unique (company_id, name),
  constraint chart_of_accounts_code_unique unique (company_id, code)
);

create index if not exists chart_of_accounts_company_id_idx
  on public.chart_of_accounts (company_id);
create index if not exists chart_of_accounts_parent_id_idx
  on public.chart_of_accounts (parent_id);

-- =============================================================================
-- 4. UPDATED_AT TRIGGER
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists chart_of_accounts_set_updated_at on public.chart_of_accounts;
create trigger chart_of_accounts_set_updated_at
  before update on public.chart_of_accounts
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 5. SEED DEFAULT LEDGERS (Tally-style)
--    GST ledgers are NOT auto-created (user can add under Duties & Taxes)
-- =============================================================================
create or replace function public.create_default_ledgers(p_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Root groups
  v_capital uuid;
  v_current_assets uuid;
  v_current_liabilities uuid;
  v_fixed_assets uuid;
  v_investments uuid;
  v_loans uuid;
  v_suspense uuid;
  v_sales uuid;
  v_purchase uuid;
  v_direct_expenses uuid;
  v_indirect_expenses uuid;
  v_direct_incomes uuid;
  v_indirect_incomes uuid;
  v_duties_taxes uuid;
  -- Sub-groups
  v_bank_accounts uuid;
  v_cash_in_hand uuid;
  v_sundry_debtors uuid;
  v_sundry_creditors uuid;
  v_stock_in_hand uuid;
begin
  -- Primary groups
  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Capital Account', 'liability', true, true)
  returning id into v_capital;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Current Assets', 'asset', true, true)
  returning id into v_current_assets;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Current Liabilities', 'liability', true, true)
  returning id into v_current_liabilities;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Fixed Assets', 'asset', true, true)
  returning id into v_fixed_assets;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Investments', 'asset', true, true)
  returning id into v_investments;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Loans (Liability)', 'liability', true, true)
  returning id into v_loans;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Suspense Account', 'asset', true, true)
  returning id into v_suspense;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Sales Accounts', 'income', true, true)
  returning id into v_sales;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Purchase Accounts', 'expense', true, true)
  returning id into v_purchase;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Direct Expenses', 'expense', true, true)
  returning id into v_direct_expenses;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Indirect Expenses', 'expense', true, true)
  returning id into v_indirect_expenses;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Direct Incomes', 'income', true, true)
  returning id into v_direct_incomes;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Indirect Incomes', 'income', true, true)
  returning id into v_indirect_incomes;

  insert into public.chart_of_accounts (company_id, name, account_type, is_group, is_system)
  values (p_company_id, 'Duties & Taxes', 'liability', true, true)
  returning id into v_duties_taxes;

  -- Sub-groups under Current Assets / Liabilities
  insert into public.chart_of_accounts (company_id, name, parent_id, account_type, is_group, is_system)
  values (p_company_id, 'Bank Accounts', v_current_assets, 'asset', true, true)
  returning id into v_bank_accounts;

  insert into public.chart_of_accounts (company_id, name, parent_id, account_type, is_group, is_system)
  values (p_company_id, 'Cash-in-Hand', v_current_assets, 'asset', true, true)
  returning id into v_cash_in_hand;

  insert into public.chart_of_accounts (company_id, name, parent_id, account_type, is_group, is_system)
  values (p_company_id, 'Sundry Debtors', v_current_assets, 'asset', true, true)
  returning id into v_sundry_debtors;

  insert into public.chart_of_accounts (company_id, name, parent_id, account_type, is_group, is_system)
  values (p_company_id, 'Stock-in-Hand', v_current_assets, 'asset', true, true)
  returning id into v_stock_in_hand;

  insert into public.chart_of_accounts (company_id, name, parent_id, account_type, is_group, is_system)
  values (p_company_id, 'Sundry Creditors', v_current_liabilities, 'liability', true, true)
  returning id into v_sundry_creditors;

  -- Default ledgers (not groups)
  insert into public.chart_of_accounts (company_id, name, parent_id, account_type, is_group, is_system)
  values
    (p_company_id, 'Capital', v_capital, 'liability', false, true),
    (p_company_id, 'Cash', v_cash_in_hand, 'asset', false, true),
    (p_company_id, 'Bank Account', v_bank_accounts, 'asset', false, true),
    (p_company_id, 'Sales', v_sales, 'income', false, true),
    (p_company_id, 'Purchase', v_purchase, 'expense', false, true),
    (p_company_id, 'Round Off', v_indirect_expenses, 'expense', false, true),
    (p_company_id, 'Discount Allowed', v_indirect_expenses, 'expense', false, true),
    (p_company_id, 'Discount Received', v_indirect_incomes, 'income', false, true),
    (p_company_id, 'Freight Charges', v_direct_expenses, 'expense', false, true),
    (p_company_id, 'Salary', v_indirect_expenses, 'expense', false, true),
    (p_company_id, 'Rent', v_indirect_expenses, 'expense', false, true),
    (p_company_id, 'Electricity', v_indirect_expenses, 'expense', false, true),
    (p_company_id, 'Office Expenses', v_indirect_expenses, 'expense', false, true),
    (p_company_id, 'Profit & Loss A/c', null, 'equity', false, true);
end;
$$;

-- =============================================================================
-- 6. CREATE COMPANY + MEMBER + DEFAULT LEDGERS (single transaction helper)
-- =============================================================================
create or replace function public.create_company_with_defaults(
  p_name text,
  p_legal_name text default null,
  p_gstin text default null,
  p_pan text default null,
  p_address text default null,
  p_city text default null,
  p_state text default null,
  p_pincode text default null,
  p_country text default 'India',
  p_financial_year_start date default null,
  p_currency text default 'INR'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_company_id uuid;
  v_fy date;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Company name is required';
  end if;

  v_fy := coalesce(
    p_financial_year_start,
    make_date(extract(year from current_date)::int, 4, 1)
  );

  insert into public.companies (
    name,
    legal_name,
    gstin,
    pan,
    address,
    city,
    state,
    pincode,
    country,
    financial_year_start,
    currency,
    created_by
  )
  values (
    trim(p_name),
    nullif(trim(p_legal_name), ''),
    nullif(upper(trim(p_gstin)), ''),
    nullif(upper(trim(p_pan)), ''),
    nullif(trim(p_address), ''),
    nullif(trim(p_city), ''),
    nullif(trim(p_state), ''),
    nullif(trim(p_pincode), ''),
    coalesce(nullif(trim(p_country), ''), 'India'),
    v_fy,
    coalesce(nullif(trim(p_currency), ''), 'INR'),
    v_user_id
  )
  returning id into v_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (v_company_id, v_user_id, 'accountant');

  perform public.create_default_ledgers(v_company_id);

  return v_company_id;
end;
$$;

-- Allow authenticated users to call the helper
grant execute on function public.create_company_with_defaults to authenticated;
grant execute on function public.create_default_ledgers to authenticated;

-- =============================================================================
-- 7. ROW LEVEL SECURITY
-- =============================================================================
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.chart_of_accounts enable row level security;

-- Helper: is current user a member of company?
create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = auth.uid()
  );
$$;

grant execute on function public.is_company_member to authenticated;

-- companies policies
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
  for select to authenticated
  using (public.is_company_member(id));

drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies
  for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies
  for update to authenticated
  using (public.is_company_member(id))
  with check (public.is_company_member(id));

-- Prefer soft-delete later; hard delete only by member for now
drop policy if exists companies_delete on public.companies;
create policy companies_delete on public.companies
  for delete to authenticated
  using (public.is_company_member(id));

-- company_members policies
drop policy if exists company_members_select on public.company_members;
create policy company_members_select on public.company_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_company_member(company_id)
  );

drop policy if exists company_members_insert on public.company_members;
create policy company_members_insert on public.company_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.is_company_member(company_id)
  );

-- chart_of_accounts policies
drop policy if exists chart_of_accounts_select on public.chart_of_accounts;
create policy chart_of_accounts_select on public.chart_of_accounts
  for select to authenticated
  using (public.is_company_member(company_id));

drop policy if exists chart_of_accounts_insert on public.chart_of_accounts;
create policy chart_of_accounts_insert on public.chart_of_accounts
  for insert to authenticated
  with check (public.is_company_member(company_id));

drop policy if exists chart_of_accounts_update on public.chart_of_accounts;
create policy chart_of_accounts_update on public.chart_of_accounts
  for update to authenticated
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

drop policy if exists chart_of_accounts_delete on public.chart_of_accounts;
create policy chart_of_accounts_delete on public.chart_of_accounts
  for delete to authenticated
  using (
    public.is_company_member(company_id)
    and is_system = false
  );

-- =============================================================================
-- DONE
-- After running this file:
-- 1. Confirm tables exist under Table Editor
-- 2. App will call: rpc('create_company_with_defaults', { ... })
-- =============================================================================
