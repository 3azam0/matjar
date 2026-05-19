-- ========================================================
-- Add Working Hours to Site Settings
-- Run this in your Supabase SQL Editor to make the
-- working hours fully dynamic and editable in the admin panel!
-- ========================================================

-- 1. Add the columns to the site_settings table if they don't exist
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hours_weekday text DEFAULT 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
  ADD COLUMN IF NOT EXISTS hours_friday text DEFAULT 'الأحد: 12:00 م - 8:00 م';

-- 2. Update the default settings record with the new timing
UPDATE public.site_settings
SET 
  hours_weekday = 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
  hours_friday = 'الأحد: 12:00 م - 8:00 م'
WHERE id = 'default-settings';
