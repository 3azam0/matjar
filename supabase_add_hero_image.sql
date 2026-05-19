-- ============================================
-- Add hero_image column to site_settings
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add hero_image column to site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_image text DEFAULT '';

-- 2. Create a storage bucket for hero images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop the policy first if it already exists (safe to run)
DROP POLICY IF EXISTS "Allow authenticated uploads to hero-images" ON storage.objects;

-- 4. Allow authenticated users to upload hero images
CREATE POLICY "Allow authenticated uploads to hero-images" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'hero-images'
  );

-- 5. Allow public to view hero images
DROP POLICY IF EXISTS "Allow public to view hero-images" ON storage.objects;
CREATE POLICY "Allow public to view hero-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hero-images');

-- 6. Allow authenticated users to delete hero images
DROP POLICY IF EXISTS "Allow authenticated deletes on hero-images" ON storage.objects;
CREATE POLICY "Allow authenticated deletes on hero-images" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'hero-images'
  );