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
 * Add an exercise to a workout
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

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workoutId,
        exercise_id: exerciseId,
        order_index: finalOrderIndex,
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
