/**
 * Exercise Controller
 *
 * Business logic for exercises including:
 * - Grouping exercises by body part or equipment
 * - Filtering by mastered status
 * - Sorting by name, last used date
 * - Search and filter logic
 */

import { Exercise } from '@/types/database';

export const groupExercisesByBodyPart = (
  exercises: Exercise[]
): Record<string, Exercise[]> => {
  return exercises.reduce((groups, exercise) => {
    const bodyPart = exercise.primary_body_part || 'Unknown';
    if (!groups[bodyPart]) groups[bodyPart] = [];
    groups[bodyPart].push(exercise);
    return groups;
  }, {} as Record<string, Exercise[]>);
};

export const filterMasteredExercises = (
  exercises: Exercise[]
): Exercise[] => {
  return exercises.filter(exercise => exercise.is_mastered);
};

export const sortExercisesByName = (
  exercises: Exercise[]
): Exercise[] => {
  return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
};

export const sortExercisesByLastUsed = (
  exercises: Exercise[]
): Exercise[] => {
  return [...exercises].sort((a, b) => {
    if (!a.last_used_date) return 1;
    if (!b.last_used_date) return -1;
    return new Date(b.last_used_date).getTime() - new Date(a.last_used_date).getTime();
  });
};

// Add more exercise-related business logic functions as needed
