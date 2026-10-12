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

// Check if an email is in the allowed whitelist (if configured via NEXT_PUBLIC_ALLOWED_EMAILS)
export const isEmailAllowed = (email: string): boolean => {
  const allowed = process.env.NEXT_PUBLIC_ALLOWED_EMAILS;
  if (!allowed || !allowed.trim()) return true; // No whitelist configured: allow all

  const allowedList = allowed
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedList.length === 0) return true;

  return allowedList.includes(email.trim().toLowerCase());
};

// Check if guest/offline mode is explicitly disabled in production
export const isOfflineModeDisabled = (): boolean => {
  return (
    process.env.NEXT_PUBLIC_HIDE_OFFLINE_MODE === 'true' ||
    process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true'
  );
};

// Auth Helper Methods
export const signInWithEmail = async (email: string, password: string) => {
  const cleanEmail = email.trim().toLowerCase();
  if (!isEmailAllowed(cleanEmail)) {
    throw new Error('이 사이트는 1인 비공개 개인 인스턴스입니다. 승인되지 않은 이메일 계정은 접근할 수 없습니다.');
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');
  return await client.auth.signInWithPassword({ email: cleanEmail, password });
};

export const signUpWithEmail = async (email: string, password: string) => {
  const cleanEmail = email.trim().toLowerCase();
  if (!isEmailAllowed(cleanEmail)) {
    throw new Error('이 사이트는 1인 비공개 개인 인스턴스입니다. 승인되지 않은 이메일 계정은 가입할 수 없습니다.');
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase가 설정되지 않았습니다.');
  return await client.auth.signUp({ email: cleanEmail, password });
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
