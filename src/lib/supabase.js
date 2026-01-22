import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'LOADED' : 'MISSING');
console.log('Supabase Key:', supabaseAnonKey ? 'LOADED' : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found! Check Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
