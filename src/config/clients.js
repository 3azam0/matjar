import saharLogo from '../assets/logo-old.png';

export const CLIENT_KEYS = {
  SAHAR_ALSHARQ: 'sahar-alsharq',
  AL_RUKN_AL_YAMANI: 'al-rukn-al-yamani',
};

const commonFeatures = [
  { icon: 'Award', title: 'جودة عالية', sub: 'خامات مختارة بعناية' },
  { icon: 'Shirt', title: 'تصميم راقي', sub: 'عبايات شرقية وخليجية' },
  { icon: 'Truck', title: 'شحن سريع', sub: 'لكافة أنحاء مصر' },
  { icon: 'Headset', title: 'خدمة عملاء', sub: 'دعم سريع واهتمام دائم' },
];

const saharBranches = [
  {
    name: 'فرع الموسكي',
    address: ['٤٢ شارع الموسكي الاول', 'بجانب عمارة نص الدنيا'],
    phone: '01121030583',
    phoneTel: '+201121030583',
    mobile_1: '01121030583',
    mobile_2: '',
    landline: '',
    mapSearchQuery: 'https://maps.app.goo.gl/a3DKXyoQhqs4oFgK6?g_st=iw',
    links: [
      { type: 'whatsapp', label: 'واتساب', href: 'https://wa.me/201121030583' },
      { type: 'instagram', label: 'إنستغرام', href: 'https://www.instagram.com/sahar_alsharq2022?igsh=bTI4enlpdTBiMjJm' },
      { type: 'facebook', label: 'فيسبوك', href: 'https://www.facebook.com/share/1AktcGb6b5/' },
      { type: 'tiktok', label: 'تيك توك', href: 'https://www.tiktok.com/@saheralshark?_r=1&_t=ZS-95OeCXIIrqs' },
      { type: 'catalog', label: 'الكتالوج', to: '/catalog' },
    ],
  },
  {
    name: 'فرع الأزهر',
    address: ['١٠٢ شارع الأزهر الرئيسي', 'بجانب مول الدرديري'],
    phone: '01050379643',
    phoneTel: '+201050379643',
    mobile_1: '01050379643',
    mobile_2: '',
    landline: '',
    mapSearchQuery: '١٠٢ شارع الأزهر الرئيسي، بجانب مول الدرديري، القاهرة، مصر',
    links: [
      { type: 'whatsapp', label: 'واتساب', href: 'https://wa.me/201050379643' },
      { type: 'facebook', label: 'فيسبوك', href: 'https://www.facebook.com/share/1EZ4bP3t9M/?mibextid=wwXIfr' },
      { type: 'tiktok', label: 'تيك توك', href: 'https://www.tiktok.com/@sehr_elsharq?_r=1&_t=ZS-96HIj9Lx99U' },
      { type: 'catalog', label: 'الكتالوج', to: '/catalog' },
    ],
  },
];

const alRuknBranches = [
  {
    name: 'الفرع الرئيسي',
    address: ['سيتم إضافة العنوان'],
    phone: '',
    phoneTel: '',
    mobile_1: '',
    mobile_2: '',
    landline: '',
    mapSearchQuery: 'القاهرة، مصر',
    links: [
      { type: 'catalog', label: 'الكتالوج', to: '/catalog' },
    ],
  },
];

export const clients = {
  [CLIENT_KEYS.SAHAR_ALSHARQ]: {
    key: CLIENT_KEYS.SAHAR_ALSHARQ,
    name: 'سحر الشرق',
    displayName: 'سحر الشرق',
    logo: saharLogo,
    locale: 'ar_EG',
    url: 'https://sahar-alsharq.pages.dev/',
    catalogWhatsapp: '201121030583',
    settings: {
      hero_title: 'سحر الشرق',
      hero_subtitle: 'للعبايات الشرقية والخليجية',
      hero_tagline: 'أناقتك .. سر تميزك',
      hero_desc_1: 'عبايات فاخرة بتصميم شرقي وخليجي',
      hero_desc_2: 'خامات مميزة .. تفاصيل راقية',
      hero_whatsapp: '201121030583',
      hero_image: '',
      hero_images: [],
      contact_email: 'sahar.alsharq@gmail.com',
      social_instagram: 'https://www.instagram.com/sahar_alsharq2022',
      social_facebook: 'https://www.facebook.com/share/1AktcGb6b5/',
      social_tiktok: 'https://www.tiktok.com/@saheralshark',
      hours_weekday: 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
      hours_friday: 'الأحد: 12:00 م - 8:00 م',
    },
    features: commonFeatures,
    branches: saharBranches,
    seo: {
      title: 'سحر الشرق — للعبايات الشرقية والخليجية',
      description: 'سحر الشرق — عبايات شرقية وخليجية فاخرة بتصميم راقي وخامات مميزة. تصفحي الكتالوج وتواصلي معنا عبر واتساب.',
      keywords: 'عبايات, عبايات شرقية, عبايات خليجية, سحر الشرق, أزياء, ملابس نسائية, عبايات فاخرة, مصر',
      image: 'https://sahar-alsharq.pages.dev/favicon.png',
    },
  },
  [CLIENT_KEYS.AL_RUKN_AL_YAMANI]: {
    key: CLIENT_KEYS.AL_RUKN_AL_YAMANI,
    name: 'Al RukN Al-YamaNi',
    displayName: 'الركن اليماني',
    logo: saharLogo,
    locale: 'ar_EG',
    url: '',
    catalogWhatsapp: '',
    settings: {
      hero_title: 'Al RukN Al-YamaNi',
      hero_subtitle: 'الركن اليماني',
      hero_tagline: 'أناقة بتفاصيل مميزة',
      hero_desc_1: 'مجموعة مختارة بعناية لذوق راق',
      hero_desc_2: 'تصميم أنيق وخدمة موثوقة',
      hero_whatsapp: '',
      hero_image: '',
      hero_images: [],
      contact_email: '',
      social_instagram: '',
      social_facebook: '',
      social_tiktok: '',
      hours_weekday: 'طوال أيام الأسبوع: سيتم تحديد المواعيد',
      hours_friday: 'الجمعة: سيتم تحديد المواعيد',
    },
    features: commonFeatures,
    branches: alRuknBranches,
    seo: {
      title: 'Al RukN Al-YamaNi',
      description: 'Al RukN Al-YamaNi — كتالوج منتجات بتجربة تصفح سهلة وتواصل مباشر.',
      keywords: 'Al RukN Al-YamaNi, الركن اليماني, كتالوج, منتجات',
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
