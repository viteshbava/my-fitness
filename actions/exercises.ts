/**
 * Exercise Actions (Server-side)
 *
 * All database operations for exercises should be defined here.
 * These are Server Actions that can be called from Client Components.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Exercise,
  Set,
  ApiSuccessResponse,
  ApiResponse,
  CreateExerciseInput,
  UpdateExerciseInput,
  ExerciseUsageStatus,
  ExerciseUsageDetails,
} from '@/types/database';
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

/**
 * Create a new exercise
 */
export const createExercise = async (
  exerciseData: CreateExerciseInput
): Promise<ApiResponse<Exercise>> => {
  try {
    const supabase = await createClient();

    // Set default values for required fields if not provided
    const dataToInsert = {
      name: exerciseData.name.trim(),
      video_url: exerciseData.video_url || null,
      movement_type: exerciseData.movement_type || 'Unknown',
      pattern: exerciseData.pattern || 'Unknown',
      primary_body_part: exerciseData.primary_body_part || 'Unknown',
      secondary_body_part: exerciseData.secondary_body_part || '',
      equipment: exerciseData.equipment || 'Unknown',
      notes: exerciseData.notes || null,
      is_mastered: false,
    };

    const { data, error } = await supabase
      .from('exercises')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return { data: null, error: 'An exercise with this name already exists' };
      }
      return { data: null, error: error.message };
    }

    // Revalidate exercise-related pages
    revalidatePath('/exercises');

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create exercise',
    };
  }
};

/**
 * Update an existing exercise
 */
export const updateExercise = async (
  id: string,
  exerciseData: UpdateExerciseInput
): Promise<ApiResponse<Exercise>> => {
  try {
    const supabase = await createClient();

    // Build update object, only including fields that are provided
    const updateData: Record<string, unknown> = {};

    if (exerciseData.name !== undefined) {
      updateData.name = exerciseData.name.trim();
    }
    if (exerciseData.video_url !== undefined) {
      updateData.video_url = exerciseData.video_url || null;
    }
    if (exerciseData.movement_type !== undefined) {
      updateData.movement_type = exerciseData.movement_type;
    }
    if (exerciseData.pattern !== undefined) {
      updateData.pattern = exerciseData.pattern;
    }
    if (exerciseData.primary_body_part !== undefined) {
      updateData.primary_body_part = exerciseData.primary_body_part;
    }
    if (exerciseData.secondary_body_part !== undefined) {
      updateData.secondary_body_part = exerciseData.secondary_body_part;
    }
    if (exerciseData.equipment !== undefined) {
      updateData.equipment = exerciseData.equipment;
    }
    if (exerciseData.notes !== undefined) {
      updateData.notes = exerciseData.notes || null;
    }

    const { data, error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return { data: null, error: 'An exercise with this name already exists' };
      }
      return { data: null, error: error.message };
    }

    // Revalidate exercise-related pages
    revalidatePath('/exercises');
    revalidatePath(`/exercises/${id}`);

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update exercise',
    };
  }
};

/**
 * Check if an exercise is used in any workouts or templates
 * Used for delete protection validation
 */
export const checkExerciseUsage = async (
  exerciseId: string
): Promise<ApiResponse<ExerciseUsageStatus>> => {
  try {
    const supabase = await createClient();

    // Check workout_exercises
    const { count: workoutCount, error: workoutError } = await supabase
      .from('workout_exercises')
      .select('*', { count: 'exact', head: true })
      .eq('exercise_id', exerciseId);

    if (workoutError) {
      return { data: null, error: workoutError.message };
    }

    // Check template_exercises
    const { count: templateCount, error: templateError } = await supabase
      .from('template_exercises')
      .select('*', { count: 'exact', head: true })
      .eq('exercise_id', exerciseId);

    if (templateError) {
      return { data: null, error: templateError.message };
    }

    const usage: ExerciseUsageStatus = {
      isUsed: (workoutCount || 0) > 0 || (templateCount || 0) > 0,
      workoutCount: workoutCount || 0,
      templateCount: templateCount || 0,
    };

    return { data: usage, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to check exercise usage',
    };
  }
};

/**
 * Delete an exercise
 * Will fail if exercise is used in any workouts or templates
 */
export const deleteExercise = async (
  id: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();

    // First check if exercise is used
    const { data: usage, error: usageError } = await checkExerciseUsage(id);

    if (usageError) {
      return { success: false, error: usageError };
    }

    if (usage?.isUsed) {
      const parts = [];
      if (usage.workoutCount > 0) {
        parts.push(`${usage.workoutCount} workout${usage.workoutCount > 1 ? 's' : ''}`);
      }
      if (usage.templateCount > 0) {
        parts.push(`${usage.templateCount} template${usage.templateCount > 1 ? 's' : ''}`);
      }
      return {
        success: false,
        error: `Cannot delete exercise. It is used in ${parts.join(' and ')}. Remove it from all workouts and templates first.`,
      };
    }

    // Proceed with delete
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate exercise-related pages
    revalidatePath('/exercises');

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete exercise',
    };
  }
};

/**
 * Fetch detailed usage information for an exercise
 * Returns all workouts and templates that contain this exercise
 * This is a potentially expensive query, so it should be called lazily
 */
export const fetchExerciseUsageDetails = async (
  exerciseId: string
): Promise<ApiResponse<ExerciseUsageDetails>> => {
  try {
    const supabase = await createClient();

    // Fetch workouts that contain this exercise
    const { data: workoutExercises, error: workoutError } = await supabase
      .from('workout_exercises')
      .select(`
        workout:workouts!inner (
          id,
          name,
          date
        )
      `)
      .eq('exercise_id', exerciseId);

    if (workoutError) {
      return { data: null, error: workoutError.message };
    }

    // Fetch templates that contain this exercise
    const { data: templateExercises, error: templateError } = await supabase
      .from('template_exercises')
      .select(`
        template:workout_templates!inner (
          id,
          name
        )
      `)
      .eq('exercise_id', exerciseId);

    if (templateError) {
      return { data: null, error: templateError.message };
    }

    // Extract unique workouts (in case same exercise appears multiple times in a workout)
    const workoutsMap = new Map<string, { id: string; name: string; date: string }>();
    (workoutExercises || []).forEach((we: any) => {
      const workout = we.workout;
      if (workout && !workoutsMap.has(workout.id)) {
        workoutsMap.set(workout.id, {
          id: workout.id,
          name: workout.name,
          date: workout.date,
        });
      }
    });

    // Extract unique templates
    const templatesMap = new Map<string, { id: string; name: string }>();
    (templateExercises || []).forEach((te: any) => {
      const template = te.template;
      if (template && !templatesMap.has(template.id)) {
        templatesMap.set(template.id, {
          id: template.id,
          name: template.name,
        });
      }
    });

    // Sort workouts by date descending
    const workouts = Array.from(workoutsMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Sort templates by name
    const templates = Array.from(templatesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return {
      data: { workouts, templates },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch exercise usage details',
    };
  }
};
