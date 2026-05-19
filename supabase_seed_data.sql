-- ============================================
-- Seed Data for Sahar Alsharq
-- Populate tables with default website data
-- ============================================

-- 1. Insert Site Settings
INSERT INTO public.site_settings (id, site_name, site_description, contact_email, contact_phone, social_facebook, social_instagram, social_whatsapp, hero_image, products_per_page, hours_weekday, hours_friday)
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
  products_per_page = EXCLUDED.products_per_page,
  hours_weekday = EXCLUDED.hours_weekday,
  hours_friday = EXCLUDED.hours_friday;

-- 2. Insert Features
INSERT INTO public.features (id, title, description, icon)
VALUES 
  ('feature-quality', 'جودة عالية', 'خامات مختارة بعناية', 'Award'),
  ('feature-design', 'تصميم راقي', 'عبايات شرقية وخليجية', 'Shirt'),
  ('feature-shipping', 'شحن سريع', 'لكافة أنحاء مصر', 'Truck'),
  ('feature-service', 'خدمة عملاء', 'دعم سريع واهتمام دائم', 'Headset')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- 3. Insert Branches
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

-- 4. Insert Branch Links for Mouski Branch
INSERT INTO public.branch_links (id, branch_id, type, label, href)
VALUES 
  (
    'link-mouski-whatsapp',
    'branch-mouski',
    'whatsapp',
    'واتساب',
    'https://wa.me/201121030583'
  ),
  (
    'link-mouski-instagram',
    'branch-mouski',
    'instagram',
    'إنستغرام',
    'https://www.instagram.com/sahar_alsharq2022?igsh=bTI4enlpdTBiMjJm'
  ),
  (
    'link-mouski-facebook',
    'branch-mouski',
    'facebook',
    'فيسبوك',
    'https://www.facebook.com/share/1AktcGb6b5/'
  ),
  (
    'link-mouski-tiktok',
    'branch-mouski',
    'tiktok',
    'تيك توك',
    'https://www.tiktok.com/@saheralshark?_r=1&_t=ZS-95OeCXIIrqs'
  )
ON CONFLICT (id) DO UPDATE SET
  branch_id = EXCLUDED.branch_id,
  type = EXCLUDED.type,
  label = EXCLUDED.label,
  href = EXCLUDED.href;

-- 5. Insert Branch Links for Azhar Branch
INSERT INTO public.branch_links (id, branch_id, type, label, href)
VALUES 
  (
    'link-azhar-whatsapp',
    'branch-azhar',
    'whatsapp',
    'واتساب',
    'https://wa.me/201050379643'
  ),
  (
    'link-azhar-facebook',
    'branch-azhar',
    'facebook',
    'فيسبوك',
    'https://www.facebook.com/share/1EZ4bP3t9M/?mibextid=wwXIfr'
  ),
  (
    'link-azhar-tiktok',
    'branch-azhar',
    'tiktok',
    'تيك توك',
    'https://www.tiktok.com/@sehr_elsharq?_r=1&_t=ZS-96HIj9Lx99U'
  )
ON CONFLICT (id) DO UPDATE SET
  branch_id = EXCLUDED.branch_id,
  type = EXCLUDED.type,
  label = EXCLUDED.label,
  href = EXCLUDED.href;

-- 6. Insert Sample Categories
INSERT INTO public.categories (id, title, description)
VALUES 
  ('category-abayas', 'عبايات', 'عبايات شرقية وخليجية فاخرة'),
  ('category-dresses', 'فساتين', 'فساتين راقية بتصاميم متنوعة'),
  ('category-accessories', 'إكسسوارات', 'إكسسوارات تكميلية للعبايات')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 7. Insert Sample Products
INSERT INTO public.products (id, name, description, note, category_id, images)
VALUES 
  (
    'product-abaya-1',
    'عباية سوداء مطرزة',
    'عباية سوداء فاخرة بتطريز ذهبي يدوي',
    'تطريز ذهبي — متوفر مقاسات S إلى XXL',
    'category-abayas',
    ARRAY[]::text[]
  ),
  (
    'product-abaya-2',
    'عباية بيج كلاسيك',
    'عباية بيج بتصميم كلاسيكي أنيق',
    'خامة ناعمة — متوفر مقاسات M إلى XL',
    'category-abayas',
    ARRAY[]::text[]
  ),
  (
    'product-dress-1',
    'فستان سهرة أحمر',
    'فستان سهرة أحمر بتصميم راقي',
    'متوفر مقاسات S to L',
    'category-dresses',
    ARRAY[]::text[]
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  note = EXCLUDED.note,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images;
