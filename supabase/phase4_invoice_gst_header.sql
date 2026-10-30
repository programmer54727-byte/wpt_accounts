-- =============================================================================
-- WPT Accounts — Sales invoice GST split + header commercial fields
-- Run after phase4_invoices.sql and phase4_invoice_ledger_charges.sql
-- =============================================================================

-- Header fields
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='order_no') then
    alter table public.invoices add column order_no text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='challan_no') then
    alter table public.invoices add column challan_no text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='ref_no') then
    alter table public.invoices add column ref_no text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='credit_days') then
    alter table public.invoices add column credit_days int check (credit_days is null or credit_days >= 0);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='sales_ledger_id') then
    alter table public.invoices add column sales_ledger_id uuid references public.chart_of_accounts (id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='taxable_total') then
    alter table public.invoices add column taxable_total numeric(14,2) not null default 0 check (taxable_total >= 0);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='cgst_total') then
    alter table public.invoices add column cgst_total numeric(14,2) not null default 0 check (cgst_total >= 0);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='sgst_total') then
    alter table public.invoices add column sgst_total numeric(14,2) not null default 0 check (sgst_total >= 0);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoices' and column_name='igst_total') then
    alter table public.invoices add column igst_total numeric(14,2) not null default 0 check (igst_total >= 0);
  end if;
end $$;

-- Line tax split
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoice_items' and column_name='cgst_amount') then
    alter table public.invoice_items add column cgst_amount numeric(14,2) not null default 0 check (cgst_amount >= 0);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoice_items' and column_name='sgst_amount') then
    alter table public.invoice_items add column sgst_amount numeric(14,2) not null default 0 check (sgst_amount >= 0);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invoice_items' and column_name='igst_amount') then
    alter table public.invoice_items add column igst_amount numeric(14,2) not null default 0 check (igst_amount >= 0);
  end if;
end $$;

create index if not exists invoices_sales_ledger_id_idx on public.invoices (sales_ledger_id);

-- =============================================================================
-- DONE
-- =============================================================================
