import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if valid production or local Supabase keys are configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-supabase-url')
  );
};

// Singleton Supabase Client instance with session persistence
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (e) {
      console.warn('Supabase client initialization failed:', e);
      return null;
    }
  }

  return supabaseInstance;
};

// Auth Helper Methods
export const signInWithEmail = async (email: string, password: string) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');
  return await client.auth.signInWithPassword({ email, password });
};

export const signUpWithEmail = async (email: string, password: string) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');
  return await client.auth.signUp({ email, password });
};

export const signOutUser = async () => {
  const client = getSupabaseClient();
  if (!client) return;
  return await client.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { session } } = await client.auth.getSession();
  return session;
};
