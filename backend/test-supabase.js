import { supabaseAdmin } from './src/lib/supabaseAdmin.js';

async function test() {
  try {
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    if (supabaseAdmin) {
      console.log('✅ Supabase Admin initialized successfully.');
    } else {
      console.error('❌ Supabase Admin failed to initialize.');
    }
  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
  }
  process.exit(0);
}

test();
