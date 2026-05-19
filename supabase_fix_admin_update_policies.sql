-- ============================================
-- Allow authenticated admin users to edit branches and branch links
-- Run this in Supabase SQL Editor if admin saves do not persist.
-- ============================================

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.branches;
CREATE POLICY "Enable read for authenticated users" ON public.branches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.branches;
CREATE POLICY "Enable insert for authenticated users" ON public.branches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.branches;
CREATE POLICY "Enable update for authenticated users" ON public.branches
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.branches;
CREATE POLICY "Enable delete for authenticated users" ON public.branches
  FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.branch_links;
CREATE POLICY "Enable read for authenticated users" ON public.branch_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.branch_links;
CREATE POLICY "Enable insert for authenticated users" ON public.branch_links
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.branch_links;
CREATE POLICY "Enable update for authenticated users" ON public.branch_links
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.branch_links;
CREATE POLICY "Enable delete for authenticated users" ON public.branch_links
  FOR DELETE USING (auth.role() = 'authenticated');
