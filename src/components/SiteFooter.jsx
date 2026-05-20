import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { api, withRetry } from '../services/api';
import { supabase } from '../lib/supabase';
import { activeClient } from '../config/clients.js';

const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.54 0 .2 5.32.19 11.88c0 2.1.55 4.15 1.6 5.96L.1 24l6.31-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.33 11.9-11.89 0-3.17-1.24-6.16-3.48-8.43Zm-8.42 18.3h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.83 9.83 0 0 1-1.5-5.28c0-5.44 4.43-9.86 9.88-9.86a9.8 9.8 0 0 1 6.98 2.89 9.81 9.81 0 0 1 2.89 7c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.08-.13-.27-.2-.57-.35Z" />
  </svg>
);

const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14.2 8.1V6.7c0-.7.16-1.08 1.18-1.08h1.5V3h-2.4c-2.87 0-3.88 1.34-3.88 3.63v1.47H8.8v2.93h1.8V21h3.6v-9.97h2.41l.32-2.93H14.2Z" />
  </svg>
);

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-6.13 6.29 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.16 8.16 0 0 0 4.77 1.52V7.07a4.85 4.85 0 0 1-1-.38Z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Divider = () => (
  <div className="divider" aria-hidden="true">
    <span />
    <b>◇</b>
    <span />
  </div>
);

const DEFAULT_SETTINGS = activeClient.settings;

const DEFAULT_BRANCHES = activeClient.branches;

