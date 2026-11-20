import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder');

if (!isConfigured) {
  console.warn('[METRACE] Supabase belum dikonfigurasi.');
}

const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Hapus flowType PKCE — gunakan implicit flow yang lebih kompatibel
    // dengan format key sb_publishable_ dan browser storage
    storageKey: 'metrace-auth',
    storage: window.localStorage,
  },
});

/** True if real credentials are configured */
export const isSupabaseConfigured = isConfigured;

export default supabase;
