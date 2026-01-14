/**
 * Workout Template Controller
 *
 * Business logic for workout templates including:
 * - Sorting templates
 * - Filtering templates
 * - Template validation
 */

import { WorkoutTemplate, WorkoutTemplateWithExercises } from '@/types/database';

/**
 * Sort workout templates alphabetically by name
 */
export const sortTemplatesByName = (
  templates: WorkoutTemplate[]
): WorkoutTemplate[] => {
  return [...templates].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Filter templates by name (search)
 */
export const filterTemplatesByName = (
  templates: WorkoutTemplate[],
  searchTerm: string
): WorkoutTemplate[] => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return templates.filter(template =>
    template.name.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Count exercises in a template
 */
export const countTemplateExercises = (
  template: WorkoutTemplateWithExercises
): number => {
  return template.template_exercises?.length || 0;
};

/**
 * Check if template has exercises
 */
export const hasExercises = (
  template: WorkoutTemplateWithExercises
): boolean => {
  return countTemplateExercises(template) > 0;
};
