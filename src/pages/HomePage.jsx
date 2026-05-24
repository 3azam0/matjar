import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  Award,
  BookOpen,
  Clock,
  Headset,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shirt,
  Truck,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { ContactForm } from '../components/ContactForm';
import { useNotification } from '../lib/NotificationContext';
import { api, withRetry } from '../services/api';
import { supabase } from '../lib/supabase';
import { getWhatsAppHref, formatWhatsAppNumber } from '../lib/whatsapp.js';
import brandLogo from '../assets/logo-old.png';
import '../App.css';
import '../styles/ErrorDisplay.css';

const ICON_MAP = {
  Award: <Award />,
  Shirt: <Shirt />,
  Truck: <Truck />,
  Headset: <Headset />,
  BookOpen: <BookOpen />,
  MessageCircle: <MessageCircle />,
  Phone: <Phone />,
  Mail: <Mail />,
  MapPin: <MapPin />,
  Clock: <Clock />,
};

/** Stable Google Maps links for browsers, iOS, and Android (opens Maps app when installed). */
function mapsUrlsFromSearchQuery(query) {
  if (typeof query === 'string' && query.includes('maps.app.goo.gl')) {
    // Official Business Place ID mapping for Mosky branch (Sahar Alsharq Mosky)
    if (query.includes('a3DKXyoQhqs4oFgK6')) {
      const q = encodeURIComponent('سحر الشرق، الموسكي، القاهرة');
      return {
        mapUrl: 'https://maps.app.goo.gl/a3DKXyoQhqs4oFgK6',
        mapEmbedUrl: `https://www.google.com/maps?q=${q}&ftid=0x1458410585ac478b:0x975302c7592517c7&output=embed&hl=ar&z=17`,
      };
    }
    // Generic fallback for maps short URLs
    return {
      mapUrl: query,
      mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=17&ie=UTF8&iwloc=&output=embed`,
    };
  }

  // Official, click-safe street address mapping for Azhar branch (places pin and loads safely)
  if (typeof query === 'string' && (query.includes('الأزهر') || query.includes('الأزهر الرئيسي'))) {
    const q = encodeURIComponent('١٠٢ شارع الأزهر، القاهرة، مصر');
    return {
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      mapEmbedUrl: `https://maps.google.com/maps?q=${q}&t=&z=17&ie=UTF8&iwloc=&output=embed`,
    };
  }

  if (typeof query === 'string' && (query.startsWith('http://') || query.startsWith('https://'))) {
    let embedUrl = query;
    if (query.includes('google.com/maps')) {
      if (!query.includes('output=embed')) {
        embedUrl = query.includes('?') ? `${query}&output=embed` : `${query}?output=embed`;
      }
    }
    return {
      mapUrl: query,
      mapEmbedUrl: embedUrl,
    };
  }

  const encoded = encodeURIComponent(query.trim());
  return {
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    mapEmbedUrl: `https://maps.google.com/maps?q=${encoded}&t=&z=17&ie=UTF8&iwloc=&output=embed`,
  };
}

const WhatsAppIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.54 0 .2 5.32.19 11.88c0 2.1.55 4.15 1.6 5.96L.1 24l6.31-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.33 11.9-11.89 0-3.17-1.24-6.16-3.48-8.43Zm-8.42 18.3h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.83 9.83 0 0 1-1.5-5.28c0-5.44 4.43-9.86 9.88-9.86a9.8 9.8 0 0 1 6.98 2.89 9.81 9.81 0 0 1 2.89 7c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.08-.13-.27-.2-.57-.35Z" />
  </svg>
);

const FacebookIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14.2 8.1V6.7c0-.7.16-1.08 1.18-1.08h1.5V3h-2.4c-2.87 0-3.88 1.34-3.88 3.63v1.47H8.8v2.93h1.8V21h3.6v-9.97h2.41l.32-2.93H14.2Z" />
  </svg>
);

const TikTokIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-6.13 6.29 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.16 8.16 0 0 0 4.77 1.52V7.07a4.85 4.85 0 0 1-1-.38Z" />
  </svg>
);

const InstagramIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const SOCIAL_ICONS = {
  whatsapp: <WhatsAppIcon />,
  instagram: <InstagramIcon />,
  facebook: <FacebookIcon />,
  tiktok: <TikTokIcon />,
  catalog: <BookOpen />,
};

const Divider = () => (
  <div className="divider" aria-hidden="true">
    <span />
    <b>◇</b>
    <span />
  </div>
);

