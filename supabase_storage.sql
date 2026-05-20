-- ============================================
-- Storage setup for product images
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the storage bucket (public for easy image serving)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload images
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'product-images'
  );

-- 3. Allow public to view images (no login needed to see product photos)
DROP POLICY IF EXISTS "Allow public to view images" ON storage.objects;
CREATE POLICY "Allow public to view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 4. Allow authenticated users to delete their own uploads
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'product-images'
  );