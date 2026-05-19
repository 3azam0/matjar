-- ============================================
-- Add hero_images array column to site_settings
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_images text[] NOT NULL DEFAULT ARRAY[]::text[];

UPDATE public.site_settings
SET hero_images = ARRAY[hero_image]
WHERE hero_image IS NOT NULL AND hero_image != ''
  AND (hero_images IS NULL OR array_length(hero_images, 1) IS NULL OR hero_images = ARRAY[]::text[]);