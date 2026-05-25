import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  MessageCircle,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { OptimizedImage } from '../components/OptimizedImage';
import { preloadImage } from '../components/imageCache';
import { useNotification } from '../lib/NotificationContext';
import { CATALOG_WHATSAPP, catalogCategories as localCategories } from '../data/catalog';
import { api, withRetry } from '../services/api';
import { getWhatsAppHref, formatWhatsAppNumber } from '../lib/whatsapp.js';
import './ProductDetailPage.css';
import '../App.css';

// Reusable WhatsApp Icon SVG
const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
    <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.54 0 .2 5.32.19 11.88c0 2.1.55 4.15 1.6 5.96L.1 24l6.31-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.33 11.9-11.89 0-3.17-1.24-6.16-3.48-8.43Zm-8.42 18.3h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.83 9.83 0 0 1-1.5-5.28c0-5.44 4.43-9.86 9.88-9.86a9.8 9.8 0 0 1 6.98 2.89 9.81 9.81 0 0 1 2.89 7c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.08-.13-.27-.2-.57-.35Z" />
  </svg>
);

export function ProductDetailPage() {
  const { productId } = useParams();
  const { showError } = useNotification();
  
  const [categories, setCategories] = useState(localCategories);
  const [whatsappNumber, setWhatsappNumber] = useState(CATALOG_WHATSAPP);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Gallery State
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [shareToast, setShareToast] = useState(false);

  // Fetch product catalog & settings
  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [settings, data] = await Promise.all([
        withRetry(() => api.getSettings()),
        withRetry(() => api.getCatalog()),
      ]);

      const rawWhatsapp = String(settings?.hero_whatsapp || settings?.social_whatsapp || settings?.contact_phone || '');
      const apiWhatsapp = formatWhatsAppNumber(rawWhatsapp);
      if (apiWhatsapp) setWhatsappNumber(apiWhatsapp);

      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching catalog details:', err);
      setLoadError(err);
      showError('فشل تحميل تفاصيل المنتج. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const loadCatalog = async () => {
      await fetchCatalog();
    };

    loadCatalog();
  }, [fetchCatalog]);

  // Flatten all products to search for the current one
  const allProducts = useMemo(() => {
    return categories.flatMap((category) => {
      if (!Array.isArray(category.products)) return [];
      return category.products.map((product) => ({
        ...product,
        categoryId: category.id,
        categoryTitle: category.title,
      }));
    });
  }, [categories]);

  // Find active product
  const product = useMemo(() => {
    return allProducts.find((p) => p.id === productId);
  }, [allProducts, productId]);

  // Find related products (same category, excluding current product, up to 4 products)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
  }, [allProducts, product]);

  const images = useMemo(() => {
    if (!product || !Array.isArray(product.images)) return [];
    return product.images.filter(Boolean);
  }, [product]);

  const productHighlights = useMemo(() => {
    if (!product) return [];

    return [
      {
        icon: Sparkles,
        label: 'التصنيف',
        value: product.categoryTitle,
      },
      {
        icon: Images,
        label: 'المعرض',
        value: images.length > 1 ? `${images.length} صور` : 'صورة واحدة',
      },
      {
        icon: Ruler,
        label: 'التفصيل',
        value: 'حسب المقاس',
      },
    ];
  }, [images.length, product]);

  const activeImageSafeIdx = images[activeImageIdx] ? activeImageIdx : 0;

  // Preload images for current gallery selection
  useEffect(() => {
    if (!images.length) return;
    preloadImage(images[activeImageSafeIdx]);
    if (images.length > 1) {
      preloadImage(images[(activeImageSafeIdx + 1) % images.length]);
    }
  }, [activeImageSafeIdx, images]);

  const handleNextImg = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  // Share handler
  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'منتج من سحر الشرق',
      text: `${product?.name || ''} — عبايات سحر الشرق الراقية`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch {
      // User dismissed
    }
  };

  // WhatsApp Inquiry URL formulation
  const getWhatsAppInquiryUrl = () => {
    if (!product) return '#';
    const text = `السلام عليكم، أود الاستفسار عن منتج: ${product.name} (${product.categoryTitle}) — سحر الشرق`;
    return getWhatsAppHref(whatsappNumber, text);
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="product-detail-page">
        <SiteHeader />
        <div className="product-detail-loading">
          <LoadingSpinner size={48} text="جاري تحميل تفاصيل المنتج الراقية..." />
        </div>
        <SiteFooter />
      </div>
    );
  }

  // 2. Error State
  if (loadError) {
    return (
      <div className="product-detail-page">
        <SiteHeader />
        <div className="product-detail-error-container">
          <div className="product-detail-error-card">
            <h2 className="product-detail-error-title">عذراً، فشل تحميل الصفحة</h2>
            <p className="product-detail-error-desc">حدث خطأ أثناء جلب تفاصيل المنتج من خوادمنا. يرجى التحقق من اتصالك بالشبكة وإعادة المحاولة.</p>
            <button onClick={fetchCatalog} className="product-detail-btn-primary">
              إعادة المحاولة
            </button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // 3. Product Not Found State
  if (!product) {
    return (
      <div className="product-detail-page">
        <SiteHeader />
        <div className="product-detail-error-container">
          <div className="product-detail-error-card">
            <h2 className="product-detail-error-title">المنتج غير متوفر</h2>
            <p className="product-detail-error-desc">نأسف، يبدو أن المنتج الذي تبحثين عنه غير متوفر حالياً أو تم حذفه من كتالوج المعروضات.</p>
            <Link to="/catalog" className="product-detail-btn-primary">
              العودة لتصفح الكتالوج
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const currentImage = images[activeImageSafeIdx];

  return (
    <div className="product-detail-page">
      <SiteHeader />

      <main className="product-detail-main">
        {/* Navigation Breadcrumb */}
        <div className="product-detail-nav">
          <Link to="/catalog" className="product-detail-back-btn">
            <ArrowRight size={18} />
            <span>العودة إلى الكتالوج الكامل</span>
          </Link>
        </div>

        {/* Product Details Layout */}
        <div className="product-detail-container">
          {/* Left Column: Image Gallery */}
          <div className="product-detail-gallery">
            <div className="product-detail-gallery-main">
              <div className="gallery-soft-label">سحر الشرق</div>
              {images.length > 0 ? (
                <span className="gallery-action-badge">
                  {activeImageSafeIdx + 1} / {images.length}
                </span>
              ) : null}

              {currentImage ? (
                <OptimizedImage
                  key={currentImage}
                  src={currentImage}
                  alt={`${product.name} - ${activeImageSafeIdx + 1}`}
                  loading="eager"
                  className="product-detail-gallery-main-img"
                  showBlur={true}
                />
              ) : (
                <div className="catalog-product-placeholder">
                  <span>{product.name}</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow prev"
                    onClick={handlePrevImg}
                    aria-label="Previous image"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <button
                    type="button"
                    className="gallery-arrow next"
                    onClick={handleNextImg}
                    aria-label="Next image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnails List */}
            {images.length > 1 && (
              <div className="product-detail-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`product-thumbnail-btn ${idx === activeImageSafeIdx ? 'is-active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.name} - Thumbnail ${idx + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <div className="product-gallery-note" aria-label="Product gallery information">
              <ShieldCheck size={18} aria-hidden />
              <span>صور المنتج لعرض تفاصيل التصميم، ويمكنك طلب استشارة المقاس والخامة عبر واتساب.</span>
            </div>
          </div>

          {/* Right Column: Information Panel */}
          <div className="product-detail-info">
            <div className="product-detail-header">
              <Link to={`/catalog`} className="product-detail-category-badge">
                {product.categoryTitle}
              </Link>
              <h1 className="product-detail-title">{product.name}</h1>
              <p className="product-detail-subtitle">تصميم أنيق من كتالوج سحر الشرق، جاهز للاستفسار وتنسيق الطلب مباشرة.</p>
            </div>

            <div className="product-detail-highlight-grid">
              {productHighlights.map(({ icon: Icon, label, value }) => (
                <div className="product-detail-highlight" key={label}>
                  <Icon size={18} aria-hidden />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            {/* Description Section */}
            {product.description && (
              <div className="product-detail-desc-section">
                <h2 className="product-detail-section-title">تفاصيل التصميم والخامات:</h2>
                <p className="product-detail-description">{product.description}</p>
              </div>
            )}

            {/* Custom Notes Spec card */}
            {product.note && (
              <div className="product-detail-spec-card">
                <div className="product-detail-spec-row">
                  <MessageCircle size={18} aria-hidden />
                  <div>
                    <strong>ملاحظات العباية وتفاصيل الطلب:</strong>
                    <div>{product.note}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="product-detail-service-panel">
              <div>
                <strong>تحتاجين مساعدة قبل الطلب؟</strong>
                <span>فريقنا يساعدك في المقاس، اللون، وتفاصيل التعديل المناسبة للقطعة.</span>
              </div>
              <MessageCircle size={22} aria-hidden />
            </div>

            {/* Sticky Actions Bar */}
            <div className="product-detail-actions">
              <a
                href={getWhatsAppInquiryUrl()}
                className="product-detail-whatsapp-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={22} aria-hidden />
                <span>استفسار وطلب واتساب</span>
              </a>

              <button
                type="button"
                className="product-detail-share-btn"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section" aria-labelledby="related-title">
            <div className="related-products-header">
              <h2 id="related-title" className="related-products-title">تصفحي تصاميم مشابهة قد تنال إعجابك:</h2>
            </div>
            <ul className="related-products-grid">
              {relatedProducts.map((p) => (
                <li key={p.id} className="catalog-product-card related-product-card">
                  <Link to={`/product/${p.id}`} className="catalog-product-image related-product-image">
                    <div className="catalog-product-badge">{p.categoryTitle}</div>
                    {Array.isArray(p.images) && p.images[0] ? (
                      <OptimizedImage
                        src={p.images[0]}
                        alt={p.name}
                        className="catalog-product-optimized"
                        imgClassName="is-active"
                        loading="lazy"
                        showBlur={true}
                      />
                    ) : (
                      <div className="catalog-product-placeholder">
                        <span>{p.name}</span>
                      </div>
                    )}
                  </Link>
                  <div className="catalog-product-body">
                    <div className="catalog-product-heading related-product-heading">
                      <h3 className="catalog-product-title related-product-title">
                        <Link to={`/product/${p.id}`}>
                          {p.name}
                        </Link>
                      </h3>
                    </div>
                    {p.description && (
                      <p className="catalog-product-description related-product-description">
                        {p.description}
                      </p>
                    )}
                    <Link to={`/product/${p.id}`} className="product-detail-btn-primary related-product-link">
                      عرض التفاصيل الكاملة
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter />

      {/* Copy notification toast */}
      <div className={`product-detail-toast ${shareToast ? 'is-active' : ''}`}>
        <Check size={18} />
        <span>تم نسخ رابط العباية بنجاح!</span>
      </div>
    </div>
  );
}
