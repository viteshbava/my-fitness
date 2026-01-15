/**
 * Exercise Actions (Server-side)
 *
 * All database operations for exercises should be defined here.
 * These are Server Actions that can be called from Client Components.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import type { Exercise, Set, ApiSuccessResponse } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

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

/**
 * Fetch exercises with their usage status (whether they have been done)
 * Returns exercises with an additional `has_been_done` flag
 */
export const fetchExercisesWithUsageStatus = async (): Promise<{
  data: (Exercise & { has_been_done: boolean })[] | null;
  error: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Fetch all exercises
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (exercisesError) {
      return { data: null, error: exercisesError.message };
    }

    // Fetch all workout exercises with their sets
    const { data: workoutExercises, error: workoutExercisesError } = await supabase
      .from('workout_exercises')
      .select('exercise_id, sets');

    if (workoutExercisesError) {
      return { data: null, error: workoutExercisesError.message };
    }

    // Create a Set of exercise IDs that have been done (have at least one set with reps > 0)
    const doneExerciseIds = new Set<string>();
    (workoutExercises || []).forEach((we: any) => {
      const sets = we.sets || [];
      const hasValidSet = sets.some((set: Set) => set.reps !== null && set.reps > 0);
      if (hasValidSet) {
        doneExerciseIds.add(we.exercise_id);
      }
    });

    // Map exercises with their usage status
    const exercisesWithStatus = (exercises || []).map(exercise => ({
      ...exercise,
      has_been_done: doneExerciseIds.has(exercise.id)
    }));

    return { data: exercisesWithStatus, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch exercises with usage status',
    };
  }
};

/**
 * Cached fetch for exercise by ID
 * Cache is automatically invalidated when mutations occur
 */
export const fetchExerciseById = cache(async (
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
});

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

    // Revalidate exercise-related pages
    revalidatePath('/exercises');
    revalidatePath(`/exercises/${id}`);

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

    // Revalidate exercise-related pages
    revalidatePath('/exercises');
    revalidatePath(`/exercises/${id}`);

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
 * Check if an exercise has been done (has at least one valid set in any workout)
 * A valid set is one with reps > 0
 * Cached for performance
 */
export const hasExerciseBeenDone = cache(async (
  exerciseId: string
): Promise<{ data: boolean; error: string | null }> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('sets')
      .eq('exercise_id', exerciseId)
      .limit(100); // Check up to 100 workout exercises

    if (error) {
      return { data: false, error: error.message };
    }

    // Check if any workout exercise has at least one set with reps > 0
    const hasValidSet = (data || []).some((we: any) => {
      const sets = we.sets || [];
      return sets.some((set: Set) => set.reps !== null && set.reps > 0);
    });

    return { data: hasValidSet, error: null };
  } catch (err) {
    return {
      data: false,
      error: err instanceof Error ? err.message : 'Failed to check exercise usage',
    };
  }
});

/**
 * Fetch all workout exercises for a given exercise (for max weight and historical data)
 * Returns all sets from all workouts for this exercise
 * Cached for performance - revalidated when workouts are updated
 */
export const fetchExerciseHistoricalData = cache(async (
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
});

// Add more exercise-related actions as needed