const HeroFlourish = () => (
  <svg className="hero-flourish" viewBox="0 0 200 20" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      d="M20 10h36M144 10h36M99 10h2M72 10c8-6 18-6 26 0M102 10c8 6 18 6 26 0M56 10c-6-4-12-4-18 0M56 10c-6 4-12 4-18 0M162 10c6-4 12-4 18 0M162 10c6 4 12 4 18 0"
    />
    <path
      fill="currentColor"
      d="M98.2 7.2l1.8 3.2 1.8-3.2-1.8-3.2-1.8 3.2z"
    />
  </svg>
);

const DEFAULT_FEATURES = [
  { icon: <Award />, title: 'جودة عالية', sub: 'خامات مختارة بعناية' },
  { icon: <Shirt />, title: 'تصميم راقي', sub: 'عبايات شرقية وخليجية' },
  { icon: <Truck />, title: 'شحن سريع', sub: 'لكافة أنحاء مصر' },
  { icon: <Headset />, title: 'خدمة عملاء', sub: 'دعم سريع واهتمام دائم' },
];

const DEFAULT_BRANCHES = [
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
      { cls: 'whatsapp', icon: SOCIAL_ICONS.whatsapp, label: 'واتساب', href: 'https://wa.me/201121030583' },
      {
        cls: 'instagram',
        icon: SOCIAL_ICONS.instagram,
        label: 'إنستغرام',
        href: 'https://www.instagram.com/sahar_alsharq2022?igsh=bTI4enlpdTBiMjJm',
      },
      { cls: 'facebook', icon: SOCIAL_ICONS.facebook, label: 'فيسبوك', href: 'https://www.facebook.com/share/1AktcGb6b5/' },
      { cls: 'tiktok', icon: SOCIAL_ICONS.tiktok, label: 'تيك توك', href: 'https://www.tiktok.com/@saheralshark?_r=1&_t=ZS-95OeCXIIrqs' },
      { cls: 'catalog', icon: SOCIAL_ICONS.catalog, label: 'الكتالوج', to: '/catalog' },
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
      { cls: 'whatsapp', icon: SOCIAL_ICONS.whatsapp, label: 'واتساب', href: 'https://wa.me/201050379643' },
      { cls: 'facebook', icon: SOCIAL_ICONS.facebook, label: 'فيسبوك', href: 'https://www.facebook.com/share/1EZ4bP3t9M/?mibextid=wwXIfr' },
      { cls: 'tiktok', icon: SOCIAL_ICONS.tiktok, label: 'تيك توك', href: 'https://www.tiktok.com/@sehr_elsharq?_r=1&_t=ZS-96HIj9Lx99U' },
      { cls: 'catalog', icon: SOCIAL_ICONS.catalog, label: 'الكتالوج', to: '/catalog' },
    ],
  },
].map((b) => ({ ...b, ...mapsUrlsFromSearchQuery(b.mapSearchQuery) }));

const DEFAULT_SETTINGS = {
  hero_title: 'سحر الشرق',
  hero_subtitle: 'للعبايات الشرقية والخليجية',
  hero_tagline: 'أناقتك .. سر تميزك',
  hero_desc_1: 'عبايات فاخرة بتصميم شرقي وخليجي',
  hero_desc_2: 'خامات مميزة .. تفاصيل راقية',
  hero_whatsapp: '201121030583',
  hero_image: '',
  hero_images: [],
  contact_email: 'sahar.alsharq@gmail.com',
  hours_weekday: 'طوال أيام الأسبوع: 10:00 ص - 10:00 م',
  hours_friday: 'الأحد: 12:00 م - 8:00 م',
};