function digitsOnly(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export function SiteFooter() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);

  async function fetchFooterData() {
    try {
      const sData = await withRetry(() => api.getSettings());
      if (sData) {
        const whatsappNumber = digitsOnly(sData.social_whatsapp) || digitsOnly(sData.contact_phone);
        setSettings((prev) => ({
          ...prev,
          hero_title: sData.hero_title || sData.site_name || prev.hero_title,
          hero_whatsapp: sData.hero_whatsapp || whatsappNumber || prev.hero_whatsapp,
          contact_email: sData.contact_email || prev.contact_email,
          social_instagram: sData.social_instagram || prev.social_instagram,
          social_facebook: sData.social_facebook || prev.social_facebook,
          social_tiktok: sData.social_tiktok || prev.social_tiktok,
        }));
      }

      const bData = await withRetry(() => api.getBranches());
      if (bData && bData.length > 0) {
        setBranches(
          bData.map((b) => ({
            name: b.name || 'فرع',
            address: Array.isArray(b.address_lines)
              ? b.address_lines
              : (Array.isArray(b.address) ? b.address : ['']),
          }))
        );
      }
    } catch (err) {
      console.warn('Could not load footer data from Supabase, using defaults', err);
    }
  }

  useEffect(() => {
    queueMicrotask(fetchFooterData);

    // Subscribe to settings changes
    const settingsChannel = supabase
      .channel('footer-settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => fetchFooterData()
      )
      .subscribe();

    // Subscribe to branches changes
    const branchesChannel = supabase
      .channel('footer-branches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'branches' },
        () => fetchFooterData()
      )
      .subscribe();

    return () => {
      settingsChannel.unsubscribe();
      branchesChannel.unsubscribe();
    };
  }, []);

  if (activeClient.key === 'al-rukn-al-yamani') {
    const primaryBranch = branches[0] || activeClient.branches[0];
    const addressLines = Array.isArray(primaryBranch?.address) ? primaryBranch.address.filter(Boolean) : [];
    const mapHref = primaryBranch?.mapSearchQuery?.startsWith('http')
      ? primaryBranch.mapSearchQuery
      : 'https://maps.app.goo.gl/NFi5pMAvHWVVFDnKA';
    const phoneItems = [
      primaryBranch?.landline,
      primaryBranch?.mobile_1,
      primaryBranch?.mobile_2,
      primaryBranch?.phone,
      settings.hero_whatsapp,
    ].filter(Boolean);
    const uniquePhones = [...new Set(phoneItems)];

    return (
      <footer className="main-footer alrukn-footer">
        <div className="alrukn-footer-grid">
          <div className="alrukn-footer-col alrukn-footer-brand">
            <img src={activeClient.logo} alt={activeClient.displayName} className="alrukn-footer-logo" />
            <h3>{settings.hero_title || activeClient.displayName}</h3>
            <p>{settings.hero_subtitle || 'للعبايات الخليجية والزي الإسلامي'}</p>
            <div className="alrukn-footer-socials">
              {settings.hero_whatsapp ? (
                <a href={`https://wa.me/${settings.hero_whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="واتساب">
                  <WhatsAppIcon size={18} />
                </a>
              ) : null}
              {settings.social_instagram ? (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="إنستغرام">
                  <InstagramIcon size={18} />
                </a>
              ) : null}
              {settings.social_facebook ? (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="فيسبوك">
                  <FacebookIcon size={18} />
                </a>
              ) : null}
            </div>
          </div>

          <div className="alrukn-footer-col contact-col">
            <h3>تواصلي معنا</h3>
            <ul className="contact-list">
              {uniquePhones.map((phone) => (
                <li key={phone}>
                  <Phone size={16} />
                  <a href={`tel:${digitsOnly(phone)}`} dir="ltr">{phone}</a>
                </li>
              ))}
              {settings.contact_email ? (
                <li><Mail size={16} /> <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li>
              ) : null}
            </ul>
          </div>

          <div className="alrukn-footer-col location-col">
            <h3>موقعنا</h3>
            <p className="location-address">
              {addressLines.length ? addressLines.map((line) => (
                <span key={line}>{line}<br /></span>
              )) : 'القاهرة، مصر'}
            </p>
            <a href={mapHref} target="_blank" rel="noopener noreferrer" className="footer-map-btn">
              تحديد الموقع على الخريطة
            </a>
          </div>

          <div className="alrukn-footer-col order-col">
            <h3>اطلبي الآن</h3>
            <p>تصفحي الكتالوج أو تواصلي معنا لتأكيد المقاس والتفاصيل.</p>
            <div className="footer-hours">
              <Clock size={16} />
              <span>{settings.hours_weekday}</span>
            </div>
            <Link to="/catalog" className="footer-catalog-btn">
              <BookOpen size={17} />
              الكتالوج
            </Link>
            {settings.hero_whatsapp ? (
              <a href={`https://wa.me/${settings.hero_whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer-wa-btn">
                واتساب مباشر
              </a>
            ) : null}
          </div>
        </div>

        <p className="copyright">© {new Date().getFullYear()} {settings.hero_title || 'الركن اليماني'}. جميع الحقوق محفوظة</p>
        <Divider />
        <p className="footer-credits">تصميم وتطوير محمد أبو العزم | جميع الحقوق محفوظة</p>
      </footer>
    );
  }

  return (
    <footer className="main-footer">
      <div className="footer-grid">
        <div className="footer-item">
          <Phone />
          <div>
            <strong>{settings.hero_whatsapp || 'سيتم إضافة رقم التواصل'}</strong>
            <span>تواصلي معنا</span>
          </div>
        </div>
        <div className="footer-item">
          <Mail />
          <div>
            <strong>{settings.contact_email || 'سيتم إضافة البريد الإلكتروني'}</strong>
            <span>راسلينا</span>
          </div>
        </div>
        <div className="footer-item">
          <MapPin />
          <div>
            {branches.map((b) => (
              <strong key={b.name}>
                {b.name}: {(Array.isArray(b.address) ? b.address[0] : '') || '—'}
              </strong>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-social-row">
        {settings.hero_whatsapp ? (
          <a href={`https://wa.me/${settings.hero_whatsapp}`} className="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="واتساب">
            <WhatsAppIcon />
          </a>
        ) : null}
        {settings.social_instagram ? (
          <a href={settings.social_instagram} className="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="إنستغرام">
            <InstagramIcon />
          </a>
        ) : null}
        {settings.social_facebook ? (
          <a href={settings.social_facebook} className="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="فيسبوك">
            <FacebookIcon />
          </a>
        ) : null}
        {settings.social_tiktok ? (
          <a href={settings.social_tiktok} className="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="تيك توك">
            <TikTokIcon />
          </a>
        ) : null}
      </div>

      <p className="copyright">© {new Date().getFullYear()} {settings.hero_title}. جميع الحقوق محفوظة</p>
      <Divider />
      <p className="footer-credits">تصميم وتطوير محمد أبو العزم | جميع الحقوق محفوظة</p>
    </footer>
  );
}
