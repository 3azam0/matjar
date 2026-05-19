/**
 * Catalog: categories and products. Edit this file to update the storefront.
 * whatsappMessage: optional text appended when user taps "استفسار واتساب".
 */
export const CATALOG_WHATSAPP = '201121030583';

export const catalogCategories = [
  {
    id: 'oriental-abayas',
    title: 'عبايات شرقية',
    description: 'تصاميم شرقية راقية بخامات مختارة وتطريز يدوي فاخر',
    products: [
      {
        id: 'oriental-1',
        name: 'عباية الملكة',
        description: 'عباية سوداء ملكية بتطريز ذهبي كثيف على الأكمام والصدر، مصممة للمناسبات الخاصة والاحتفالات.',
        images: [
          'https://images.unsplash.com/photo-1585144860131-245d551c77f6?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'تطريز ذهبي — متوفر مقاسات S إلى XXL',
      },
      {
        id: 'oriental-2',
        name: 'سحر الشرق اليومية',
        description: 'عباية عملية بتصميم انسيابي مريح، مثالية للعمل والخروجات اليومية بلمسة جمالية هادئة.',
        images: [
          'https://images.unsplash.com/photo-1594300062811-de3996701fe8?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1567401893910-d9a562939c3f?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'خامة الكريب الفاخرة — ألوان متعددة',
      },
      {
        id: 'oriental-3',
        name: 'عباية الدانتيل الراقية',
        description: 'مزيج ساحر بين القماش الفاخر والدانتيل الفرنسي الرقيق، لإطلالة أنثوية متكاملة.',
        images: [
          'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'دانتيل فرنسي — قصّة واسعة',
      },
    ],
  },
  {
    id: 'gulf-abayas',
    title: 'عبايات خليجية',
    description: 'أناقة الخليج الكلاسيكية برؤية عصرية تناسب كل الأوقات',
    products: [
      {
        id: 'gulf-1',
        name: 'عباية "نجد" الخليجية',
        description: 'عباية بشت خليجي أصيل بقصة واسعة جداً وتفاصيل دقيقة تعكس التراث العريق.',
        images: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'ستايل بشت — قماش إنترنت ياباني',
      },
      {
        id: 'gulf-2',
        name: 'عباية الريش الملكية',
        description: 'تصميم مبتكر بلمسات من الريش الناعم على الأكمام، تمنحك حضوراً ملفتاً وراقياً.',
        images: [
          'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'تفاصيل ريش — تفصيل حسب الطلب',
      },
      {
        id: 'gulf-3',
        name: 'كلاسيك بلاك',
        description: 'العباية الخليجية السوداء الأساسية، لا غنى عنها في خزانة كل امرأة تبحث عن الرقي البسيط.',
        images: [
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'تصميم كلاسيكي — عملي وراقي',
      },
    ],
  },
  {
    id: 'casual',
    title: 'كاجوال وخروج',
    description: 'موديلات عملية وعصرية تجمع بين الراحة وأناقة الخروج اليومي',
    products: [
      {
        id: 'casual-1',
        name: 'طقم الخروج العملي',
        description: 'عباية قطعتين بتصميم عصري وألوان صيفية مبهجة، مناسبة للجامعة والتنزه.',
        images: [
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1585144860131-245d551c77f6?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'قطعتين — خامة كتان باردة',
      },
      {
        id: 'casual-2',
        name: 'عباية الكتان المطرزة',
        description: 'عباية من الكتان الطبيعي بتطريزات ناعمة على الجوانب، خيار مثالي للأجواء الحارة.',
        images: [
          'https://images.unsplash.com/photo-1445205170230-053b830c6050?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1594300062811-de3996701fe8?auto=format&fit=crop&q=80&w=800'
        ],
        note: 'كتان طبيعي — ألوان طبيعية',
      },
    ],
  },
];