function digitsOnly(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function mapSettings(settings) {
  if (!settings) return {};

  const whatsappNumber = formatWhatsAppNumber(settings.social_whatsapp) || formatWhatsAppNumber(settings.contact_phone);

  return {
    ...settings,
    hero_title: settings.hero_title || settings.site_name,
    hero_subtitle: settings.hero_subtitle || settings.site_description,
    hero_whatsapp: settings.hero_whatsapp || whatsappNumber,
  };
}

export function HomePage() {
  const { showError, showWarning } = useNotification();
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = (Array.isArray(settings.hero_images) && settings.hero_images.length > 0)
    ? settings.hero_images
    : (settings.hero_image ? [settings.hero_image] : []);

  // Auto-slide: start immediately when 2+ images, cycle every 5s
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setTimeout(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [heroIndex, heroImages.length]);

  // Manual dot click
  const goToHero = useCallback((index) => {
    setHeroIndex(index);
  }, []);

  // Reset to first slide when images change
  useEffect(() => {
    setHeroIndex(0);
  }, [settings.hero_images, settings.hero_image]);

  async function fetchData() {
    setIsLoading(true);
    setLoadError(null);

    try {
      // Fetch Settings with retry
      const sData = await withRetry(() => api.getSettings());
      if (sData) setSettings((prev) => ({ ...prev, ...mapSettings(sData) }));

      // Fetch Features with retry
      const fData = await withRetry(() => api.getFeatures());
      if (fData && fData.length > 0) {
        setFeatures(fData.map((f) => ({
          ...f,
          icon: ICON_MAP[f.icon] || ICON_MAP[f.icon_name] || <Award />,
          sub: f.description || f.subtitle || '',
        })));
      }

      // Fetch Branches and Branch Links with retry
      const [bData, blData] = await Promise.all([
        withRetry(() => api.getBranches()),
        withRetry(() => api.getBranchLinks()),
      ]);
      console.log('Branches fetched from DB:', bData);
      console.log('Branch Links fetched from DB:', blData);

      if (bData && bData.length > 0) {
        // Group branch_links by branch_id
        const linksByBranchId = (blData || []).reduce((acc, link) => {
          if (!acc[link.branch_id]) acc[link.branch_id] = [];
          acc[link.branch_id].push(link);
          return acc;
        }, {});

        setBranches(
          bData.map((b) => {
            const addressLines = Array.isArray(b.address_lines)
              ? b.address_lines
              : (Array.isArray(b.address) ? b.address : []);
            const mapQuery = typeof b.map_query === 'string' && b.map_query.trim()
              ? b.map_query.trim()
              : addressLines.join('، ');

            // Get links for this branch from the grouped links
            const branchLinksList = linksByBranchId[b.id] || [];
            const links = branchLinksList.map((l) => ({
              ...l,
              cls: l.type,
              icon: SOCIAL_ICONS[l.type] || <MessageCircle />,
              href: l.type === 'whatsapp' ? getWhatsAppHref(l.href) : l.href,
            }));

            if (!links.some((link) => link.to === '/catalog')) {
              links.push({
                cls: 'catalog',
                icon: SOCIAL_ICONS.catalog,
                label: 'الكتالوج',
                to: '/catalog',
              });
            }
            return {
              ...b,
              name: b.name || 'فرع',
              address: addressLines.length ? addressLines : [''],
              phone: b.phone || '',
              phoneTel: b.phone_tel || b.phoneTel || '',
              links,
              ...mapsUrlsFromSearchQuery(mapQuery || 'القاهرة، مصر'),
            };
          })
        );
      }
    } catch (err) {
      console.error('Error fetching home page data:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        details: err.details || 'No additional details'
      });
      setLoadError(err);
      showError('فشل تحميل البيانات. يرجى محاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();

    // Subscribe to real-time site_settings changes
    const settingsSubscription = supabase
      .channel('site_settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          setTimeout(() => {
            console.log('Site settings changed, refetching');
            fetchData();
          }, 500);
        }
      )
      .subscribe();

    // Subscribe to real-time branch and branch_links updates
    const branchesSubscription = supabase
      .channel('branches-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'branches' },
        () => {
          // Small delay to ensure data propagation
          setTimeout(() => {
            console.log('Branches changed, refetching');
            fetchData();
          }, 500);
        }
      )
      .subscribe();

    const branchLinksSubscription = supabase
      .channel('branch-links-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'branch_links' },
        (payload) => {
          // Log the change for debugging
          console.log('Branch links changed:', payload);
          // Small delay to ensure data propagation
          setTimeout(() => {
            console.log('Branch links changed, refetching');
            fetchData();
          }, 500);
        }
      )
      .subscribe();

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      settingsSubscription.unsubscribe();
      branchesSubscription.unsubscribe();
      branchLinksSubscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="app-container">
        <section className="hero-section" id="hero">
          <div className="hero-scrim" aria-hidden="true" />

          <div className="hero-shell">
            <div className="hero-copy">
              <img src={brandLogo} alt={settings.hero_title} className="brand-logo" />
              <h1>{settings.hero_title}</h1>
              <p className="brand-subtitle">{settings.hero_subtitle}</p>
              <HeroFlourish />
              <h2 className="hero-tagline">{settings.hero_tagline}</h2>
              <div className="hero-description">
                <p>{settings.hero_desc_1}</p>
                <p>{settings.hero_desc_2}</p>
              </div>
              <a
                href={getWhatsAppHref(settings.hero_whatsapp)}
                className="hero-cta"
                target="_blank"
                rel="noopener noreferrer"
                dir="rtl"
              >
                <span className="hero-cta-icon" aria-hidden="true">
                  <WhatsAppIcon size={22} />
                </span>
                <span>تواصل معنا</span>
              </a>
              <Link to="/catalog" className="hero-catalog-link">
                تصفحي الكتالوج
              </Link>
            </div>

            <div className="hero-figure">
              {heroImages.length > 0 ? (
                <>
                  {heroImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${settings.hero_title} ${i + 1}`}
                      className={`hero-model${i === heroIndex ? ' hero-model--active' : ''}`}
                    />
                  ))}
                  {heroImages.length > 1 && (
                    <div className="hero-dots">
                      {heroImages.map((_, i) => (
                        <button
                          key={i}
                          className={`hero-dot${i === heroIndex ? ' hero-dot--active' : ''}`}
                          onClick={() => goToHero(i)}
                          aria-label={`الصورة ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="features-section reveal" aria-label="مميزات سحر الشرق">
          <div className="features-panel">
            {features.map(({ icon, title, sub }) => (
              <div className="feature-item" key={title}>
                <div className="feature-icon">{icon}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="social-section section-shell reveal" id="social">
          <header className="section-header">
            <Divider />
            <h2>تابعينا وتواصلي معنا</h2>
          </header>

          <div className="branch-social-grid">
            {branches.map(({ name, address, mapUrl, links }) => (
              <article className="branch-social-card" key={name}>
                <h3>{name}</h3>
                <p>{(Array.isArray(address) ? address : []).filter(Boolean).join(' - ') || '—'}</p>
                <a
                  className="branch-map-link"
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer-when-downgrade"
                >
                  <MapPin />
                  الموقع على الخريطة
                </a>
                <div className="social-grid">
                  {links.map((link) => (
                    link.to ? (
                      <Link key={link.to} to={link.to} className={`social-card ${link.cls}`}>
                        <span className="social-icon">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    ) : (
                      <a
                        key={link.href}
                        href={link.href}
                        className={`social-card ${link.cls}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="social-icon">{link.icon}</span>
                        <span>{link.label}</span>
                      </a>
                    )
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="map-section section-shell reveal" id="map">
          <header className="section-header">
            <Divider />
            <h2>زورينا في فروعنا</h2>
          </header>

          <div className="branch-map-grid">
            {branches.map(({ name, address, phone, phoneTel, mapUrl, mapEmbedUrl, mobile_1, mobile_2, landline }) => (
              <article className="branch-map-card" key={name}>
                <div className="map-frame">
                  <iframe
                    title={`موقع ${name} على خرائط جوجل`}
                    src={mapEmbedUrl}
                    width="600"
                    height="450"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="map-details">
                  <div className="branch-card">
                    <div className="detail-row">
                      <MapPin />
                      <div>
                        <h3>{name}</h3>
                        <a
                          className="branch-address-link"
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer-when-downgrade"
                        >
                          {address.map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                        </a>
                      </div>
                    </div>
                    {/* Render multiple phones lists or legacy single phone */}
                    {(mobile_1 || mobile_2 || landline) ? (
                      <div className="branch-phones-list">
                        {mobile_1 && (
                          <a className="branch-phone" href={`tel:${mobile_1}`}>
                            <Phone />
                            <span>موبايل: {mobile_1}</span>
                          </a>
                        )}
                        {mobile_2 && (
                          <a className="branch-phone" href={`tel:${mobile_2}`}>
                            <Phone />
                            <span>موبايل: {mobile_2}</span>
                          </a>
                        )}
                        {landline && (
                          <a className="branch-phone" href={`tel:${landline}`}>
                            <Phone />
                            <span>أرضي: {landline}</span>
                          </a>
                        )}
                      </div>
                    ) : phone ? (
                      <a className="branch-phone" href={`tel:${phoneTel}`}>
                        <Phone />
                        <span>{phone}</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hours-row">
            <Clock />
            <div>
              <p>{settings.hours_weekday}</p>
              <p>{settings.hours_friday}</p>
            </div>
          </div>
        </section>

        <section className="contact-section section-shell reveal" id="contact">
          <header className="section-header">
            <Divider />
            <h2>أرسلي لنا استفساركِ</h2>
          </header>
          <ContactForm />
        </section>

        <SiteFooter />
      </main>
    </>
  );
}