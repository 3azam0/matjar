import alRuknLogo from '../assets/alrukn-logo.png';
import alRuknHero from '../assets/hero-model.png';
import alBaytLogo from '../assets/albayt-logo.jpg';

export const CLIENT_KEYS = {
  AL_RUKN_AL_YAMANI: 'al-rukn-al-yamani',
  AL_BAYT_AL_KHALIJI: 'al-bayt-al-khaliji',
};

// --- Al Rukn Al Yamani ---
const alRuknFeatures = [
  { icon: 'Award', title: 'جودة عالية', sub: 'أفضل الأقمشة' },
  { icon: 'Gift', title: 'تغليف فاخر', sub: 'يليق بك' },
  { icon: 'Truck', title: 'شحن سريع', sub: 'لكافة المناطق' },
  { icon: 'RefreshCw', title: 'استبدال سهل', sub: 'خلال 7 أيام' },
];

const alRuknBranches = [
  {
    name: 'الفرع الرئيسي',
    address: ['6 حارة النوبي', 'شارع الجيش الموسكي', 'القاهرة، مصر'],
    phone: '01128806800',
    phoneTel: '+201128806800',
    mobile_1: '01128806800',
    mobile_2: '01068646144',
    landline: '25900625',
    mapSearchQuery: 'https://maps.app.goo.gl/NFi5pMAvHWVVFDnKA',
    links: [
      { type: 'whatsapp', label: 'واتساب', href: 'https://wa.me/201068646144' },
      { type: 'instagram', label: 'إنستغرام', href: 'https://www.instagram.com/alruknal_yamani' },
      { type: 'facebook', label: 'فيسبوك', href: 'https://www.facebook.com/Al-RuknAl-Yamanei' },
      { type: 'catalog', label: 'الكتالوج', to: '/catalog' },
    ],
  },
];

const alRuknCategories = [
  { id: 'category-new', title: 'وصل حديثاً', description: 'تصاميم وصلت حديثاً لموسم 2026' },
  { id: 'category-prayer', title: 'مجموعات الصلاة', description: 'أطقم صلاة مريحة ومميزة' },
  { id: 'category-luxury', title: 'عبايات فاخرة', description: 'عبايات خليجية فاخرة بأفخم الأقمشة' },
  { id: 'category-hijabs', title: 'طرح وأقمشة', description: 'طرح منسقة وأقمشة ناعمة عالية الجودة' },
  { id: 'category-beads', title: 'سبحات وملحقات', description: 'ملحقات وإكسسوارات متممة للأناقة' },
];

// --- Al Bayt Al Khaliji ---
const alBaytFeatures = [
  { icon: 'Award', title: 'خامات راقية', sub: 'أقمشة كريب كورية ويابانية مستوردة' },
  { icon: 'Scissors', title: 'تطريز يدوي', sub: 'دقة عالية وتفاصيل فاخرة بأيدي خبراء' },
  { icon: 'Truck', title: 'شحن سريع', sub: 'لكافة مدن ومحافظات المملكة وخارجها' },
  { icon: 'ShieldCheck', title: 'ضمان الجودة', sub: 'فحص دقيق لكل قطعة قبل الشحن' },
];

const alBaytBranches = [
  {
    name: 'المعرض الرئيسي',
    address: ['شارع العليا العام', 'الرياض، المملكة العربية السعودية'],
    phone: '0500000000',
    phoneTel: '+966500000000',
    mobile_1: '0500000000',
    mobile_2: '',
    landline: '',
    mapSearchQuery: 'https://maps.google.com',
    links: [
      { type: 'whatsapp', label: 'واتساب', href: 'https://wa.me/966500000000' },
      { type: 'instagram', label: 'إنستغرام', href: 'https://www.instagram.com/albayt_khaliji' },
      { type: 'catalog', label: 'الكتالوج', to: '/catalog' },
    ],
  },
];

const alBaytCategories = [
  { id: 'gulf-abayas', title: 'عبايات خليجية', description: 'أناقة الخليج الكلاسيكية بتفاصيل عصرية' },
  { id: 'practical-abayas', title: 'عبايات عملية', description: 'موديلات خفيفة ومريحة تناسب يومك العملي' },
  { id: 'occasions', title: 'عبايات مناسبات', description: 'قصات وتطريزات يدوية فاخرة لإطلالة مميزة' },
];

