-- =============================================================================
-- WPT Accounts — Add GST rate on stock_items
-- Run in Supabase SQL Editor (after phase4_masters.sql)
-- Safe to re-run: uses IF NOT EXISTS pattern via DO block
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'stock_items'
      and column_name = 'gst_rate'
  ) then
    alter table public.stock_items
      add column gst_rate numeric(8, 3) not null default 0
        check (gst_rate >= 0 and gst_rate <= 100);
  end if;
end $$;

comment on column public.stock_items.gst_rate is
  'GST percentage for this item (e.g. 5, 12, 18, 28). Used on sales/purchase lines.';
