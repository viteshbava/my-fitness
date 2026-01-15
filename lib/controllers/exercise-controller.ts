/**
 * Exercise Controller
 *
 * Business logic for exercises including:
 * - Grouping exercises by body part or equipment
 * - Filtering by mastered status
 * - Sorting by name
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

/**
 * Search exercises by name
 * Supports multi-word search where ALL words must match (case-insensitive, partial matches allowed)
 * Example: "bench press barbell" will match "Bench Press Flat Barbell"
 */
export const searchExercisesByName = (
  exercises: Exercise[],
  searchTerm: string
): Exercise[] => {
  if (!searchTerm.trim()) {
    return exercises;
  }

  // Split search term into individual words and convert to lowercase
  const searchWords = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 0);

  // Filter exercises where ALL search words are found in the exercise name
  return exercises.filter(exercise => {
    const lowerExerciseName = exercise.name.toLowerCase();
    return searchWords.every(word => lowerExerciseName.includes(word));
  });
};

/**
 * Filter exercises by movement type
 */
export const filterByMovementType = (
  exercises: Exercise[],
  movementType: string
): Exercise[] => {
  if (!movementType) {
    return exercises;
  }
  return exercises.filter(exercise => exercise.movement_type === movementType);
};

/**
 * Filter exercises by pattern
 */
export const filterByPattern = (
  exercises: Exercise[],
  pattern: string
): Exercise[] => {
  if (!pattern) {
    return exercises;
  }
  return exercises.filter(exercise => exercise.pattern === pattern);
};

/**
 * Filter exercises by primary body part
 */
export const filterByPrimaryBodyPart = (
  exercises: Exercise[],
  bodyPart: string
): Exercise[] => {
  if (!bodyPart) {
    return exercises;
  }
  return exercises.filter(exercise => exercise.primary_body_part === bodyPart);
};

/**
 * Filter exercises by secondary body part
 */
export const filterBySecondaryBodyPart = (
  exercises: Exercise[],
  bodyPart: string
): Exercise[] => {
  if (!bodyPart) {
    return exercises;
  }
  return exercises.filter(exercise => exercise.secondary_body_part === bodyPart);
};

/**
 * Filter exercises by equipment
 */
export const filterByEquipment = (
  exercises: Exercise[],
  equipment: string
): Exercise[] => {
  if (!equipment) {
    return exercises;
  }
  return exercises.filter(exercise => exercise.equipment === equipment);
};

/**
 * Filter exercises by mastered status
 */
export const filterByMasteredStatus = (
  exercises: Exercise[],
  isMastered: boolean | null
): Exercise[] => {
  if (isMastered === null) {
    return exercises;
  }
  return exercises.filter(exercise => exercise.is_mastered === isMastered);
};

/**
 * Apply all filters to exercises
 */
export const applyFilters = (
  exercises: Exercise[],
  filters: {
    searchTerm?: string;
    movementType?: string;
    pattern?: string;
    primaryBodyPart?: string;
    secondaryBodyPart?: string;
    equipment?: string;
    isMastered?: boolean | null;
  }
): Exercise[] => {
  let filtered = exercises;

  if (filters.searchTerm) {
    filtered = searchExercisesByName(filtered, filters.searchTerm);
  }
  if (filters.movementType) {
    filtered = filterByMovementType(filtered, filters.movementType);
  }
  if (filters.pattern) {
    filtered = filterByPattern(filtered, filters.pattern);
  }
  if (filters.primaryBodyPart) {
    filtered = filterByPrimaryBodyPart(filtered, filters.primaryBodyPart);
  }
  if (filters.secondaryBodyPart) {
    filtered = filterBySecondaryBodyPart(filtered, filters.secondaryBodyPart);
  }
  if (filters.equipment) {
    filtered = filterByEquipment(filtered, filters.equipment);
  }
  if (filters.isMastered !== undefined && filters.isMastered !== null) {
    filtered = filterByMasteredStatus(filtered, filters.isMastered);
  }

  return filtered;
};

