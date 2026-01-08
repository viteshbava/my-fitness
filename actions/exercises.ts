/**
 * Exercise Actions (Server-side)
 *
 * All database operations for exercises should be defined here.
 * These are Server Actions that can be called from Client Components.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { Exercise, Set, ApiSuccessResponse } from '@/types/database';

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

export const updateExerciseIsLearnt = async (
  id: string,
  is_mastered: boolean
): Promise<{ data: Exercise | null; error: string | null }> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('exercises')
      .update({ is_mastered })
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
      error: err instanceof Error ? err.message : 'Failed to update experience level',
    };
  }
};

/**
 * Update the last_performed_sets for an exercise
 * Called when a workout exercise is saved with the most recent workout date
 */
export const updateExerciseLastPerformedSets = async (
  exerciseId: string,
  sets: Set[]
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('exercises')
      .update({ last_performed_sets: sets })
      .eq('id', exerciseId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update last performed sets',
    };
  }
};

// Add more exercise-related actions as needed
