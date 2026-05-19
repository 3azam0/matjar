/**
 * Ensure product.images is always a string[] for Postgres text[] / catalog UI.
 */
export function normalizeProductImages(images) {
  if (Array.isArray(images)) {
    return images.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  }
  if (typeof images === 'string' && images.trim()) {
    return [images.trim()];
  }
  return [];
}
