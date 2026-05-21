import { useEffect, useState } from 'react';
import { api, withRetry } from '../services/api';
import { supabase } from '../lib/supabase';
import { getWhatsAppHref, formatWhatsAppNumber } from '../lib/whatsapp.js';

const WhatsAppSVG = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.54 0 .2 5.32.19 11.88c0 2.1.55 4.15 1.6 5.96L.1 24l6.31-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.33 11.9-11.89 0-3.17-1.24-6.16-3.48-8.43Zm-8.42 18.3h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.83 9.83 0 0 1-1.5-5.28c0-5.44 4.43-9.86 9.88-9.86a9.8 9.8 0 0 1 6.98 2.89 9.81 9.81 0 0 1 2.89 7c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.08-.13-.27-.2-.57-.35Z" />
  </svg>
);

const ArrowUpSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

export function FloatingWhatsApp({ phoneNumber: propPhoneNumber }) {
  const [isVisible, setIsVisible] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(propPhoneNumber || '201121030583');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await withRetry(() => api.getSettings());
        if (settings) {
          const number = formatWhatsAppNumber(settings.hero_whatsapp || settings.social_whatsapp || settings.contact_phone);
          if (number) {
            setWhatsappNumber(number);
          }
        }
      } catch (err) {
        console.warn('Could not load floating WhatsApp settings, using default', err);
      }
    }

    if (!propPhoneNumber) {
      fetchSettings();

      // Subscribe to settings changes
      const settingsChannel = supabase
        .channel('floating-whatsapp-settings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings' },
          () => fetchSettings()
        )
        .subscribe();

      return () => {
        settingsChannel.unsubscribe();
      };
    }
  }, [propPhoneNumber]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);

    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="floating-widgets-container">
      <a
        href={getWhatsAppHref(whatsappNumber)}
        className={`floating-whatsapp ${isVisible ? 'is-visible' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا على واتساب"
      >
        <span className="floating-whatsapp-pulse" aria-hidden="true" />
        <WhatsAppSVG />
      </a>

      <button
        onClick={scrollToTop}
        className={`floating-back-to-top ${isVisible ? 'is-visible' : ''}`}
        aria-label="العودة إلى الأعلى"
      >
        <ArrowUpSVG />
      </button>
    </div>
  );
}
