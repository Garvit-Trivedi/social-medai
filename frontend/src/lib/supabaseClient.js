import { createClient } from '@supabase/supabase-js';

// These are prefixed with VITE_ to be accessible in a Vite project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Supabase features will not work correctly.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
