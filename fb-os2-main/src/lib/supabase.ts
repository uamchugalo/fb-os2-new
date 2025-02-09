import { createClient } from '@supabase/supabase-js';

// Usando as variáveis diretamente
const supabaseUrl = 'https://fbtwddvbinsqhppmczkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidHdkZHZiaW5zcWhwcG1jemt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MzYyMTksImV4cCI6MjA1MzMxMjIxOX0.jncJa1OAV-6tQ9LE__Tc7uzTAfB3Sr8CT-Ze3aSf0oU';

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key são obrigatórios');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { User } from '@supabase/supabase-js';