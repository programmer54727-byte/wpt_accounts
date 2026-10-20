-- =============================================================================
-- WPT Accounts — Stock Items: avg / closing rate
-- Run in Supabase SQL Editor
--
-- Rate model:
--   avg_rate = weighted average from opening + inward stock only
--   Outward (sales) does NOT change avg_rate
-- =============================================================================

-- 1. Add avg_rate if missing
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'stock_items'
      and column_name = 'avg_rate'
  ) then
    alter table public.stock_items
      add column avg_rate numeric(14, 2) not null default 0
        check (avg_rate >= 0);
  end if;
end $$;

-- 2. Backfill avg_rate from existing purchase_rate / sale_rate
update public.stock_items
set avg_rate = coalesce(
  nullif(purchase_rate, 0),
  nullif(sale_rate, 0),
  0
)
where avg_rate = 0
  and (purchase_rate > 0 or sale_rate > 0);

-- 3. Optional: keep sale_rate & purchase_rate in sync with avg_rate for old code
--    (safe; UI now uses avg_rate only)
update public.stock_items
set
  sale_rate = avg_rate,
  purchase_rate = avg_rate
where sale_rate is distinct from avg_rate
   or purchase_rate is distinct from avg_rate;

comment on column public.stock_items.avg_rate is
  'Average / closing rate from opening + inward only. Outward does not affect this rate.';

-- =============================================================================
-- DONE
-- Verify: select name, avg_rate, gst_rate from stock_items;
-- =============================================================================
