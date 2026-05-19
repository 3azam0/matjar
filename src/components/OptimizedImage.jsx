import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { addImageToCache, loadAndDecodeImage } from './imageCache';

/**
 * OptimizedImage Component
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Progressive placeholder while loading
 * - Error handling with fallback
 * - Decoded-image memory cache with request deduplication
 * - Native browser cache, decoding, and fetch priority support
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  width,
  height,
  onLoad = () => {},
  onError = () => {},
  showBlur = true,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  rootMargin = '200px',
  objectFit = 'cover',
  srcSet,
  sizes,
  style,
  referrerPolicy,
  ...props
}) {
  const shouldLoadImmediately = loading === 'eager' || fetchPriority === 'high';
  const [imageSrc, setImageSrc] = useState(() => (shouldLoadImmediately && src ? src : null));
  const [isLoading, setIsLoading] = useState(() => Boolean(src));
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(shouldLoadImmediately);
  const containerRef = useRef(null);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    queueMicrotask(() => {
      setImageSrc(shouldLoadImmediately && src ? src : null);
      setIsLoading(Boolean(src));
      setHasError(false);
      setIsInView(shouldLoadImmediately);
    });
  }, [src, shouldLoadImmediately]);

  useEffect(() => {
    if (shouldLoadImmediately || !src) return;

    if (!('IntersectionObserver' in window)) {
      queueMicrotask(() => setIsInView(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, shouldLoadImmediately, src]);

  useEffect(() => {
    if (!isInView || !src) return;

    let mounted = true;

    loadAndDecodeImage(src, { fetchPriority, referrerPolicy, sizes, srcSet })
      .then(() => {
        if (!mounted) return;
        setImageSrc(src);
        setIsLoading(false);
        setHasError(false);
      })
      .catch(() => {
        if (!mounted) return;
        setImageSrc(src);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fetchPriority, isInView, referrerPolicy, sizes, src, srcSet]);

  function handleImageLoad(event) {
    addImageToCache(src, {
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });

    setIsLoading(false);
    setHasError(false);
    onLoadRef.current(event);
  }

  function handleImageError(event) {
    const error = new Error(`Failed to render image: ${src}`);
    setHasError(true);
    setIsLoading(false);
    onErrorRef.current(error, event);
  }

  if (!src) {
    return null;
  }

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    ...(width && { width }),
    ...(height && { height }),
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    opacity: isLoading ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    ...style,
  };

  const imgProps = {
    ...props,
    src: imageSrc || src,
    alt,
    className: imgClassName,
    style: imageStyle,
    loading: loading === 'eager' ? 'eager' : 'lazy',
    decoding,
    referrerPolicy,
    onLoad: handleImageLoad,
    onError: handleImageError,
  };

  if (fetchPriority) imgProps.fetchPriority = fetchPriority;
  if (srcSet) imgProps.srcSet = srcSet;
  if (sizes) imgProps.sizes = sizes;
  if (width) imgProps.width = width;
  if (height) imgProps.height = height;

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {isLoading && showBlur && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#e5e7eb',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}

      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Loader2 size={24} className="image-loader-spinner" />
        </div>
      )}

      {hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            zIndex: 10,
          }}
        >
          <AlertCircle size={32} />
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>خطأ في تحميل الصورة</p>
        </div>
      )}

      {imageSrc && !hasError && <img {...imgProps} />}
    </div>
  );
}
