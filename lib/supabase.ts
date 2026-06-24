import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // During Next.js build-time prerendering the env vars may not be present.
  // We export a no-op proxy so the module loads without crashing.
  // All real Supabase calls happen inside useEffect (client-side only).
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key-for-build',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
