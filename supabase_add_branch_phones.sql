-- Add two mobile phone columns and one landline phone column to the branches table
ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS mobile_1 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS mobile_2 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS landline text DEFAULT '';

-- Optional: Update existing records to set mobile_1 to the legacy phone value as a starting point
UPDATE public.branches
SET mobile_1 = phone
WHERE mobile_1 IS NULL OR mobile_1 = '';
