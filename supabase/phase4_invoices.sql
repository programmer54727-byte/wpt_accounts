-- =============================================================================
-- WPT Accounts — Phase 4 Sales Invoices
-- Run after phase4_masters.sql (+ gst_type migration if used)
-- =============================================================================

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  invoice_number text not null,
  invoice_date date not null default (current_date),
  due_date date,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled')),
  place_of_supply text,
  notes text,
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  tax_total numeric(14, 2) not null default 0 check (tax_total >= 0),
  grand_total numeric(14, 2) not null default 0 check (grand_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_number_unique unique (company_id, invoice_number)
);

create index if not exists invoices_company_id_idx on public.invoices (company_id);
create index if not exists invoices_customer_id_idx on public.invoices (customer_id);
create index if not exists invoices_invoice_date_idx on public.invoices (company_id, invoice_date desc);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  stock_item_id uuid references public.stock_items (id) on delete set null,
  description text not null,
  hsn_sac text,
  qty numeric(14, 3) not null default 1 check (qty > 0),
  rate numeric(14, 2) not null default 0 check (rate >= 0),
  gst_rate numeric(8, 3) not null default 0
    check (gst_rate >= 0 and gst_rate <= 100),
  discount numeric(14, 2) not null default 0 check (discount >= 0),
  amount numeric(14, 2) not null default 0 check (amount >= 0),
  tax_amount numeric(14, 2) not null default 0 check (tax_amount >= 0),
  line_total numeric(14, 2) not null default 0 check (line_total >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index if not exists invoice_items_company_id_idx on public.invoice_items (company_id);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices
  for select to authenticated
  using (public.is_company_member(company_id));

drop policy if exists invoices_insert on public.invoices;
create policy invoices_insert on public.invoices
  for insert to authenticated
  with check (public.is_company_member(company_id));

drop policy if exists invoices_update on public.invoices;
create policy invoices_update on public.invoices
  for update to authenticated
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

drop policy if exists invoices_delete on public.invoices;
create policy invoices_delete on public.invoices
  for delete to authenticated
  using (public.is_company_member(company_id));

drop policy if exists invoice_items_select on public.invoice_items;
create policy invoice_items_select on public.invoice_items
  for select to authenticated
  using (public.is_company_member(company_id));

drop policy if exists invoice_items_insert on public.invoice_items;
create policy invoice_items_insert on public.invoice_items
  for insert to authenticated
  with check (public.is_company_member(company_id));

drop policy if exists invoice_items_update on public.invoice_items;
create policy invoice_items_update on public.invoice_items
  for update to authenticated
  using (public.is_company_member(company_id))
  with check (public.is_company_member(company_id));

drop policy if exists invoice_items_delete on public.invoice_items;
create policy invoice_items_delete on public.invoice_items
  for delete to authenticated
  using (public.is_company_member(company_id));

-- =============================================================================
-- DONE
-- Verify: select * from invoices limit 1;
-- =============================================================================