export const clients = {
  [CLIENT_KEYS.AL_RUKN_AL_YAMANI]: {
    key: CLIENT_KEYS.AL_RUKN_AL_YAMANI,
    name: 'Al RukN Al-YamaNi',
    displayName: 'الركن اليماني',
    logo: alRuknLogo,
    locale: 'ar_EG',
    url: '',
    catalogWhatsapp: '201068646144',
    settings: {
      hero_title: 'الركن اليماني',
      hero_subtitle: 'للعبايات الخليجية والزي الإسلامي',
      hero_tagline: 'فخامة تراث.. جمال يليق بك',
      hero_desc_1: 'جودة عالية بأفخر الأقمشة الخليجية',
      hero_desc_2: 'تغليف فاخر ومميز يليق بجمالكِ',
      hero_desc_3: 'شحن سريع وآمن لكافة المناطق',
      hero_desc_4: 'استبدال واسترجاع سهل خلال 7 أيام',
      hero_whatsapp: '201068646144',
      hero_image: alRuknHero,
      hero_images: [alRuknHero],
      contact_email: 'alruknalyamanei@gmail.com',
      social_instagram: 'https://www.instagram.com/alruknal_yamani',
      social_facebook: 'https://www.facebook.com/Al-RuknAl-Yamanei',
      social_tiktok: '',
      hours_weekday: 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
      hours_friday: 'الأحد: 12:00 م - 8:00 م',
    },
    features: alRuknFeatures,
    branches: alRuknBranches,
    categories: alRuknCategories,
    seo: {
      title: 'الركن اليماني — للعبايات الخليجية والزي الإسلامي',
      description: 'الركن اليماني للعبايات الخليجية والزي الإسلامي. تصفحي الكتالوج وتواصلي معنا عبر واتساب.',
      keywords: 'الركن اليماني, عبايات خليجية, عبايات, أزياء إسلامية, الموسكي',
      image: '',
    },
  },
  [CLIENT_KEYS.AL_BAYT_AL_KHALIJI]: {
    key: CLIENT_KEYS.AL_BAYT_AL_KHALIJI,
    name: 'Al-Bayt Al-Khaliji',
    displayName: 'البيت الخليجي',
    logo: alBaytLogo,
    locale: 'ar_SA',
    url: '',
    catalogWhatsapp: '966500000000',
    settings: {
      hero_title: 'البيت الخليجي',
      hero_subtitle: 'للعبايات الخليجية والزي الإسلامي الفاخر',
      hero_tagline: 'أصالة الخليج.. فخامة تليق بأناقتكِ',
      hero_desc_1: 'خامات خليجية فاخرة مستوردة لأجلكِ',
      hero_desc_2: 'تطريز يدوي متقن بدقة وتفاصيل متناهية',
      hero_desc_3: 'قصات وتصاميم حصرية تناسب كافة الأوقات',
      hero_desc_4: 'توصيل سريع وآمن لجميع مدن ومناطق المملكة',
      hero_whatsapp: '966500000000',
      hero_image: alRuknHero,
      hero_images: [alRuknHero],
      contact_email: 'info@albayt-khaliji.com',
      social_instagram: 'https://www.instagram.com/albayt_khaliji',
      social_facebook: '',
      social_tiktok: '',
      hours_weekday: 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
      hours_friday: 'الجمعة: 2:00 م - 10:00 م',
    },
    features: alRuknFeatures,
    branches: alBaytBranches,
    categories: alBaytCategories,
    seo: {
      title: 'البيت الخليجي — للعبايات الخليجية الراقية',
      description: 'البيت الخليجي للعبايات والزي الإسلامي الفاخر. تصفحي أرقى القصات والتطريزات الخليجية وتواصلي معنا مباشرة عبر واتساب.',
      keywords: 'البيت الخليجي, عبايات خليجية, عبايات فاخرة, الرياض, تفصيل عبايات, كريب فاخر',
      image: '',
    },
  },
};

const configuredClientKey = import.meta.env.VITE_CLIENT_KEY || CLIENT_KEYS.AL_RUKN_AL_YAMANI;

export const activeClient = clients[configuredClientKey] || clients[CLIENT_KEYS.AL_RUKN_AL_YAMANI];

export const contentSource = import.meta.env.VITE_CONTENT_SOURCE || 'local';

export const remoteContentEnabled = contentSource === 'supabase';

export function applyClientDocumentMeta(client = activeClient) {
  const { seo, displayName, locale } = client;
  const meta = {
    description: seo.description,
    keywords: seo.keywords,
    author: displayName,
    'og:title': seo.title,
    'og:description': seo.description,
    'og:url': client.url || window.location.href,
    'og:site_name': displayName,
    'og:locale': locale,
    'twitter:title': seo.title,
    'twitter:description': seo.description,
  };

  document.documentElement.lang = locale?.split('_')[0] || 'ar';
  document.documentElement.dir = 'rtl';
  document.body.dataset.client = client.key;
  document.title = seo.title;

  Object.entries(meta).forEach(([name, content]) => {
    const selector = name.startsWith('og:')
      ? `meta[property="${name}"]`
      : `meta[name="${name}"]`;
    const tag = document.querySelector(selector);
    if (tag && content) tag.setAttribute('content', content);
  });

  if (seo.image) {
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', seo.image);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', seo.image);
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', client.url || window.location.href);
}
