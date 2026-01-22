import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'LOADED' : 'MISSING');
console.log('Supabase Key:', supabaseAnonKey ? 'LOADED' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found! Check Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper to get auth token for REST API calls
export const getAuthToken = () => {
  const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
  const storageKey = `sb-${projectId}-auth-token`;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed?.access_token || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};
