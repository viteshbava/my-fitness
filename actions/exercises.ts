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

/**
 * Update the last_used_date for an exercise
 * Called when a workout exercise is saved with data
 */
export const updateExerciseLastUsedDate = async (
  exerciseId: string,
  date: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('exercises')
      .update({ last_used_date: date })
      .eq('id', exerciseId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update last used date',
    };
  }
};


/**
 * Fetch all workout exercises for a given exercise (for max weight and historical data)
 * Returns all sets from all workouts for this exercise
 */
export const fetchExerciseHistoricalData = async (
  exerciseId: string
): Promise<{
  data: Array<{ date: string; sets: Set[] }> | null;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        sets,
        workout:workouts!inner (id, date)
      `)
      .eq('exercise_id', exerciseId);

    if (error) {
      return { data: null, error: error.message };
    }

    // Filter to only workouts with data
    const workoutsWithData = (data || []).filter((we: any) => {
      const sets = we.sets || [];
      return sets.some((set: Set) => set.reps !== null && set.reps > 0);
    });

    // Sort by date descending (most recent first)
    workoutsWithData.sort((a: any, b: any) => {
      const dateA = new Date(a.workout.date).getTime();
      const dateB = new Date(b.workout.date).getTime();
      return dateB - dateA;
    });

    // Format the response
    const historicalData = workoutsWithData.map((we: any) => ({
      date: we.workout.date,
      sets: we.sets || [],
    }));

    return { data: historicalData, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch exercise historical data',
    };
  }
};

// Add more exercise-related actions as needed
