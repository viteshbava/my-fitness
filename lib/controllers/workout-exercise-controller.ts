/**
 * Workout Exercise Controller
 *
 * Business logic for workout exercises including:
 * - Calculating max weight (≥6 reps criterion)
 * - Determining set completion status (color coding)
 * - Sorting sets by set number
 * - Calculating set totals and summaries
 */

import { WorkoutExercise, Set } from '@/types/database';

export const calculateMaxWeight = (sets: Set[]): number => {
  return sets
    .filter(set => (set.reps || 0) >= 6)
    .reduce((max, set) => Math.max(max, set.weight || 0), 0);
};

export const getCompletionStatus = (sets: Set[]): 'none' | 'partial' | 'complete' => {
  if (!sets || sets.length === 0) return 'none';

  const completedSets = sets.filter(set =>
    (set.weight !== null && set.weight !== undefined) ||
    (set.reps !== null && set.reps !== undefined)
  );

  if (completedSets.length === 0) return 'none';
  if (completedSets.length < sets.length) return 'partial';
  return 'complete';
};

export const getCompletionColor = (status: 'none' | 'partial' | 'complete'): string => {
  switch (status) {
    case 'none':
      return 'bg-gray-200';
    case 'partial':
      return 'bg-yellow-200';
    case 'complete':
      return 'bg-green-200';
  }
};

export const formatSetsSummary = (sets: Set[]): string => {
  const completedSets = sets.filter(set =>
    (set.weight !== null && set.weight !== undefined) ||
    (set.reps !== null && set.reps !== undefined)
  );

  if (completedSets.length === 0) return 'No sets completed';
  return `${completedSets.length} ${completedSets.length === 1 ? 'set' : 'sets'} completed`;
};

// Add more workout-exercise-related business logic functions as needed
