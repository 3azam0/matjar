-- ============================================
-- Insert current branches + social links only
-- Copy and run this whole file in Supabase SQL Editor.
-- Do not stop before the final semicolon.
-- ============================================

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '';

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS phone_tel text DEFAULT '';

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS address_lines text[] NOT NULL DEFAULT ARRAY[]::text[];

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS map_query text;

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0;

ALTER TABLE public.branch_links
  ADD COLUMN IF NOT EXISTS branch_id text;

ALTER TABLE public.branch_links
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT '';

ALTER TABLE public.branch_links
  ADD COLUMN IF NOT EXISTS label text DEFAULT '';

ALTER TABLE public.branch_links
  ADD COLUMN IF NOT EXISTS href text NOT NULL DEFAULT '';

INSERT INTO public.branches (
  id, name, phone, phone_tel, address_lines, map_query, order_index
)
VALUES
  ('branch-mouski', 'فرع الموسكي', '01121030583', '+201121030583', ARRAY['٤٢ شارع الموسكي الاول', 'بجانب عمارة نص الدنيا'], 'https://maps.app.goo.gl/a3DKXyoQhqs4oFgK6?g_st=iw', 1),
  ('branch-azhar', 'فرع الأزهر', '01050379643', '+201050379643', ARRAY['١٠٢ شارع الأزهر الرئيسي', 'بجانب مول الدرديري'], '١٠٢ شارع الأزهر الرئيسي، بجانب مول الدرديري، القاهرة، مصر', 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  phone_tel = EXCLUDED.phone_tel,
  address_lines = EXCLUDED.address_lines,
  map_query = EXCLUDED.map_query,
  order_index = EXCLUDED.order_index;

INSERT INTO public.branch_links (
  id, branch_id, type, label, href
)
VALUES
  ('link-mouski-whatsapp', 'branch-mouski', 'whatsapp', 'واتساب', 'https://wa.me/201121030583'),
  ('link-mouski-instagram', 'branch-mouski', 'instagram', 'إنستغرام', 'https://www.instagram.com/sahar_alsharq2022?igsh=bTI4enlpdTBiMjJm'),
  ('link-mouski-facebook', 'branch-mouski', 'facebook', 'فيسبوك', 'https://www.facebook.com/share/1AktcGb6b5/'),
  ('link-mouski-tiktok', 'branch-mouski', 'tiktok', 'تيك توك', 'https://www.tiktok.com/@saheralshark?_r=1&_t=ZS-95OeCXIIrqs'),
  ('link-azhar-whatsapp', 'branch-azhar', 'whatsapp', 'واتساب', 'https://wa.me/201050379643'),
  ('link-azhar-facebook', 'branch-azhar', 'facebook', 'فيسبوك', 'https://www.facebook.com/share/1EZ4bP3t9M/?mibextid=wwXIfr'),
  ('link-azhar-tiktok', 'branch-azhar', 'tiktok', 'تيك توك', 'https://www.tiktok.com/@sehr_elsharq?_r=1&_t=ZS-96HIj9Lx99U')
ON CONFLICT (id) DO UPDATE SET
  branch_id = EXCLUDED.branch_id,
  type = EXCLUDED.type,
  label = EXCLUDED.label,
  href = EXCLUDED.href;
