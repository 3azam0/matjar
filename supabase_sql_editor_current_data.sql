-- ============================================
-- Supabase SQL Editor setup + current website data
-- Sahar Alsharq
--
-- Run this whole file in Supabase SQL Editor.
-- It fixes older integer id columns, creates missing columns/tables,
-- then inserts the current website content so it can be edited in /admin.
-- ============================================

-- 1. Drop known FK constraints before converting old integer ids to text.
ALTER TABLE IF EXISTS public.branch_links DROP CONSTRAINT IF EXISTS branch_links_branch_id_fkey;
ALTER TABLE IF EXISTS public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- 2. Convert old integer id columns to text if the tables already exist.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'site_settings',
    'features',
    'branches',
    'branch_links',
    'categories',
    'products'
  ]
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id DROP IDENTITY IF EXISTS', table_name);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id DROP DEFAULT', table_name);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id TYPE text USING id::text', table_name);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.branch_links') IS NOT NULL THEN
    ALTER TABLE public.branch_links
      ALTER COLUMN branch_id TYPE text USING branch_id::text;
  END IF;

  IF to_regclass('public.products') IS NOT NULL THEN
    ALTER TABLE public.products
      ALTER COLUMN category_id TYPE text USING category_id::text;
  END IF;
END $$;

-- 3. Create/repair the app schema.
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
  hours_weekday text DEFAULT 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
  hours_friday text DEFAULT 'الأحد: 12:00 م - 8:00 م',
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
  ADD COLUMN IF NOT EXISTS hours_weekday text DEFAULT 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
  ADD COLUMN IF NOT EXISTS hours_friday text DEFAULT 'الأحد: 12:00 م - 8:00 م',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.features (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
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

CREATE TABLE IF NOT EXISTS public.branches (
  id text PRIMARY KEY
);

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

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.branch_links (
  id text PRIMARY KEY,
  branch_id text NOT NULL,
  type text NOT NULL DEFAULT '',
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

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
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
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  note text DEFAULT '',
  category_id text,
  images text[] NOT NULL DEFAULT ARRAY[]::text[],
  order_index integer NOT NULL DEFAULT 0,
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
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.branch_links
  ADD CONSTRAINT branch_links_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE
  NOT VALID;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL
  NOT VALID;

-- 4. Current website data.
INSERT INTO public.site_settings (
  id,
  site_name,
  site_description,
  contact_email,
  contact_phone,
  social_facebook,
  social_instagram,
  social_whatsapp,
  hero_image,
  hero_title,
  hero_subtitle,
  hero_tagline,
  hero_desc_1,
  hero_desc_2,
  hero_desc_3,
  hero_desc_4,
  hero_whatsapp,
  products_per_page,
  hours_weekday,
  hours_friday
)
VALUES (
  'default-settings',
  'سحر الشرق',
  'للعبايات الشرقية والخليجية',
  'sahar.alsharq@gmail.com',
  '01121030583',
  'https://www.facebook.com/share/1AktcGb6b5/',
  'https://www.instagram.com/sahar_alsharq2022?igsh=bTI4enlpdTBiMjJm',
  'https://wa.me/201121030583',
  '',
  'سحر الشرق',
  'للعبايات الشرقية والخليجية',
  'أناقتك .. سر تميزك',
  'جودة عالية بخامات مختارة بعناية',
  'تصميم راقي للعبايات الشرقية والخليجية',
  'شحن سريع وآمن لكافة أنحاء مصر',
  'خدمة عملاء ودعم سريع واهتمام دائم',
  '201121030583',
  12,
  'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
  'الأحد: 12:00 م - 8:00 م'
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_description = EXCLUDED.site_description,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  social_facebook = EXCLUDED.social_facebook,
  social_instagram = EXCLUDED.social_instagram,
  social_whatsapp = EXCLUDED.social_whatsapp,
  hero_image = EXCLUDED.hero_image,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  hero_tagline = EXCLUDED.hero_tagline,
  hero_desc_1 = EXCLUDED.hero_desc_1,
  hero_desc_2 = EXCLUDED.hero_desc_2,
  hero_desc_3 = EXCLUDED.hero_desc_3,
  hero_desc_4 = EXCLUDED.hero_desc_4,
  hero_whatsapp = EXCLUDED.hero_whatsapp,
  products_per_page = EXCLUDED.products_per_page,
  hours_weekday = EXCLUDED.hours_weekday,
  hours_friday = EXCLUDED.hours_friday;

INSERT INTO public.features (id, title, description, icon, order_index)
VALUES
  ('feature-quality', 'جودة عالية', 'خامات مختارة بعناية', 'Award', 1),
  ('feature-design', 'تصميم راقي', 'عبايات شرقية وخليجية', 'Shirt', 2),
  ('feature-shipping', 'شحن سريع', 'لكافة أنحاء مصر', 'Truck', 3),
  ('feature-service', 'خدمة عملاء', 'دعم سريع واهتمام دائم', 'Headset', 4)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

INSERT INTO public.branches (id, name, phone, phone_tel, address_lines, map_query, order_index)
VALUES
  (
    'branch-mouski',
    'فرع الموسكي',
    '01121030583',
    '+201121030583',
    ARRAY['٤٢ شارع الموسكي الاول', 'بجانب عمارة نص الدنيا'],
    'https://maps.app.goo.gl/a3DKXyoQhqs4oFgK6?g_st=iw',
    1
  ),
  (
    'branch-azhar',
    'فرع الأزهر',
    '01050379643',
    '+201050379643',
    ARRAY['١٠٢ شارع الأزهر الرئيسي', 'بجانب مول الدرديري'],
    '١٠٢ شارع الأزهر الرئيسي، بجانب مول الدرديري، القاهرة، مصر',
    2
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  phone_tel = EXCLUDED.phone_tel,
  address_lines = EXCLUDED.address_lines,
  map_query = EXCLUDED.map_query,
  order_index = EXCLUDED.order_index;

INSERT INTO public.branch_links (id, branch_id, type, label, href)
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

INSERT INTO public.categories (id, title, description, order_index)
VALUES
  ('category-abayas', 'عبايات', 'عبايات شرقية وخليجية فاخرة', 1),
  ('category-dresses', 'فساتين', 'فساتين راقية بتصاميم متنوعة', 2),
  ('category-accessories', 'إكسسوارات', 'إكسسوارات تكميلية للعبايات', 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

INSERT INTO public.products (id, name, description, note, category_id, images, order_index)
VALUES
  ('product-abaya-1', 'عباية سوداء مطرزة', 'عباية سوداء فاخرة بتطريز ذهبي يدوي', 'تطريز ذهبي - متوفر مقاسات S إلى XXL', 'category-abayas', ARRAY[]::text[], 1),
  ('product-abaya-2', 'عباية بيج كلاسيك', 'عباية بيج بتصميم كلاسيكي أنيق', 'خامة ناعمة - متوفر مقاسات M إلى XL', 'category-abayas', ARRAY[]::text[], 2),
  ('product-dress-1', 'فستان سهرة أحمر', 'فستان سهرة أحمر بتصميم راقي', 'متوفر مقاسات S to L', 'category-dresses', ARRAY[]::text[], 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  note = EXCLUDED.note,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images,
  order_index = EXCLUDED.order_index;

-- 5. RLS: public frontend can read, authenticated admin can write.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branch_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.products;
CREATE POLICY "Enable read for authenticated users" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.products;
CREATE POLICY "Enable insert for authenticated users" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.products;
CREATE POLICY "Enable update for authenticated users" ON public.products FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.products;
CREATE POLICY "Enable delete for authenticated users" ON public.products FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.categories;
CREATE POLICY "Enable read for authenticated users" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.categories;
CREATE POLICY "Enable insert for authenticated users" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.categories;
CREATE POLICY "Enable update for authenticated users" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.categories;
CREATE POLICY "Enable delete for authenticated users" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.features;
CREATE POLICY "Enable read for authenticated users" ON public.features FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.features;
CREATE POLICY "Enable insert for authenticated users" ON public.features FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.features;
CREATE POLICY "Enable update for authenticated users" ON public.features FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.features;
CREATE POLICY "Enable delete for authenticated users" ON public.features FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.branches;
CREATE POLICY "Enable read for authenticated users" ON public.branches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.branches;
CREATE POLICY "Enable insert for authenticated users" ON public.branches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.branches;
CREATE POLICY "Enable update for authenticated users" ON public.branches FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.branches;
CREATE POLICY "Enable delete for authenticated users" ON public.branches FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.branch_links;
CREATE POLICY "Enable read for authenticated users" ON public.branch_links FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.branch_links;
CREATE POLICY "Enable insert for authenticated users" ON public.branch_links FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.branch_links;
CREATE POLICY "Enable update for authenticated users" ON public.branch_links FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.branch_links;
CREATE POLICY "Enable delete for authenticated users" ON public.branch_links FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.site_settings;
CREATE POLICY "Enable read for authenticated users" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.site_settings;
CREATE POLICY "Enable insert for authenticated users" ON public.site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.site_settings;
CREATE POLICY "Enable update for authenticated users" ON public.site_settings FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.site_settings;
CREATE POLICY "Enable delete for authenticated users" ON public.site_settings FOR DELETE USING (auth.role() = 'authenticated');
