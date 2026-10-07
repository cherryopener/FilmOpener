import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Production/Git Vercel connection via environment variables
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-supabase-url')
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (isSupabaseConfigured()) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn('Supabase client initialization failed:', e);
      return null;
    }
  }
  return null;
};
