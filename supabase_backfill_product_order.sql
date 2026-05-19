-- Safe backfill for products.order_index (PostgreSQL integer = max ~2.1 billion).
-- Store UNIX SECONDS, not milliseconds. Run in Supabase SQL Editor.

-- 1) IDs like 1740000000123-product-name (ms in prefix → seconds)
UPDATE public.products
SET order_index = (
  (regexp_match(id, '^(\d{13,})-'))[1]::bigint / 1000
)::integer
WHERE (order_index IS NULL OR order_index < 1000000000 OR order_index < 0)
  AND id ~ '^\d{13,}-';

-- 2) IDs like product-1740000000 (10-digit seconds suffix)
UPDATE public.products
SET order_index = (regexp_match(id, '-(\d{10})$'))[1]::integer
WHERE (order_index IS NULL OR order_index < 1000000000 OR order_index < 0)
  AND id ~ '-\d{10}$';

-- 3) IDs like product-1740000000123 (ms suffix → seconds)
UPDATE public.products
SET order_index = (
  (regexp_match(id, '-(\d{13,})$'))[1]::bigint / 1000
)::integer
WHERE (order_index IS NULL OR order_index < 1000000000 OR order_index < 0)
  AND id ~ '-\d{13,}$';

-- 4) Optional: fix created_at from order_index (only if column exists)
-- UPDATE public.products
-- SET created_at = to_timestamp(order_index)
-- WHERE order_index >= 1000000000;
