-- Add is_visible column to public.products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
