const imageCache = new Map();
const pendingLoads = new Map();
const MAX_CACHE_SIZE = 100;

export function addImageToCache(url, metadata = {}) {
  if (imageCache.has(url)) {
    imageCache.delete(url);
  }

  if (imageCache.size >= MAX_CACHE_SIZE) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }

  imageCache.set(url, {
    loadedAt: Date.now(),
    ...metadata,
  });
}

export function getCachedImage(url) {
  const cached = imageCache.get(url);
  if (!cached) return null;

  imageCache.delete(url);
  imageCache.set(url, cached);
  return cached;
}

export function loadAndDecodeImage(src, options = {}) {
  if (getCachedImage(src)) {
    return Promise.resolve(src);
  }

  if (pendingLoads.has(src)) {
    return pendingLoads.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const image = new Image();

    image.decoding = 'async';

    if (options.crossOrigin) image.crossOrigin = options.crossOrigin;
    if (options.referrerPolicy) image.referrerPolicy = options.referrerPolicy;
    if (options.srcSet) image.srcset = options.srcSet;
    if (options.sizes) image.sizes = options.sizes;
    if (options.fetchPriority && 'fetchPriority' in image) {
      image.fetchPriority = options.fetchPriority;
    }

    image.onload = async () => {
      try {
        if (image.decode) {
          await image.decode();
        }
      } catch {
        // Some browsers reject decode() after a successful load for SVG/cache hits.
      }

      addImageToCache(src, {
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      pendingLoads.delete(src);
      resolve(src);
    };

    image.onerror = () => {
      pendingLoads.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };

    image.src = src;
  });

  pendingLoads.set(src, promise);
  return promise;
}

export async function preloadImage(src, options = {}) {
  const cached = getCachedImage(src);
  if (cached) return src;

  try {
    return await loadAndDecodeImage(src, { fetchPriority: 'low', ...options });
  } catch {
    return null;
  }
}

export function clearImageCache() {
  imageCache.clear();
  pendingLoads.clear();
}

export function getImageCacheStats() {
  return {
    size: imageCache.size,
    pending: pendingLoads.size,
    maxSize: MAX_CACHE_SIZE,
    percentage: Math.round((imageCache.size / MAX_CACHE_SIZE) * 100),
  };
}
