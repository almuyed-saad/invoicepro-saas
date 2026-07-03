// ============================================
// SUPABASE CLIENT — CONNECTION SETUP
// ============================================

const supabaseUrl = 'https://ujuxxvxfacmpnxlgbxqg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqdXh4dnhmYWNtcG54bGdieHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTY2NjgsImV4cCI6MjA5ODU5MjY2OH0.6RIfymlXGYsvytUKPOhOpe1SPiX0kcLUNWT_HmA1IKE';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

window.supabaseClient = supabaseClient;
window.supabase = supabaseClient;
window.supabaseKey = supabaseKey;

console.log('✅ Supabase client initialized!');