-- ============================================
-- Insert Catalog Data into Supabase
-- Categories and Products from src/data/catalog.js
-- ============================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM public.products;
-- DELETE FROM public.categories;

-- 1. Insert Categories
INSERT INTO public.categories (id, title, description, order_index)
VALUES 
  (
    'oriental-abayas',
    'عبايات شرقية',
    'تصاميم شرقية راقية بخامات مختارة وتطريز يدوي فاخر',
    0
  ),
  (
    'gulf-abayas',
    'عبايات خليجية',
    'أناقة الخليج الكلاسيكية برؤية عصرية تناسب كل الأوقات',
    1
  ),
  (
    'casual',
    'كاجوال وخروج',
    'موديلات عملية وعصرية تجمع بين الراحة وأناقة الخروج اليومي',
    2
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- 2. Insert Products for Oriental Abayas
INSERT INTO public.products (id, name, description, note, category_id, images, order_index)
VALUES
  (
    'oriental-1',
    'عباية الملكة',
    'عباية سوداء ملكية بتطريز ذهبي كثيف على الأكمام والصدر، مصممة للمناسبات الخاصة والاحتفالات.',
    'تطريز ذهبي — متوفر مقاسات S إلى XXL',
    'oriental-abayas',
    ARRAY[
      'https://images.unsplash.com/photo-1585144860131-245d551c77f6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800'
    ],
    0
  ),
  (
    'oriental-2',
    'سحر الشرق اليومية',
    'عباية عملية بتصميم انسيابي مريح، مثالية للعمل والخروجات اليومية بلمسة جمالية هادئة.',
    'خامة الكريب الفاخرة — ألوان متعددة',
    'oriental-abayas',
    ARRAY[
      'https://images.unsplash.com/photo-1594300062811-de3996701fe8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1567401893910-d9a562939c3f?auto=format&fit=crop&q=80&w=800'
    ],
    1
  ),
  (
    'oriental-3',
    'عباية الدانتيل الراقية',
    'مزيج ساحر بين القماش الفاخر والدانتيل الفرنسي الرقيق، لإطلالة أنثوية متكاملة.',
    'دانتيل فرنسي — قصّة واسعة',
    'oriental-abayas',
    ARRAY[
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    ],
    2
  );

-- 3. Insert Products for Gulf Abayas
INSERT INTO public.products (id, name, description, note, category_id, images, order_index)
VALUES
  (
    'gulf-1',
    'عباية "نجد" الخليجية',
    'عباية بشت خليجي أصيل بقصة واسعة جداً وتفاصيل دقيقة تعكس التراث العريق.',
    'ستايل بشت — قماش إنترنت ياباني',
    'gulf-abayas',
    ARRAY[
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800'
    ],
    0
  ),
  (
    'gulf-2',
    'عباية الريش الملكية',
    'تصميم مبتكر بلمسات من الريش الناعم على الأكمام، تمنحك حضوراً ملفتاً وراقياً.',
    'تفاصيل ريش — تفصيل حسب الطلب',
    'gulf-abayas',
    ARRAY[
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800'
    ],
    1
  ),
  (
    'gulf-3',
    'كلاسيك بلاك',
    'العباية الخليجية السوداء الأساسية، لا غنى عنها في خزانة كل امرأة تبحث عن الرقي البسيط.',
    'تصميم كلاسيكي — عملي وراقي',
    'gulf-abayas',
    ARRAY[
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
    ],
    2
  );

-- 4. Insert Products for Casual & Khurooj
INSERT INTO public.products (id, name, description, note, category_id, images, order_index)
VALUES
  (
    'casual-1',
    'طقم الخروج العملي',
    'عباية قطعتين بتصميم عصري وألوان صيفية مبهجة، مناسبة للجامعة والتنزه.',
    'قطعتين — خامة كتان باردة',
    'casual',
    ARRAY[
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585144860131-245d551c77f6?auto=format&fit=crop&q=80&w=800'
    ],
    0
  ),
  (
    'casual-2',
    'عباية الكتان المطرزة',
    'عباية من الكتان الطبيعي بتطريزات ناعمة على الجوانب، خيار مثالي للأجواء الحارة.',
    'كتان طبيعي — ألوان طبيعية',
    'casual',
    ARRAY[
      'https://images.unsplash.com/photo-1445205170230-053b830c6050?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1594300062811-de3996701fe8?auto=format&fit=crop&q=80&w=800'
    ],
    1
  );
