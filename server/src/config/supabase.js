const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  console.log('⚡ Supabase client initialized successfully.');
} else {
  // Graceful fallback for local development before user configures .env
  supabase = {
    isConfigured: false,
    from: () => {
      throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    },
    rpc: () => {
      throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    }
  };
}

module.exports = {
  supabase,
  isSupabaseConfigured: () => Boolean(supabase && supabase.isConfigured !== false)
};
