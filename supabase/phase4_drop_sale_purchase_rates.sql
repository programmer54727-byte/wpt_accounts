-- =============================================================================
-- WPT Accounts — Remove sale_rate & purchase_rate from stock_items
-- Use avg_rate + opening_qty + opening_value instead
-- Run in Supabase SQL Editor
-- =============================================================================

-- Ensure avg_rate exists first
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'stock_items'
      and column_name = 'avg_rate'
  ) then
    alter table public.stock_items
      add column avg_rate numeric(14, 2) not null default 0
        check (avg_rate >= 0);

    -- backfill if old columns still exist
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'stock_items'
        and column_name = 'purchase_rate'
    ) then
      execute $u$
        update public.stock_items
        set avg_rate = coalesce(nullif(purchase_rate, 0), nullif(sale_rate, 0), avg_rate, 0)
        where avg_rate = 0
      $u$;
    end if;
  end if;
end $$;

-- Drop legacy rate columns
alter table public.stock_items drop column if exists sale_rate;
alter table public.stock_items drop column if exists purchase_rate;

comment on column public.stock_items.avg_rate is
  'Average rate from opening + inward only. Outward does not change this.';
comment on column public.stock_items.opening_qty is
  'Opening stock quantity';
comment on column public.stock_items.opening_value is
  'Opening stock value (typically opening_qty * rate at create time)';

-- =============================================================================
-- DONE
-- =============================================================================
