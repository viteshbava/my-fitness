import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for client-side operations
 * NOTE: According to CLAUDE.md, this should ONLY be used in exceptional cases.
 * Prefer using Server Actions in /actions for all database operations.
 */
export const createClient = () => {
  const supabaseProjectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseProjectId || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  const supabaseUrl = `https://${supabaseProjectId}.supabase.co`;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
