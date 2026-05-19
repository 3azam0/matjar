import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** True when real project credentials are set (not placeholder). */
export const SUPABASE_CONFIGURED = Boolean(envUrl && envKey);

if (!SUPABASE_CONFIGURED) {
  console.warn(
    'Supabase: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing. Using placeholder client so the app can load; set .env for real data.'
  );
}

// createClient throws on empty URL/key — use valid-shaped placeholders until .env is set.
export const resolvedSupabaseUrl = SUPABASE_CONFIGURED ? envUrl : 'https://local.invalid/';
export const resolvedSupabaseAnonKey = SUPABASE_CONFIGURED ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.not-configured';

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey);
