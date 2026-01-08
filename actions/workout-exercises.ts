'use server';

import { createClient } from '@/lib/supabase/server';
import { WorkoutExercise, WorkoutExerciseWithExercise, ApiResponse, ApiSuccessResponse } from '@/types/database';

/**
 * Fetch workout exercises for a specific workout
 */
export const fetchWorkoutExercises = async (
  workoutId: string
): Promise<ApiResponse<WorkoutExerciseWithExercise[]>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercises (*)
      `)
      .eq('workout_id', workoutId)
      .order('order_index', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workout exercises',
    };
  }
};

/**
 * Add an exercise to a workout with default sets
 */
export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string,
  orderIndex?: number
): Promise<ApiResponse<WorkoutExercise>> => {
  try {
    const supabase = await createClient();

    // If no order index provided, get the max order_index and add 1
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const { data: existingExercises } = await supabase
        .from('workout_exercises')
        .select('order_index')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: false })
        .limit(1);

      finalOrderIndex = existingExercises && existingExercises.length > 0
        ? existingExercises[0].order_index + 1
        : 0;
    }

    // Get the most recent workout exercise for this exercise to determine default set count
    const { data: previousWorkoutExercises } = await supabase
      .from('workout_exercises')
      .select('sets')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Create default sets (3 sets by default, or match previous completed set count)
    let defaultSets = [
      { set_number: 1, weight: null, reps: null },
      { set_number: 2, weight: null, reps: null },
      { set_number: 3, weight: null, reps: null },
    ];

    if (previousWorkoutExercises && previousWorkoutExercises.length > 0) {
      const previousSets = previousWorkoutExercises[0].sets || [];
      // Count completed sets (sets with weight or reps)
      const completedSets = previousSets.filter(
        (set: any) =>
          (set.weight !== null && set.weight !== undefined) ||
          (set.reps !== null && set.reps !== undefined)
      );

      if (completedSets.length > 0) {
        // Create empty sets matching the previous completed count
        defaultSets = Array.from({ length: completedSets.length }, (_, index) => ({
          set_number: index + 1,
          weight: null,
          reps: null,
        }));
      }
    }

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workoutId,
        exercise_id: exerciseId,
        order_index: finalOrderIndex,
        sets: defaultSets,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to add exercise to workout',
    };
  }
};

/**
 * Remove an exercise from a workout
 */
export const removeExerciseFromWorkout = async (
  workoutExerciseId: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', workoutExerciseId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove exercise from workout',
    };
  }
};

/**
 * Update order indices for workout exercises (for drag-and-drop reordering)
 */
export const updateWorkoutExercisesOrder = async (
  updates: { id: string; order_index: number }[]
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();

    // Update each workout exercise's order_index
    const updatePromises = updates.map(({ id, order_index }) =>
      supabase
        .from('workout_exercises')
        .update({ order_index })
        .eq('id', id)
    );

    const results = await Promise.all(updatePromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      return { success: false, error: `Failed to update exercise orders: ${errors[0].error?.message}` };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update exercise order',
    };
  }
};

/**
 * Fetch a single workout exercise by ID with exercise details
 */
export const fetchWorkoutExerciseById = async (
  workoutExerciseId: string
): Promise<ApiResponse<WorkoutExerciseWithExercise>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercises (*)
      `)
      .eq('id', workoutExerciseId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workout exercise',
    };
  }
};

/**
 * Update workout exercise sets
 * Auto-saves sets data as changes are made
 */
export const updateWorkoutExerciseSets = async (
  workoutExerciseId: string,
  sets: { set_number: number; weight: number | null; reps: number | null }[]
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workout_exercises')
      .update({ sets })
      .eq('id', workoutExerciseId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update sets',
    };
  }
};

/**
 * Save draft snapshot when entering "in progress" mode
 */
export const saveDraftSnapshot = async (
  workoutExerciseId: string,
  sets: { set_number: number; weight: number | null; reps: number | null }[]
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workout_exercises')
      .update({ draft_snapshot: sets })
      .eq('id', workoutExerciseId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save draft snapshot',
    };
  }
};

/**
 * Clear draft snapshot (used when Save is clicked or browser is refreshed)
 */
export const clearDraftSnapshot = async (
  workoutExerciseId: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workout_exercises')
      .update({ draft_snapshot: null })
      .eq('id', workoutExerciseId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to clear draft snapshot',
    };
  }
};

/**
 * Restore from draft snapshot (used when Cancel is clicked)
 */
export const restoreFromDraftSnapshot = async (
  workoutExerciseId: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();

    // Get the current draft snapshot
    const { data: workoutExercise, error: fetchError } = await supabase
      .from('workout_exercises')
      .select('draft_snapshot')
      .eq('id', workoutExerciseId)
      .single();

    if (fetchError) return { success: false, error: fetchError.message };
    if (!workoutExercise?.draft_snapshot) {
      return { success: false, error: 'No draft snapshot found' };
    }

    // Restore sets from snapshot and clear the snapshot
    const { error: updateError } = await supabase
      .from('workout_exercises')
      .update({
        sets: workoutExercise.draft_snapshot,
        draft_snapshot: null
      })
      .eq('id', workoutExerciseId);

    if (updateError) return { success: false, error: updateError.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to restore from draft snapshot',
    };
  }
};
