'use server';

import { createClient } from '@/lib/supabase/server';
import {
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
  ApiResponse,
  ApiSuccessResponse,
  Workout,
} from '@/types/database';

/**
 * Fetch all workout templates
 */
export const fetchWorkoutTemplates = async (): Promise<ApiResponse<WorkoutTemplate[]>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workout templates',
    };
  }
};

/**
 * Fetch a single workout template by ID with exercises
 */
export const fetchWorkoutTemplateById = async (
  templateId: string
): Promise<ApiResponse<WorkoutTemplateWithExercises>> => {
  try {
    const supabase = await createClient();

    // First fetch the template
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) return { data: null, error: templateError.message };
    if (!template) return { data: null, error: 'Template not found' };

    // Then fetch the template exercises with proper ordering
    const { data: templateExercises, error: exercisesError } = await supabase
      .from('template_exercises')
      .select(`
        *,
        exercise:exercises (*)
      `)
      .eq('template_id', templateId)
      .order('order_index', { ascending: true });

    if (exercisesError) return { data: null, error: exercisesError.message };

    // Combine the data
    const data: WorkoutTemplateWithExercises = {
      ...template,
      template_exercises: templateExercises || [],
    };

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch workout template',
    };
  }
};

/**
 * Create a new workout template
 */
export const createWorkoutTemplate = async (
  name: string
): Promise<ApiResponse<WorkoutTemplate>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({ name })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create workout template',
    };
  }
};

/**
 * Update workout template name
 */
export const updateWorkoutTemplateName = async (
  templateId: string,
  name: string
): Promise<ApiResponse<WorkoutTemplate>> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('workout_templates')
      .update({ name })
      .eq('id', templateId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update workout template name',
    };
  }
};

/**
 * Delete a workout template
 */
export const deleteWorkoutTemplate = async (
  templateId: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', templateId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete workout template',
    };
  }
};

/**
 * Add an exercise to a workout template
 */
export const addExerciseToTemplate = async (
  templateId: string,
  exerciseId: string,
  orderIndex?: number
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();

    // If no order index provided, get the max order_index and add 1
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const { data: existingExercises } = await supabase
        .from('template_exercises')
        .select('order_index')
        .eq('template_id', templateId)
        .order('order_index', { ascending: false })
        .limit(1);

      finalOrderIndex = existingExercises && existingExercises.length > 0
        ? existingExercises[0].order_index + 1
        : 0;
    }

    const { error } = await supabase
      .from('template_exercises')
      .insert({
        template_id: templateId,
        exercise_id: exerciseId,
        order_index: finalOrderIndex,
      });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to add exercise to template',
    };
  }
};

/**
 * Remove an exercise from a workout template
 */
export const removeExerciseFromTemplate = async (
  templateExerciseId: string
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('template_exercises')
      .delete()
      .eq('id', templateExerciseId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove exercise from template',
    };
  }
};

/**
 * Update order indices for template exercises (for drag-and-drop reordering)
 */
export const updateTemplateExercisesOrder = async (
  updates: { id: string; order_index: number }[]
): Promise<ApiSuccessResponse> => {
  try {
    const supabase = await createClient();

    // Update each template exercise's order_index
    const updatePromises = updates.map(({ id, order_index }) =>
      supabase
        .from('template_exercises')
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
 * Create a workout from a template
 * This creates a new workout with the current date and adds all exercises from the template
 */
export const createWorkoutFromTemplate = async (
  templateId: string,
  date: string
): Promise<ApiResponse<Workout>> => {
  try {
    const supabase = await createClient();

    // Fetch the template with exercises
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .select(`
        *,
        template_exercises (
          exercise_id,
          order_index
        )
      `)
      .eq('id', templateId)
      .single();

    if (templateError) return { data: null, error: templateError.message };
    if (!template) return { data: null, error: 'Template not found' };

    // Create the workout with the template's name
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        name: template.name,
        date: date,
      })
      .select()
      .single();

    if (workoutError) return { data: null, error: workoutError.message };

    // Add all exercises from the template to the new workout
    const templateExercises = (template as any).template_exercises || [];

    if (templateExercises.length > 0) {
      // For each exercise, determine default set count based on previous workouts
      const workoutExercisesData = await Promise.all(
        templateExercises.map(async (te: any) => {
          // Get the most recent workout exercise for this exercise to determine default set count
          const { data: previousWorkoutExercises } = await supabase
            .from('workout_exercises')
            .select('sets')
            .eq('exercise_id', te.exercise_id)
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

          return {
            workout_id: workout.id,
            exercise_id: te.exercise_id,
            order_index: te.order_index,
            sets: defaultSets,
          };
        })
      );

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercisesData);

      if (exercisesError) {
        // Clean up: delete the workout if adding exercises failed
        await supabase.from('workouts').delete().eq('id', workout.id);
        return { data: null, error: exercisesError.message };
      }
    }

    return { data: workout, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create workout from template',
    };
  }
};
