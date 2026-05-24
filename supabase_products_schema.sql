-- ============================================================================
-- Database Schema: Products Table ONLY
-- Sahar Alsharq
-- ============================================================================

-- 1. Ensure the parent categories table exists first (due to foreign key reference)
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create the Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  note text DEFAULT '',
  category_id text REFERENCES public.categories(id) ON DELETE SET NULL,
  images text[] NOT NULL DEFAULT ARRAY[]::text[],
  order_index integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Ensure all columns exist (safe alter table scripts in case table already exists)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS note text DEFAULT '',
  ADD COLUMN IF NOT EXISTS category_id text,
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 4. Re-verify the foreign key relationship is present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_id_fkey'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Row-Level Security (RLS) Configuration
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. Row-Level Security (RLS) Policies
-- Policy: Allow read access to anyone (public)
DROP POLICY IF EXISTS "Enable read for everyone" ON public.products;
CREATE POLICY "Enable read for everyone" ON public.products
  FOR SELECT USING (true);

-- Policy: Allow authenticated users to insert new products
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.products;
CREATE POLICY "Enable insert for authenticated users" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update existing products
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.products;
CREATE POLICY "Enable update for authenticated users" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete products
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.products;
CREATE POLICY "Enable delete for authenticated users" ON public.products
  FOR DELETE USING (auth.role() = 'authenticated');
