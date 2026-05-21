import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, Link2, MessageCircle, Search, Share2, SlidersHorizontal, X } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { LoadingSpinner, SkeletonLoader } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { OptimizedImage } from '../components/OptimizedImage';
import { preloadImage } from '../components/imageCache';
import { useNotification } from '../lib/NotificationContext';
import { CATALOG_WHATSAPP, catalogCategories as localCategories } from '../data/catalog';
import { api, withRetry } from '../services/api';
import { supabase } from '../lib/supabase';
import { getProductAddedTime } from '../lib/productSort.js';
import { getWhatsAppHref, formatWhatsAppNumber } from '../lib/whatsapp.js';
import '../App.css';
import './CatalogPage.css';
import '../styles/ErrorDisplay.css';

function whatsappHref(productName, categoryTitle, whatsappNumber) {
  const text = `السلام عليكم، أستفسر عن: ${productName} (${categoryTitle}) — سحر الشرق`;
  return getWhatsAppHref(whatsappNumber || CATALOG_WHATSAPP, text);
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSearchTerms(value) {
  return normalizeSearchText(value)
    .split(' ')
    .filter((term) => term.length > 1);
}

function productSearchText(product) {
  return normalizeSearchText([
    product.name,
    product.description,
    product.note,
    product.categoryTitle,
    product.categoryDescription,
  ].filter(Boolean).join(' '));
}

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.54 0 .2 5.32.19 11.88c0 2.1.55 4.15 1.6 5.96L.1 24l6.31-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.33 11.9-11.89 0-3.17-1.24-6.16-3.48-8.43Zm-8.42 18.3h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.83 9.83 0 0 1-1.5-5.28c0-5.44 4.43-9.86 9.88-9.86a9.8 9.8 0 0 1 6.98 2.89 9.81 9.81 0 0 1 2.89 7c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.39c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.08-.13-.27-.2-.57-.35Z" />
  </svg>
);