/**
 * Apply filters and return both fully filtered results and search-only matches
 *
 * When a text search is active WITH other filters, this returns:
 * - filteredResults: exercises that match ALL criteria (search + filters)
 * - searchOnlyMatches: exercises that match ONLY the text search (but not the other filters)
 *
 * This helps users understand why some search results aren't showing up due to active filters.
 */
export const applyFiltersWithSearchFallback = (
  exercises: Exercise[],
  filters: {
    searchTerm?: string;
    movementType?: string;
    pattern?: string;
    primaryBodyPart?: string;
    secondaryBodyPart?: string;
    equipment?: string;
    isMastered?: boolean | null;
  }
): { filteredResults: Exercise[]; searchOnlyMatches: Exercise[] } => {
  // Check if any non-search filters are active
  const hasActiveFilters =
    !!filters.movementType ||
    !!filters.pattern ||
    !!filters.primaryBodyPart ||
    !!filters.secondaryBodyPart ||
    !!filters.equipment ||
    (filters.isMastered !== undefined && filters.isMastered !== null);

  // Get fully filtered results (search + all filters)
  const filteredResults = applyFilters(exercises, filters);

  // If there's a search term AND active filters, get search-only matches
  let searchOnlyMatches: Exercise[] = [];
  if (filters.searchTerm && hasActiveFilters) {
    // Apply only non-search filters to get what filters alone would return
    let filterOnlyResults = exercises;
    if (filters.movementType) {
      filterOnlyResults = filterByMovementType(filterOnlyResults, filters.movementType);
    }
    if (filters.pattern) {
      filterOnlyResults = filterByPattern(filterOnlyResults, filters.pattern);
    }
    if (filters.primaryBodyPart) {
      filterOnlyResults = filterByPrimaryBodyPart(filterOnlyResults, filters.primaryBodyPart);
    }
    if (filters.secondaryBodyPart) {
      filterOnlyResults = filterBySecondaryBodyPart(filterOnlyResults, filters.secondaryBodyPart);
    }
    if (filters.equipment) {
      filterOnlyResults = filterByEquipment(filterOnlyResults, filters.equipment);
    }
    if (filters.isMastered !== undefined && filters.isMastered !== null) {
      filterOnlyResults = filterByMasteredStatus(filterOnlyResults, filters.isMastered);
    }

    // Get exercises that match search term
    const searchResults = searchExercisesByName(exercises, filters.searchTerm);

    // Find exercises that match search but not the filters
    // (these are exercises in searchResults but not in filterOnlyResults)
    searchOnlyMatches = searchResults.filter(
      exercise => !filterOnlyResults.find(filtered => filtered.id === exercise.id)
    );
  }

  return {
    filteredResults,
    searchOnlyMatches
  };
};

/**
 * Sort exercises by name (last_used_date sorting is no longer supported)
 * This function is kept for backwards compatibility
 */
export const sortExercisesByLastUsed = (
  exercises: Exercise[]
): Exercise[] => {
  // Since last_used_date has been removed, just sort by name
  return sortExercisesByName(exercises);
};

/**
 * Apply sorting to exercises
 */
export const applySorting = (
  exercises: Exercise[]
): Exercise[] => {
  return sortExercisesByName(exercises);
};

/**
 * Get unique values for filter dropdowns
 */
export const getUniqueMovementTypes = (exercises: Exercise[]): string[] => {
  const types = exercises.map(e => e.movement_type).filter(Boolean);
  return [...new Set(types)].sort();
};

export const getUniquePatterns = (exercises: Exercise[]): string[] => {
  const patterns = exercises.map(e => e.pattern).filter(Boolean);
  return [...new Set(patterns)].sort();
};

export const getUniquePrimaryBodyParts = (exercises: Exercise[]): string[] => {
  const parts = exercises.map(e => e.primary_body_part).filter(Boolean);
  return [...new Set(parts)].sort();
};

export const getUniqueSecondaryBodyParts = (exercises: Exercise[]): string[] => {
  const parts = exercises.map(e => e.secondary_body_part).filter(Boolean);
  return [...new Set(parts)].sort();
};

export const getUniqueEquipment = (exercises: Exercise[]): string[] => {
  const equipment = exercises.map(e => e.equipment).filter(Boolean);
  return [...new Set(equipment)].sort();
};
