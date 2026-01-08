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

/**
 * Create default empty sets for a new workout exercise
 * If previous workout data exists, match the number of completed sets
 * Otherwise, default to 3 empty sets
 */
export const createDefaultSets = (previousSets?: Set[]): Set[] => {
  let setCount = 3; // Default

  if (previousSets && previousSets.length > 0) {
    // Count completed sets from previous workout
    const completedCount = previousSets.filter(set =>
      (set.weight !== null && set.weight !== undefined) ||
      (set.reps !== null && set.reps !== undefined)
    ).length;

    if (completedCount > 0) {
      setCount = completedCount;
    }
  }

  return Array.from({ length: setCount }, (_, index) => ({
    set_number: index + 1,
    weight: null,
    reps: null,
  }));
};

/**
 * Remove empty sets and renumber remaining sets sequentially
 * A set is considered empty if both weight AND reps are null/undefined
 */
export const removeEmptySets = (sets: Set[]): Set[] => {
  const nonEmptySets = sets.filter(set =>
    (set.weight !== null && set.weight !== undefined) ||
    (set.reps !== null && set.reps !== undefined)
  );

  // Renumber sets sequentially
  return nonEmptySets.map((set, index) => ({
    ...set,
    set_number: index + 1,
  }));
};

/**
 * Check if a set is empty (both weight and reps are null/undefined)
 */
export const isSetEmpty = (set: Set): boolean => {
  return (
    (set.weight === null || set.weight === undefined) &&
    (set.reps === null || set.reps === undefined)
  );
};

/**
 * Add a new empty set at the end
 */
export const addNewSet = (sets: Set[]): Set[] => {
  const newSetNumber = sets.length + 1;
  return [
    ...sets,
    {
      set_number: newSetNumber,
      weight: null,
      reps: null,
    },
  ];
};

/**
 * Delete the last set (minimum 1 set must remain)
 */
export const deleteLastSet = (sets: Set[]): Set[] => {
  if (sets.length <= 1) {
    return sets; // Cannot delete the last set
  }
  return sets.slice(0, -1);
};
