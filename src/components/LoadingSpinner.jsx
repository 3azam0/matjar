import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, text = 'جاري التحميل...' }) {
  return (
    <div className="loading-spinner-container">
      <Loader2 size={size} className="loading-spinner" />
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
}

export function SkeletonLoader({ count = 1, type = 'product' }) {
  if (type === 'product') {
    return (
      <div className="skeleton-products">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-product-card">
            <div className="skeleton-image" />
            <div className="skeleton-title" />
            <div className="skeleton-text" />
            <div className="skeleton-text skeleton-text-short" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="skeleton-text-block">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-text" />
        ))}
      </div>
    );
  }

  return null;
}
