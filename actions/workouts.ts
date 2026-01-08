'use server';

import { createClient } from '@/lib/supabase/server';
import { Workout, WorkoutWithExercises, ApiResponse, ApiSuccessResponse } from '@/types/database';

/**
 * Fetch all workouts
 */
export const fetchWorkouts = async (): Promise<ApiResponse<Workout[]>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workouts',
    };
  }
};

/**
 * Fetch workouts by date range
 */
export const fetchWorkoutsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<Workout[]>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workouts by date range',
    };
  }
};

/**
 * Fetch a single workout by ID with exercises
 */
export const fetchWorkoutById = async (
  workoutId: string
): Promise<ApiResponse<WorkoutWithExercises>> => {
  try {
    const supabase = await createClient();

    // First fetch the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (workoutError) return { data: null, error: workoutError.message };
    if (!workout) return { data: null, error: 'Workout not found' };

    // Then fetch the workout exercises with proper ordering
    const { data: workoutExercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercises (*)
      `)
      .eq('workout_id', workoutId)
      .order('order_index', { ascending: true });

    if (exercisesError) return { data: null, error: exercisesError.message };

    // Combine the data
    const data: WorkoutWithExercises = {
      ...workout,
      workout_exercises: workoutExercises || [],
    };

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workout',
    };
  }
};

/**
 * Create a new workout
 */
export const createWorkout = async (
  date: string
): Promise<ApiResponse<Workout>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workouts')
      .insert({ date })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create workout',
    };
  }
};

/**
 * Delete a workout
 */
export const deleteWorkout = async (
  workoutId: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete workout',
    };
  }
};

/**
 * Fetch workouts for a specific date
 */
export const fetchWorkoutsByDate = async (
  date: string
): Promise<ApiResponse<Workout[]>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workouts for date',
    };
  }
};
