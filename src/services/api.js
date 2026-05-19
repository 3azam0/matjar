import { supabase } from '../lib/supabase';
import { SUPABASE_CONTENT_ENABLED } from '../lib/supabase';
import { compareProductsNewestFirst } from '../lib/productSort.js';

/**
 * API Service for storefront content
 * Handles all communication with Supabase with comprehensive error handling
 */

class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
  }
}

// Retry wrapper with exponential backoff
async function withRetry(fn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      // Don't retry on validation errors
      if (err.details?.code === '42P01' || err.message.includes('validation')) {
        throw err;
      }
      
      // Calculate exponential backoff: 100ms, 300ms, 900ms
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(3, attempt) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export const api = {
  // --- Site Settings ---
  async getSettings() {
    if (!SUPABASE_CONTENT_ENABLED) {
      console.warn('Supabase content disabled, returning null settings');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        throw new ApiError('Failed to fetch site settings', {
          code: error.code,
          message: error.message,
          status: error.status
        });
      }
      return data;
    } catch (err) {
      console.error('getSettings error:', err);
      throw err;
    }
  },

  // --- Features ---
  async getFeatures() {
    if (!SUPABASE_CONTENT_ENABLED) {
      console.warn('Supabase content disabled, returning empty features');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) {
        throw new ApiError('Failed to fetch features', {
          code: error.code,
          message: error.message,
          status: error.status
        });
      }
      return data || [];
    } catch (err) {
      console.error('getFeatures error:', err);
      throw err;
    }
  },

  // --- Branches & Locations ---
  async getBranches() {
    if (!SUPABASE_CONTENT_ENABLED) {
      console.warn('Supabase content disabled, returning empty branches');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) {
        throw new ApiError('Failed to fetch branches', {
          code: error.code,
          message: error.message,
          status: error.status
        });
      }
      return data || [];
    } catch (err) {
      console.error('getBranches error:', err);
      throw err;
    }
  },

  async getBranchLinks() {
    if (!SUPABASE_CONTENT_ENABLED) {
      console.warn('Supabase content disabled, returning empty branch links');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('branch_links')
        .select('*')
        .order('branch_id', { ascending: true });
      
      if (error) {
        throw new ApiError('Failed to fetch branch links', {
          code: error.code,
          message: error.message,
          status: error.status
        });
      }
      return data || [];
    } catch (err) {
      console.error('getBranchLinks error:', err);
      throw err;
    }
  },

  // --- Catalog: Categories & Products ---
  async getCatalog() {
    if (!SUPABASE_CONTENT_ENABLED) {
      console.warn('Supabase content disabled, returning empty catalog');
      return [];
    }

    try {
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (catError) {
        throw new ApiError('Failed to fetch categories', {
          code: catError.code,
          message: catError.message,
          status: catError.status
        });
      }

      // Fetch products — newest first by order_index (timestamp set on create)
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('order_index', { ascending: false });
      
      if (prodError) {
        throw new ApiError('Failed to fetch products', {
          code: prodError.code,
          message: prodError.message,
          status: prodError.status
        });
      }

      const result = (categories || []).map(category => ({
        ...category,
        products: (products || [])
          .filter((p) => p.category_id === category.id && p.is_visible !== false)
          .sort(compareProductsNewestFirst),
      }));

      return result;
    } catch (err) {
      console.error('getCatalog error:', err);
      throw err;
    }
  },

  // --- Contact / Inquiries ---
  async submitInquiry(inquiryData) {
    if (!SUPABASE_CONTENT_ENABLED) {
      console.warn('Supabase content disabled, inquiry not submitted');
      return null;
    }

    if (!inquiryData || typeof inquiryData !== 'object') {
      throw new ApiError('Invalid inquiry data provided', {
        receivedType: typeof inquiryData,
        receivedValue: inquiryData
      });
    }

    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([inquiryData]);
      
      if (error) {
        throw new ApiError('Failed to submit inquiry', {
          code: error.code,
          message: error.message,
          status: error.status,
          details: error.details
        });
      }
      return data;
    } catch (err) {
      console.error('submitInquiry error:', err);
      throw err;
    }
  }
};

export { ApiError, withRetry };
