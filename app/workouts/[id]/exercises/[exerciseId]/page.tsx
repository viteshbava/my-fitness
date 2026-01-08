'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchWorkoutExerciseById,
  removeExerciseFromWorkout,
  updateWorkoutExerciseSets,
  saveDraftSnapshot,
  clearDraftSnapshot,
  restoreFromDraftSnapshot,
  fetchMostRecentWorkoutWithData,
} from '@/actions/workout-exercises';
import { WorkoutExerciseWithExercise, Set } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/components/ToastProvider';
import {
  calculateMaxWeight,
  addNewSet,
  deleteLastSet,
  removeEmptySets,
} from '@/lib/controllers/workout-exercise-controller';

const WorkoutExerciseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  const exerciseId = params.exerciseId as string;
  const { showToast } = useToast();

  const [workoutExercise, setWorkoutExercise] = useState<WorkoutExerciseWithExercise | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [previousSets, setPreviousSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInProgress, setIsInProgress] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  // Confirmation modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error'
  ) => {
    setAlertModalContent({ title, message, type });
    setAlertModalOpen(true);
  };

  useEffect(() => {
    loadWorkoutExercise();
  }, [exerciseId]);

  // Clear draft snapshot on component mount (browser refresh scenario)
  useEffect(() => {
    const clearDraftOnMount = async () => {
      if (exerciseId) {
        await clearDraftSnapshot(exerciseId);
      }
    };
    clearDraftOnMount();
  }, [exerciseId]);

  // Block navigation when in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isInProgress) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isInProgress]);

  const loadWorkoutExercise = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkoutExerciseById(exerciseId);

    if (error) {
      showAlert('Error Loading Exercise', error, 'error');
      setLoading(false);
      return;
    }

    if (data) {
      setWorkoutExercise(data);
      setSets(data.sets || []);

      // Load previous workout data for placeholders
      const { data: previousData } = await fetchMostRecentWorkoutWithData(
        data.exercise_id,
        workoutId
      );
      if (previousData) {
        setPreviousSets(previousData);
      }
    }
    setLoading(false);
  };

  // Auto-save function with debouncing
  const autoSave = useCallback(
    async (updatedSets: Set[]) => {
      if (!isInProgress || !exerciseId) return;

      setAutoSaving(true);
      const { error } = await updateWorkoutExerciseSets(exerciseId, updatedSets);
      setAutoSaving(false);

      if (error) {
        showAlert('Auto-save Failed', error, 'error');
      }
    },
    [isInProgress, exerciseId]
  );

  // Debounced auto-save
  useEffect(() => {
    if (!isInProgress) return;

    const timeoutId = setTimeout(() => {
      autoSave(sets);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [sets, isInProgress, autoSave]);

  const handleEnterInProgress = async () => {
    if (!exerciseId) return;

    // Save draft snapshot
    const { error } = await saveDraftSnapshot(exerciseId, sets);
    if (error) {
      showAlert('Error', 'Failed to enter edit mode', 'error');
      return;
    }

    setIsInProgress(true);
  };

  const handleSave = async () => {
    if (!exerciseId) return;

    // Remove empty sets before final save
    const cleanedSets = removeEmptySets(sets);

    const { error: updateError } = await updateWorkoutExerciseSets(exerciseId, cleanedSets);
    if (updateError) {
      showAlert('Error Saving', updateError, 'error');
      return;
    }

    // Clear draft snapshot
    const { error: clearError } = await clearDraftSnapshot(exerciseId);
    if (clearError) {
      showAlert('Error', 'Failed to clear draft', 'error');
      return;
    }

    setSets(cleanedSets);
    setIsInProgress(false);
    showToast('Changes saved successfully', 'success');

    // Reload to get fresh data
    await loadWorkoutExercise();
  };

  const handleCancelClick = () => {
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!exerciseId) return;

    // Restore from draft snapshot
    const { error } = await restoreFromDraftSnapshot(exerciseId);
    if (error) {
      showAlert('Error', 'Failed to restore previous state', 'error');
      setCancelModalOpen(false);
      return;
    }

    setCancelModalOpen(false);
    setIsInProgress(false);
    showToast('Changes cancelled', 'info');

    // Reload to get restored data
    await loadWorkoutExercise();
  };

  const handleUpdateSet = (index: number, field: 'weight' | 'reps', value: string) => {
    const updatedSets = [...sets];
    const numValue = value === '' ? null : parseFloat(value);

    if (field === 'weight') {
      updatedSets[index].weight = numValue;
    } else {
      // Reps should be integer
      updatedSets[index].reps = numValue !== null ? Math.floor(numValue) : null;
    }

    setSets(updatedSets);
  };

  const handleAddSet = () => {
    const updatedSets = addNewSet(sets);
    setSets(updatedSets);
  };

  const handleDeleteLastSet = () => {
    const updatedSets = deleteLastSet(sets);
    setSets(updatedSets);
  };

  // Get placeholder text for a set based on previous workout data
  const getPlaceholder = (setNumber: number, field: 'weight' | 'reps'): string => {
    if (!previousSets || previousSets.length === 0) return '0';

    const previousSet = previousSets.find((s: Set) => s.set_number === setNumber);
    if (!previousSet) return '0';

    const value = field === 'weight' ? previousSet.weight : previousSet.reps;
    return value !== null && value !== undefined ? value.toString() : '0';
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!workoutExercise) return;

    const { success, error } = await removeExerciseFromWorkout(workoutExercise.id);

    if (error) {
      setDeleteModalOpen(false);
      showAlert('Error Removing Exercise', error, 'error');
      return;
    }

    if (success) {
      showToast('Exercise removed from workout', 'success');
      router.push(`/workouts/${workoutId}`);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (!workoutExercise) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 dark:text-gray-400'>Exercise not found</p>
          <Link
            href={`/workouts/${workoutId}`}
            className='mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer'>
            Back to Workout
          </Link>
        </div>
      </div>
    );
  }

  const maxWeight = calculateMaxWeight(sets);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          {!isInProgress && (
            <Link
              href={`/workouts/${workoutId}`}
              className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block cursor-pointer'>
              ← Back to Workout
            </Link>
          )}
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                {workoutExercise.exercise.name}
              </h1>
              {maxWeight > 0 && (
                <p className='text-lg text-gray-600 dark:text-gray-400'>
                  Max Weight: <span className='font-semibold'>{maxWeight} kg</span>
                </p>
              )}
            </div>
            {!isInProgress && (
              <button
                onClick={handleDeleteClick}
                className='flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Remove from Workout
              </button>
            )}
          </div>
        </div>

        {/* Exercise Details */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Exercise Details
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Primary Body Part</p>
              <p className='text-lg text-gray-900 dark:text-white'>
                {workoutExercise.exercise.primary_body_part}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Secondary Body Part
              </p>
              <p className='text-lg text-gray-900 dark:text-white'>
                {workoutExercise.exercise.secondary_body_part}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Equipment</p>
              <p className='text-lg text-gray-900 dark:text-white'>
                {workoutExercise.exercise.equipment}
              </p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Movement Type</p>
              <p className='text-lg text-gray-900 dark:text-white'>
                {workoutExercise.exercise.movement_type}
              </p>
            </div>
          </div>
        </div>

        {/* Sets Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Sets</h2>
              {autoSaving && (
                <span className='ml-3 text-sm text-gray-500 dark:text-gray-400'>
                  Auto-saving...
                </span>
              )}
            </div>
            {!isInProgress ? (
              <button
                onClick={handleEnterInProgress}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
                Start Editing
              </button>
            ) : (
              <div className='flex gap-2'>
                <button
                  onClick={handleCancelClick}
                  className='px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-md transition-colors cursor-pointer'>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
                  Save
                </button>
              </div>
            )}
          </div>

          {sets.length === 0 ? (
            <p className='text-gray-500 dark:text-gray-400'>No sets recorded yet</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-700'>
                    <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Set
                    </th>
                    <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Weight (kg)
                    </th>
                    <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Reps
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((set, index) => (
                    <tr key={index} className='border-b border-gray-100 dark:border-gray-700'>
                      <td className='py-2 px-4 text-gray-900 dark:text-white'>{set.set_number}</td>
                      <td className='py-2 px-4'>
                        {isInProgress ? (
                          <input
                            type='number'
                            step='0.5'
                            min='0'
                            value={set.weight ?? ''}
                            onChange={(e) => handleUpdateSet(index, 'weight', e.target.value)}
                            className='w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                            placeholder={getPlaceholder(set.set_number, 'weight')}
                          />
                        ) : (
                          <span className='text-gray-900 dark:text-white'>
                            {set.weight ?? '-'}
                          </span>
                        )}
                      </td>
                      <td className='py-2 px-4'>
                        {isInProgress ? (
                          <input
                            type='number'
                            step='1'
                            min='0'
                            value={set.reps ?? ''}
                            onChange={(e) => handleUpdateSet(index, 'reps', e.target.value)}
                            className='w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                            placeholder={getPlaceholder(set.set_number, 'reps')}
                          />
                        ) : (
                          <span className='text-gray-900 dark:text-white'>{set.reps ?? '-'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isInProgress && (
            <div className='mt-4 flex gap-2'>
              <button
                onClick={handleAddSet}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
                Add Set
              </button>
              {sets.length > 1 && (
                <button
                  onClick={handleDeleteLastSet}
                  className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
                  Delete Last Set
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModalOpen}
        title={alertModalContent.title}
        message={alertModalContent.message}
        type={alertModalContent.type}
        onClose={() => setAlertModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title='Remove Exercise'
        message={`Are you sure you want to remove "${workoutExercise.exercise.name}" from this workout? This action cannot be undone.`}
        confirmText='Remove'
        cancelText='Cancel'
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title='Cancel Changes'
        message='Are you sure you want to cancel? All unsaved changes will be lost.'
        confirmText='Yes, Cancel Changes'
        cancelText='Keep Editing'
        onConfirm={confirmCancel}
        onCancel={() => setCancelModalOpen(false)}
        isDangerous={true}
      />
    </div>
  );
};

export default WorkoutExerciseDetailPage;
