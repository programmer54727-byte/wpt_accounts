-- =============================================================================
-- WPT Accounts — Invoice additional ledger charges
-- Transport, fitting, repair, freight, tax ledgers, etc.
-- Run in Supabase SQL Editor after phase4_invoices.sql
-- =============================================================================

-- line_type: item (stock) | charge (ledger)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'invoice_items'
      and column_name = 'line_type'
  ) then
    alter table public.invoice_items
      add column line_type text not null default 'item'
        check (line_type in ('item', 'charge'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'invoice_items'
      and column_name = 'ledger_id'
  ) then
    alter table public.invoice_items
      add column ledger_id uuid
        references public.chart_of_accounts (id) on delete set null;
  end if;
end $$;

create index if not exists invoice_items_ledger_id_idx
  on public.invoice_items (ledger_id);

create index if not exists invoice_items_line_type_idx
  on public.invoice_items (invoice_id, line_type);

comment on column public.invoice_items.line_type is
  'item = stock line; charge = additional ledger (transport, fitting, tax, etc.)';
comment on column public.invoice_items.ledger_id is
  'Chart of Accounts ledger for charge lines';

-- Optional: common charge ledgers if missing (per company — run only if needed)
-- Users can also create ledgers under Chart of Accounts / Indirect Expenses.

-- =============================================================================
-- DONE
-- =============================================================================
