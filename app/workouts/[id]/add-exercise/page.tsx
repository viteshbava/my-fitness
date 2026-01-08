'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchExercises } from '@/actions/exercises';
import { addExerciseToWorkout } from '@/actions/workout-exercises';
import { Exercise } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import { useToast } from '@/components/ToastProvider';
import {
  applyFilters,
  applySorting,
  getUniqueMovementTypes,
  getUniquePatterns,
  getUniquePrimaryBodyParts,
  getUniqueSecondaryBodyParts,
  getUniqueEquipment,
} from '@/lib/controllers/exercise-controller';

const AddExercisePage = () => {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  const { showToast } = useToast();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [movementType, setMovementType] = useState('');
  const [pattern, setPattern] = useState('');
  const [primaryBodyPart, setPrimaryBodyPart] = useState('');
  const [secondaryBodyPart, setSecondaryBodyPart] = useState('');
  const [equipment, setEquipment] = useState('');
  const [isMastered, setIsMastered] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'last_used_date'>('name');
  const [showFilters, setShowFilters] = useState(false);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error'
  ) => {
    setAlertModalContent({ title, message, type });
    setAlertModalOpen(true);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    const { data, error } = await fetchExercises();

    if (error) {
      showAlert('Error Loading Exercises', error, 'error');
      setLoading(false);
      return;
    }

    setExercises(data || []);
    setLoading(false);
  };

  // Get unique values for filter dropdowns
  const uniqueMovementTypes = useMemo(() => getUniqueMovementTypes(exercises), [exercises]);
  const uniquePatterns = useMemo(() => getUniquePatterns(exercises), [exercises]);
  const uniquePrimaryBodyParts = useMemo(() => getUniquePrimaryBodyParts(exercises), [exercises]);
  const uniqueSecondaryBodyParts = useMemo(
    () => getUniqueSecondaryBodyParts(exercises),
    [exercises]
  );
  const uniqueEquipment = useMemo(() => getUniqueEquipment(exercises), [exercises]);

  // Apply filters and sorting
  const filteredAndSortedExercises = useMemo(() => {
    const filtered = applyFilters(exercises, {
      searchTerm,
      movementType,
      pattern,
      primaryBodyPart,
      secondaryBodyPart,
      equipment,
      isMastered,
    });
    return applySorting(filtered, sortBy);
  }, [
    exercises,
    searchTerm,
    movementType,
    pattern,
    primaryBodyPart,
    secondaryBodyPart,
    equipment,
    isMastered,
    sortBy,
  ]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      movementType ||
      pattern ||
      primaryBodyPart ||
      secondaryBodyPart ||
      equipment ||
      isMastered !== null
    );
  }, [movementType, pattern, primaryBodyPart, secondaryBodyPart, equipment, isMastered]);

  const clearFilters = () => {
    setSearchTerm('');
    setMovementType('');
    setPattern('');
    setPrimaryBodyPart('');
    setSecondaryBodyPart('');
    setEquipment('');
    setIsMastered(null);
  };

  const handleAddExercise = async (exercise: Exercise) => {
    setAdding(true);
    const { data, error } = await addExerciseToWorkout(workoutId, exercise.id);

    if (error) {
      showAlert('Error Adding Exercise', error, 'error');
      setAdding(false);
      return;
    }

    if (data) {
      showToast(`${exercise.name} added to workout`, 'success');
      router.push(`/workouts/${workoutId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/workouts/${workoutId}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block cursor-pointer"
          >
            ← Back to Workout
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Add Exercise to Workout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select an exercise to add to your workout. You can add the same exercise multiple
            times.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search exercises by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filters - Collapsible */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-3 flex-1 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <svg
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                    showFilters ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Active
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-4 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Movement Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Movement Type
                  </label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    {uniqueMovementTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pattern */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pattern
                  </label>
                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    {uniquePatterns.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Body Part */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Body Part
                  </label>
                  <select
                    value={primaryBodyPart}
                    onChange={(e) => setPrimaryBodyPart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    {uniquePrimaryBodyParts.map((part) => (
                      <option key={part} value={part}>
                        {part}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Secondary Body Part */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Body Part
                  </label>
                  <select
                    value={secondaryBodyPart}
                    onChange={(e) => setSecondaryBodyPart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    {uniqueSecondaryBodyParts.map((part) => (
                      <option key={part} value={part}>
                        {part}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Equipment
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    {uniqueEquipment.map((eq) => (
                      <option key={eq} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Is Learnt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={isMastered === null ? '' : isMastered.toString()}
                    onChange={(e) =>
                      setIsMastered(e.target.value === '' ? null : e.target.value === 'true')
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="true">Learnt</option>
                    <option value="false">Not Learnt</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedExercises.length} of {exercises.length} exercises
          </p>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'last_used_date')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Alphabetical</option>
              <option value="last_used_date">Last Used</option>
            </select>
          </div>
        </div>

        {/* Exercise Grid */}
        {filteredAndSortedExercises.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">
              No exercises found matching your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedExercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => !adding && handleAddExercise(exercise)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg hover:border hover:border-blue-500 dark:hover:border-blue-400 transition-all p-6 cursor-pointer border border-transparent"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {exercise.name}
                  </h3>
                  {exercise.is_mastered && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Learnt
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Primary:</span> {exercise.primary_body_part}
                  </p>
                  <p>
                    <span className="font-medium">Equipment:</span> {exercise.equipment}
                  </p>
                  <p>
                    <span className="font-medium">Pattern:</span> {exercise.pattern}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModalOpen}
        title={alertModalContent.title}
        message={alertModalContent.message}
        type={alertModalContent.type}
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
};

export default AddExercisePage;
