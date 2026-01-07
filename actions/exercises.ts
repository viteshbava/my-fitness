/**
 * Exercise Actions (Server-side)
 *
 * All database operations for exercises should be defined here.
 * These are Server Actions that can be called from Client Components.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { Exercise } from '@/types/database';

export const fetchExercises = async (): Promise<{
  data: Exercise[] | null;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch exercises',
    };
  }
};

export const fetchExerciseById = async (
  id: string
): Promise<{ data: Exercise | null; error: string | null }> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch exercise',
    };
  }
};

export const updateExerciseNotes = async (
  id: string,
  notes: string
): Promise<{ data: Exercise | null; error: string | null }> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('exercises')
      .update({ notes })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update exercise notes',
    };
  }
};

// Add more exercise-related actions as needed