const ProductCard = memo(function ProductCard({ product, categoryTitle, whatsappNumber, onImageClick }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = useMemo(
    () => (Array.isArray(product.images) ? product.images.filter(Boolean) : []),
    [product.images]
  );
  const currentImage = images[currentIdx];

  useEffect(() => {
    if (!images.length) return;

    preloadImage(images[currentIdx]);

    if (images.length > 1) {
      preloadImage(images[(currentIdx + 1) % images.length]);
    }
  }, [currentIdx, images]);

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <li className="catalog-product-card">
      <div 
        className={`catalog-product-image ${images.length > 0 ? 'clickable' : ''}`}
        onClick={() => {
          if (images.length > 0 && onImageClick) {
            onImageClick(images, currentIdx, product.name);
          }
        }}
      >
        <div className="catalog-product-badge">{categoryTitle}</div>
        {currentImage ? (
          <OptimizedImage
            key={currentImage}
            src={currentImage}
            alt={`${product.name} - ${currentIdx + 1}`}
            className="catalog-product-optimized"
            imgClassName="is-active"
            loading={currentIdx === 0 ? 'lazy' : 'eager'}
            rootMargin="360px"
            showBlur={true}
          />
        ) : (
          <div className="catalog-product-placeholder">
            <Images size={34} aria-hidden />
            <span>{product.name}</span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="nav-btn prev"
              onClick={prevImg}
              aria-label="Previous image"
            >
              <ChevronRight size={24} />
            </button>
            <button
              type="button"
              className="nav-btn next"
              onClick={nextImg}
              aria-label="Next image"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="catalog-image-dots">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`dot ${idx === currentIdx ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx(idx);
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="catalog-product-body">
        <div className="catalog-product-heading">
          <h3 className="catalog-product-title">{product.name}</h3>
          {images.length > 1 ? <span>{images.length} صور</span> : null}
        </div>
        <p className="catalog-product-description">{product.description ?? ''}</p>
        {product.note ? <p className="catalog-product-note">{product.note}</p> : null}
        <a
          href={whatsappHref(product.name, categoryTitle, whatsappNumber)}
          className="catalog-product-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={18} aria-hidden />
          <span>استفسار واتساب</span>
        </a>
      </div>
    </li>
  );
});

function Lightbox({ activeLightbox, onClose }) {
  const { images, currentIndex, productName } = activeLightbox;
  const [currentIdx, setCurrentIdx] = useState(currentIndex);
  const [shareToast, setShareToast] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, isDragging: false });

  useEffect(() => {
    setCurrentIdx(currentIndex);
  }, [currentIndex]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handlePrev();
      if (e.key === 'ArrowLeft') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Touch swipe handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, isDragging: true };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchRef.current.isDragging) return;
    const touch = e.changedTouches[0];
    const diffX = touchRef.current.startX - touch.clientX;
    const diffY = touchRef.current.startY - touch.clientY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);
    const minSwipe = 50;

    touchRef.current.isDragging = false;

    // Vertical swipe down to close
    if (absDiffY > absDiffX && diffY < -minSwipe) {
      onClose();
      return;
    }

    // Horizontal swipe to navigate
    if (absDiffX > minSwipe && absDiffX > absDiffY && images.length > 1) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  }, [handleNext, handlePrev, onClose, images.length]);

  // Share handler
  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    const shareData = {
      title: productName,
      text: `${productName} — سحر الشرق`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${productName} — سحر الشرق\n${window.location.href}`);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  }, [productName]);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="lightbox-top-bar">
        <button className="lightbox-action-btn" onClick={handleShare} aria-label="Share product">
          <Share2 size={20} />
        </button>
        <button className="lightbox-close" onClick={onClose} aria-label="Close preview">
          <X size={28} />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button className="lightbox-nav lightbox-prev" onClick={handlePrev} aria-label="Previous image">
            <ChevronRight size={32} />
          </button>
          <button className="lightbox-nav lightbox-next" onClick={handleNext} aria-label="Next image">
            <ChevronLeft size={32} />
          </button>
        </>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={images[currentIdx]} alt={`${productName} - Preview`} className="lightbox-image" />
        <div className="lightbox-footer">
          <span className="lightbox-title">{productName}</span>
          <div className="lightbox-footer-actions">
            {images.length > 1 && (
              <span className="lightbox-counter">
                {currentIdx + 1} / {images.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {shareToast && (
        <div className="lightbox-toast">
          <Link2 size={16} />
          <span>تم نسخ الرابط</span>
        </div>
      )}
    </div>
  );
}

export function CatalogPage() {
  const { showError } = useNotification();
  const [categories, setCategories] = useState(localCategories);
  const [activeId, setActiveId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState(CATALOG_WHATSAPP);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [activeLightbox, setActiveLightbox] = useState(null);

  const handleImageClick = useCallback((images, currentIdx, productName) => {
    setActiveLightbox({ images, currentIndex: currentIdx, productName });
  }, []);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const [settings, data] = await Promise.all([
        withRetry(() => api.getSettings()),
        withRetry(() => api.getCatalog()),
      ]);

      console.log('Catalog fetched from DB:', data);
      const rawWhatsapp = String(settings?.hero_whatsapp || settings?.social_whatsapp || settings?.contact_phone || '');
      const apiWhatsapp = formatWhatsAppNumber(rawWhatsapp);
      if (apiWhatsapp) setWhatsappNumber(apiWhatsapp);

      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
        setActiveId((current) => (
          current === 'all' || data.some((cat) => cat.id === current) ? current : 'all'
        ));
      }
    } catch (err) {
      console.error('Error fetching from Supabase:', {
        name: err.name,
        message: err.message,
        code: err.code,
        details: err.details || 'No additional details',
        status: err.status
      });
      setLoadError(err);
      showError('فشل تحميل الكتالوج. يرجى محاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCatalog();

    // Subscribe to real-time catalog updates with slight delay for propagation
    const categorySubscription = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          // Small delay to ensure data propagation
          setTimeout(() => {
            console.log('Categories changed, refetching catalog');
            fetchCatalog();
          }, 500);
        }
      )
      .subscribe();

    const productSubscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          // Log the change for debugging
          console.log('Product changed:', payload);
          // Small delay to ensure data propagation
          setTimeout(() => {
            console.log('Products changed, refetching catalog');
            fetchCatalog();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      categorySubscription.unsubscribe();
      productSubscription.unsubscribe();
    };
  }, [fetchCatalog]);

  const allProducts = useMemo(
    () => categories.flatMap((category, categoryIndex) => (
      Array.isArray(category.products)
        ? category.products.map((product, productIndex) => ({
            ...product,
            categoryId: category.id,
            categoryTitle: category.title,
            categoryDescription: category.description,
            categoryIndex,
            productIndex,
          }))
        : []
    )),
    [categories]
  );

  const activeCategory = useMemo(() => {
    if (activeId === 'all') {
      return {
        id: 'all',
        title: 'كل المنتجات',
        description: 'ابحثي في كل التصنيفات أو ضيقي النتائج بالفلاتر.',
      };
    }

    return categories.find((cat) => cat.id === activeId) || categories[0];
  }, [categories, activeId]);

  const baseProducts = useMemo(() => {
    if (activeId === 'all') return allProducts;

    return allProducts.filter((product) => product.categoryId === activeId);
  }, [activeId, allProducts]);

  const activeProducts = useMemo(() => {
    const searchTerms = getSearchTerms(searchTerm);

    const filtered = baseProducts.filter((product) => {
      if (searchTerms.length === 0) return true;

      const searchableText = productSearchText(product);
      return searchTerms.every((term) => searchableText.includes(term));
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ar');
      }

      if (sortBy === 'date-asc' || sortBy === 'date-desc') {
        const aTime = getProductAddedTime(a);
        const bTime = getProductAddedTime(b);

        if (aTime !== null && bTime !== null && aTime !== bTime) {
          return sortBy === 'date-desc' ? bTime - aTime : aTime - bTime;
        }

        if (aTime !== null && bTime === null) return -1;
        if (aTime === null && bTime !== null) return 1;
      }

      return a.categoryIndex - b.categoryIndex || a.productIndex - b.productIndex;
    });
  }, [baseProducts, searchTerm, sortBy]);



  const hasActiveFilters = searchTerm || sortBy !== 'date-desc' || activeId !== 'all';
  const searchTerms = getSearchTerms(searchTerm);

  function resetFilters() {
    setActiveId('all');
    setSearchTerm('');
    setSortBy('date-desc');
  }

  return (
    <div className="catalog-page">
      <SiteHeader />

      <main className="catalog-main">
        <header className="catalog-hero">
          <h1>كتالوج المنتجات</h1>
          <p>تصفحي التصنيفات والمنتجات، ثم تواصلي معنا على واتساب لأي استفسار أو طلب.</p>
        </header>

        <section className="catalog-tools" aria-label="بحث وفلترة المنتجات">
          <div className="catalog-search-panel">
            <label className="catalog-search">
              <Search size={20} aria-hidden />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setSearchTerm('');
                }}
                placeholder="ابحثي باسم المنتج، الخامة، اللون أو التصنيف"
                aria-label="بحث في المنتجات"
              />
              {searchTerm ? (
                <button type="button" onClick={() => setSearchTerm('')} aria-label="مسح البحث">
                  <X size={18} aria-hidden />
                </button>
              ) : null}
            </label>

            <div className="catalog-search-meta" aria-live="polite">
              <span>
                {activeProducts.length} نتيجة من {allProducts.length} منتج
              </span>
              {searchTerms.length > 0 ? (
                <small>مطابقة {searchTerms.length} كلمة بحث</small>
              ) : (
                <small>البحث يشمل الاسم والوصف والخامة والتصنيف</small>
              )}
            </div>


          </div>

          <div className="catalog-filter-row">
            <label className="catalog-select">
              <SlidersHorizontal size={18} aria-hidden />
              <span>الترتيب</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="date-desc">الأحدث إضافة</option>
                <option value="date-asc">الأقدم إضافة</option>
                <option value="name">أبجدي أ-ي</option>
              </select>
            </label>

            {hasActiveFilters ? (
              <button type="button" className="catalog-reset" onClick={resetFilters}>
                <X size={16} aria-hidden />
                <span>إلغاء الفلاتر</span>
              </button>
            ) : null}
          </div>
        </section>

        <div className="catalog-chips" role="tablist" aria-label="تصنيفات المنتجات">
          <button
            type="button"
            role="tab"
            aria-selected={activeId === 'all'}
            className={`catalog-chip ${activeId === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveId('all')}
          >
            <span>كل المنتجات</span>
            <small>{allProducts.length}</small>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeId === cat.id}
              className={`catalog-chip ${activeId === cat.id ? 'is-active' : ''}`}
              onClick={() => setActiveId(cat.id)}
            >
              <span>{cat.title}</span>
              <small>{Array.isArray(cat.products) ? cat.products.length : 0}</small>
            </button>
          ))}
        </div>

        <section className="catalog-category reveal visible" aria-labelledby="active-category-heading">
          <div className="catalog-category-header">
            <div>
              <h2 id="active-category-heading" className="catalog-category-title">
                {activeCategory?.title || 'المنتجات'}
              </h2>
              {activeCategory?.description ? (
                <p className="catalog-category-desc">{activeCategory.description}</p>
              ) : null}
            </div>
            <div className="catalog-status">
              {isLoading ? <LoadingSpinner size={16} text="تحديث الكتالوج..." /> : null}
              <span className="catalog-count">
                {activeProducts.length} من {baseProducts.length} منتج
              </span>
            </div>
          </div>

          {loadError ? (
            <ErrorDisplay
              error={loadError}
              onRetry={fetchCatalog}
              title="تعذر تحديث الكتالوج"
            />
          ) : null}

          {activeProducts.length > 0 ? (
            <ul className="catalog-product-grid">
              {activeProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  categoryTitle={p.categoryTitle || activeCategory.title}
                  whatsappNumber={whatsappNumber}
                  onImageClick={handleImageClick}
                />
              ))}
            </ul>
          ) : isLoading ? (
            <SkeletonLoader count={3} type="product" />
          ) : (
            <div className="catalog-empty">
              لا توجد منتجات مطابقة للبحث أو الفلاتر الحالية.
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      {activeLightbox && (
        <Lightbox
          activeLightbox={activeLightbox}
          onClose={() => setActiveLightbox(null)}
        />
      )}
    </div>
  );
}
