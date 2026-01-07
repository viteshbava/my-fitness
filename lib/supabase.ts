import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseProjectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseProjectId || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Construct Supabase URL from project ID
const supabaseUrl = `https://${supabaseProjectId}.supabase.co`;

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export type for database schema (will be populated as we build the app)
export type Database = {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          name: string;
          video_url: string | null;
          movement_type: string;
          pattern: string;
          primary_body_part: string;
          secondary_body_part: string;
          equipment: string;
          is_mastered: boolean;
          notes: string | null;
          last_used_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exercises']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
      };
    };
  };
};
