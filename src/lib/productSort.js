/** Unix seconds for `order_index` — must fit PostgreSQL integer (not milliseconds). */
export function productOrderIndexNow() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Timestamp in ms when the product was added.
 * Uses order_index (seconds), then id, then created_at.
 */
export function getProductAddedTime(product) {
  const orderIndex = Number(product?.order_index);
  // Legacy rows may have ms stored before the fix (only if column was bigint)
  if (!Number.isNaN(orderIndex) && orderIndex >= 1_000_000_000_000) {
    return orderIndex;
  }
  if (!Number.isNaN(orderIndex) && orderIndex >= 1_000_000_000) {
    return orderIndex * 1000;
  }

  const id = String(product?.id || '');
  const prefix = id.match(/^(\d{13,})-/);
  if (prefix) {
    const t = Number(prefix[1]);
    if (!Number.isNaN(t)) return t;
  }
  const suffix = id.match(/-(\d{13,})$/);
  if (suffix) {
    const t = Number(suffix[1]);
    if (!Number.isNaN(t)) return t;
  }
  const legacySuffix = id.match(/-(\d{10,12})$/);
  if (legacySuffix) {
    const t = Number(legacySuffix[1]);
    if (!Number.isNaN(t)) return t < 1_000_000_000_000 ? t * 1000 : t;
  }

  const fromDate = Date.parse(product?.created_at || product?.createdAt || '');
  if (!Number.isNaN(fromDate)) return fromDate;

  return null;
}

export function formatProductAddedDate(product, locale = 'ar-EG') {
  const time = getProductAddedTime(product);
  if (time === null) return '—';
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(time));
  } catch {
    return new Date(time).toLocaleString('ar-EG');
  }
}

export function compareProductsNewestFirst(a, b) {
  const aTime = getProductAddedTime(a);
  const bTime = getProductAddedTime(b);
  if (aTime !== null && bTime !== null && aTime !== bTime) return bTime - aTime;
  if (aTime !== null && bTime === null) return -1;
  if (aTime === null && bTime !== null) return 1;
  return String(b?.id || '').localeCompare(String(a?.id || ''));
}

/** Default admin list sort — order_index is Unix seconds on each new product. */
export const PRODUCT_LIST_SORT = { field: 'order_index', order: 'DESC' };
