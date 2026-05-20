-- ============================================
-- Seed Data for Al Rukn Al Yamani (الركن اليماني)
-- Populate tables with client website settings, branches,
-- categories, and premium products.
-- ============================================

-- 1. Insert/Update Site Settings
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
  products_per_page,
  hours_weekday,
  hours_friday
)
VALUES (
  'default-settings',
  'الركن اليماني',
  'للعبايات الخليجية والزي الإسلامي',
  'alruknalyamanei@gmail.com',
  '01128806800',
  'https://www.facebook.com/Al-RuknAl-Yamanei',
  'https://www.instagram.com/alruknal_yamani',
  'https://wa.me/201068646144',
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1200',
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

-- 2. Insert/Update Features
INSERT INTO public.features (id, title, description, icon)
VALUES 
  ('feature-quality', 'جودة عالية', 'أفضل الأقمشة', 'Award'),
  ('feature-design', 'تغليف فاخر', 'يليق بك', 'Gift'),
  ('feature-shipping', 'شحن سريع', 'لكافة المناطق', 'Truck'),
  ('feature-service', 'استبدال سهل', 'خلال 7 أيام', 'RefreshCw')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- Clean up existing branches & links first to ensure clean state
DELETE FROM public.branch_links;
DELETE FROM public.branches;

-- 3. Insert Branches
INSERT INTO public.branches (id, name, phone, phone_tel, address_lines, map_query, order_index)
VALUES 
  (
    'branch-main',
    'الفرع الرئيسي',
    '01128806800',
    '+201128806800',
    ARRAY['6 حارة النوبي', 'شارع الجيش الموسكي', 'القاهرة، مصر'],
    'https://maps.app.goo.gl/NFi5pMAvHWVVFDnKA',
    1
  );

-- 4. Insert Branch Links
INSERT INTO public.branch_links (id, branch_id, type, label, href)
VALUES 
  (
    'link-main-whatsapp',
    'branch-main',
    'whatsapp',
    'واتساب',
    'https://wa.me/201068646144'
  ),
  (
    'link-main-instagram',
    'branch-main',
    'instagram',
    'إنستغرام',
    'https://www.instagram.com/alruknal_yamani'
  ),
  (
    'link-main-facebook',
    'branch-main',
    'facebook',
    'فيسبوك',
    'https://www.facebook.com/Al-RuknAl-Yamanei'
  );

-- Clean up categories & products to populate new ones
DELETE FROM public.products;
DELETE FROM public.categories;

-- 5. Insert Categories
INSERT INTO public.categories (id, title, description)
VALUES 
  ('category-new', 'وصل حديثاً', 'تصاميم وصلت حديثاً لموسم 2026'),
  ('category-prayer', 'مجموعات الصلاة', 'أطقم صلاة مريحة ومميزة'),
  ('category-luxury', 'عبايات فاخرة', 'عبايات خليجية فاخرة بأفخم الأقمشة'),
  ('category-hijabs', 'طرح وأقمشة', 'طرح منسقة وأقمشة ناعمة عالية الجودة'),
  ('category-beads', 'سبحات وملحقات', 'ملحقات وإكسسوارات متممة للأناقة');

-- 6. Insert Products
INSERT INTO public.products (id, name, description, note, category_id, images, order_index, is_visible)
VALUES 
  (
    'product-royal',
    'عباية ملكية مطرزة',
    'عباية ملكية فاخرة بتطريز ذهبي يدوي ونقوش راقية',
    '450 ر.س — متوفر مقاسات S إلى XXL',
    'category-new',
    ARRAY['https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800']::text[],
    1,
    true
  ),
  (
    'product-cloche',
    'عباية كلوش فاخرة',
    'عباية كلوش بتصميم انسيابي جذاب وحركة ناعمة',
    '420 ر.س — متوفر مقاسات M إلى XL',
    'category-new',
    ARRAY['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800']::text[],
    2,
    true
  ),
  (
    'product-chamois',
    'عباية شموه مطرزة',
    'عباية من قماش الشموه الفاخر وتطريز مميز على الأكمام',
    '470 ر.س — خامة ناعمة وألوان دافئة',
    'category-new',
    ARRAY['https://images.unsplash.com/photo-1594300062811-de3996701fe8?q=80&w=800']::text[],
    3,
    true
  ),
  (
    'product-bisht',
    'عباية بيشت أنيقة',
    'عباية بيشت كلاسيكية واسعة بتطريز ذهبي ناعم وراقٍ',
    '430 ر.س — ستايل بشت واسع',
    'category-new',
    ARRAY['https://images.unsplash.com/photo-1572804013427-4d7ca7268217?q=80&w=800']::text[],
    4,
    true
  ),
  (
    'product-wide',
    'عباية بقصة واسعة',
    'عباية سوداء بقصة واسعة وتصميم مريح وعصري للأناقة اليومية',
    '390 ر.س — خامة كريب كوري',
    'category-new',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800']::text[],
    5,
    true
  );
