import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    'Supabase backend environment variables are missing. Admin features will not work.'
  );
}

/**
 * Supabase client using the Service Role Key.
 * This client bypasses Row Level Security (RLS).
 * MUST ONLY be used on the server.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
});

