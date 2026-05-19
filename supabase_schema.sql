-- ============================================
-- Database schema for Sahar Alsharq
-- Run this before supabase_seed_data.sql
-- Safe to rerun: it creates missing tables and adds missing columns.
-- ============================================

-- 1. Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY,
  site_name text NOT NULL DEFAULT 'سحر الشرق',
  site_description text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  social_facebook text DEFAULT '',
  social_instagram text DEFAULT '',
  social_whatsapp text DEFAULT '',
  hero_image text DEFAULT '',
  products_per_page integer NOT NULL DEFAULT 12,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'سحر الشرق',
  ADD COLUMN IF NOT EXISTS site_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_facebook text DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_instagram text DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_whatsapp text DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_image text DEFAULT '',
  ADD COLUMN IF NOT EXISTS products_per_page integer NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Features
CREATE TABLE IF NOT EXISTS public.features (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.features
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon text DEFAULT '',
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 3. Branches and branch links
CREATE TABLE IF NOT EXISTS public.branches (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text DEFAULT '',
  phone_tel text DEFAULT '',
  mobile_1 text DEFAULT '',
  mobile_2 text DEFAULT '',
  landline text DEFAULT '',
  address_lines text[] NOT NULL DEFAULT ARRAY[]::text[],
  map_query text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone_tel text DEFAULT '',
  ADD COLUMN IF NOT EXISTS mobile_1 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS mobile_2 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS landline text DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_lines text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS map_query text DEFAULT '',
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.branch_links (
  id text PRIMARY KEY,
  branch_id text NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  type text NOT NULL,
  label text DEFAULT '',
  href text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.branch_links
  ADD COLUMN IF NOT EXISTS branch_id text,
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS label text DEFAULT '',
  ADD COLUMN IF NOT EXISTS href text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'branch_links_branch_id_fkey'
      AND conrelid = 'public.branch_links'::regclass
  ) THEN
    ALTER TABLE public.branch_links
      ADD CONSTRAINT branch_links_branch_id_fkey
      FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Categories and products
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

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

-- 5. Optional inquiries table used by src/services/api.js
CREATE TABLE IF NOT EXISTS public.inquiries (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  message text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
