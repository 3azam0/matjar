/**
 * Formats a phone number or URL to a clean digits-only format suitable for WhatsApp (wa.me).
 * Specifically handles Egyptian mobile numbers by prepending the '20' country code.
 * 
 * @param {string} value The raw number or wa.me URL
 * @returns {string} Clean digits for WhatsApp link (e.g. '201121030583')
 */
export function formatWhatsAppNumber(value) {
  if (!value) return '';
  
  // Clean all non-digit characters
  let digits = String(value).replace(/[^\d]/g, '');
  
  // If it starts with 00, strip the leading 00
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  
  // Egyptian numbers formatting:
  // Usually starts with 01... (11 digits)
  if (digits.startsWith('0') && digits.length === 11) {
    digits = '20' + digits.slice(1);
  } 
  // Starts with 1... (10 digits)
  else if (digits.length === 10 && digits.startsWith('1')) {
    digits = '20' + digits;
  }
  
  return digits;
}

/**
 * Generates a wa.me URL for a given product or general inquiry.
 * 
 * @param {string} number WhatsApp phone number
 * @param {string} text Message body text
 * @returns {string} Safe wa.me link URL
 */
export function getWhatsAppHref(number, text = '') {
  const formatted = formatWhatsAppNumber(number) || '201121030583';
  if (!text) {
    return `https://wa.me/${formatted}`;
  }
  return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
}
