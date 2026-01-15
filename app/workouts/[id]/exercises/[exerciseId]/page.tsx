'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchWorkoutExerciseById,
  removeExerciseFromWorkout,
  updateWorkoutExerciseSets,
  saveWorkoutExerciseSets,
  saveDraftSnapshot,
  clearDraftSnapshot,
  restoreFromDraftSnapshot,
  fetchMostRecentWorkoutWithData,
  fetchHistoricalWorkoutExercises,
  fetchBestSetForExercise,
  getNextWorkoutExercise,
} from '@/actions/workout-exercises';
import { updateExerciseNotes, updateExerciseIsLearnt } from '@/actions/exercises';
import { WorkoutExerciseWithExercise, Set } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import SaveProgressModal from '@/components/SaveProgressModal';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';
import {
  addNewSet,
  deleteLastSet,
  removeEmptySets,
} from '@/lib/controllers/workout-exercise-controller';
import VideoThumbnail from '@/components/VideoThumbnail';
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb';
import KebabMenu from '@/components/KebabMenu';
import SectionLoader from '@/components/SectionLoader';

const WorkoutExerciseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  const exerciseId = params.exerciseId as string;
  const { showToast } = useToast();

  const [workoutExercise, setWorkoutExercise] = useState<WorkoutExerciseWithExercise | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [previousSets, setPreviousSets] = useState<Set[]>([]);
  const [historicalData, setHistoricalData] = useState<Array<{ date: string; sets: Set[] }>>([]);
  const [bestSet, setBestSet] = useState<Set | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPreviousSets, setLoadingPreviousSets] = useState(false);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingBestSet, setLoadingBestSet] = useState(false);
  const [historicalError, setHistoricalError] = useState<string | null>(null);
  const [bestSetError, setBestSetError] = useState<string | null>(null);
  const [isInProgress, setIsInProgress] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);

  // Exercise notes and learnt state
  const [notes, setNotes] = useState('');
  const [isLearnt, setIsLearnt] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingLearnt, setIsEditingLearnt] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingLearnt, setIsSavingLearnt] = useState(false);

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

  // Save progress modal
  const [saveProgressModalOpen, setSaveProgressModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nextExerciseId, setNextExerciseId] = useState<string | null>(null);

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

  /**
   * Phase 1: Load only critical workout exercise data to show page quickly
   */
  const loadWorkoutExercise = async (showLoadingScreen: boolean = true) => {
    if (showLoadingScreen) {
      setLoading(true);
    }
    const { data, error } = await fetchWorkoutExerciseById(exerciseId);

    if (error) {
      showAlert('Error Loading Exercise', error, 'error');
      setLoading(false);
      return;
    }

    if (data) {
      setWorkoutExercise(data);
      setSets(data.sets || []);
      setNotes(data.exercise.notes || '');
      setIsLearnt(data.exercise.is_mastered || false);

      if (showLoadingScreen) {
        setLoading(false);
      }

      // Phase 2: Load non-critical data progressively in parallel
      loadProgressiveData(data.exercise_id);
    } else {
      if (showLoadingScreen) {
        setLoading(false);
      }
    }
  };

  /**
   * Phase 2: Load previous sets, historical data, and best set in parallel
   */
  const loadProgressiveData = async (exerciseId: string) => {
    // Load all three in parallel for best performance
    Promise.all([
      loadPreviousSets(exerciseId),
      loadHistoricalData(exerciseId),
      loadBestSet(exerciseId)
    ]);
  };

  const loadPreviousSets = async (exerciseId: string) => {
    setLoadingPreviousSets(true);

    const { data: previousData } = await fetchMostRecentWorkoutWithData(
      exerciseId,
      workoutId
    );

    if (previousData) {
      setPreviousSets(previousData);
    }

    setLoadingPreviousSets(false);
  };

  const loadHistoricalData = async (exerciseId: string) => {
    setLoadingHistorical(true);
    setHistoricalError(null);

    const { data: historicalWorkouts, error: historicalError } =
      await fetchHistoricalWorkoutExercises(exerciseId, workoutId, 3);

    if (historicalError) {
      setHistoricalError(historicalError);
    } else if (historicalWorkouts) {
      setHistoricalData(historicalWorkouts);
    }

    setLoadingHistorical(false);
  };

  const loadBestSet = async (exerciseId: string) => {
    setLoadingBestSet(true);
    setBestSetError(null);

    const { data: bestSetData, error } = await fetchBestSetForExercise(exerciseId);

    if (error) {
      setBestSetError(error);
    } else if (bestSetData) {
      setBestSet(bestSetData);
    }

    setLoadingBestSet(false);
  };

  // Helper function to check if a set is complete
  const isSetComplete = (set: Set): boolean => {
    const hasWeight = set.weight !== null && set.weight !== undefined;
    const hasReps = set.reps !== null && set.reps !== undefined;
    // A set is complete if both fields are filled OR both fields are empty
    return (hasWeight && hasReps) || (!hasWeight && !hasReps);
  };

  // Auto-save function with debouncing
  const autoSave = useCallback(
    async (updatedSets: Set[]) => {
      if (!isInProgress || !exerciseId) return;

      // Only save complete sets (both fields filled or both empty)
      const completeSets = updatedSets.filter(isSetComplete);

      setAutoSaving(true);
      const { error } = await updateWorkoutExerciseSets(exerciseId, completeSets);
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
    if (!exerciseId || !workoutExercise) return;

    // Check for incomplete sets (only weight OR only reps filled)
    const incompleteSets = sets.filter((set) => !isSetComplete(set));
    if (incompleteSets.length > 0) {
      showAlert(
        'Incomplete Sets',
        'Some sets have only weight or reps filled in. Please complete both fields or leave both empty.',
        'error'
      );
      return;
    }

    // Show modal and start saving
    setSaveProgressModalOpen(true);
    setIsSaving(true);

    // Remove empty sets before final save
    const cleanedSets = removeEmptySets(sets);

    // Save sets and update exercise best set and last_used_date
    const { error: updateError } = await saveWorkoutExerciseSets(exerciseId, cleanedSets);
    if (updateError) {
      setSaveProgressModalOpen(false);
      setIsSaving(false);
      showAlert('Error Saving', updateError, 'error');
      return;
    }

    // Clear draft snapshot
    const { error: clearError } = await clearDraftSnapshot(exerciseId);
    if (clearError) {
      setSaveProgressModalOpen(false);
      setIsSaving(false);
      showAlert('Error', 'Failed to clear draft', 'error');
      return;
    }

    // Check if there's a next exercise
    const { data: nextExercise } = await getNextWorkoutExercise(workoutId, exerciseId);
    setNextExerciseId(nextExercise?.id || null);

    // Update state
    setSets(cleanedSets);
    setIsInProgress(false);

    // Reload to get fresh data (without showing loading screen)
    await loadWorkoutExercise(false);

    // Stop saving indicator
    setIsSaving(false);
  };

  const handleCancelClick = () => {
    setCancelModalOpen(true);
  };

  const handleBackToWorkout = () => {
    setSaveProgressModalOpen(false);
    router.push(`/workouts/${workoutId}`);
  };

  const handleNextExercise = () => {
    if (nextExerciseId) {
      setSaveProgressModalOpen(false);
      router.push(`/workouts/${workoutId}/exercises/${nextExerciseId}`);
    }
  };

  // Experience Level handlers
  const handleSaveLearnt = async () => {
    if (!workoutExercise) return;

    setIsSavingLearnt(true);
    const { error } = await updateExerciseIsLearnt(workoutExercise.exercise_id, isLearnt);

    if (error) {
      showAlert('Error Saving', error, 'error');
      setIsSavingLearnt(false);
      return;
    }

    setIsSavingLearnt(false);
    setIsEditingLearnt(false);
    showToast('Experience level updated', 'success');

    // Update the workoutExercise object to reflect the change
    if (workoutExercise.exercise) {
      setWorkoutExercise({
        ...workoutExercise,
        exercise: { ...workoutExercise.exercise, is_mastered: isLearnt },
      });
    }
  };

  const handleCancelEditLearnt = () => {
    setIsLearnt(workoutExercise?.exercise.is_mastered || false);
    setIsEditingLearnt(false);
  };

  // Notes handlers
  const handleSaveNotes = async () => {
    if (!workoutExercise) return;

    setIsSavingNotes(true);
    const { error } = await updateExerciseNotes(workoutExercise.exercise_id, notes);

    if (error) {
      showAlert('Error Saving', error, 'error');
      setIsSavingNotes(false);
      return;
    }

    setIsSavingNotes(false);
    setIsEditingNotes(false);
    showToast('Notes saved successfully', 'success');

    // Update the workoutExercise object to reflect the change
    if (workoutExercise.exercise) {
      setWorkoutExercise({
        ...workoutExercise,
        exercise: { ...workoutExercise.exercise, notes },
      });
    }
  };

  const handleCancelEditNotes = () => {
    setNotes(workoutExercise?.exercise.notes || '');
    setIsEditingNotes(false);
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
            className='mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 active:text-blue-800 dark:active:text-blue-500 active:scale-95 transition-all cursor-pointer'>
            Back to Workout
          </Link>
        </div>
      </div>
    );
  }

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Calendar', href: '/workouts' },
    { label: 'Workout', href: `/workouts/${workoutId}` },
    { label: 'Exercise' },
  ];

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Breadcrumb */}
        {!isInProgress && <Breadcrumb items={breadcrumbItems} />}

        {/* Workout Context */}
        {workoutExercise.workout && (
          <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-blue-600 dark:text-blue-400 font-medium'>Workout</p>
                <h2 className='text-xl font-semibold text-blue-900 dark:text-blue-100'>
                  {workoutExercise.workout.name}
                </h2>
              </div>
              <div className='text-right'>
                <p className='text-sm text-blue-600 dark:text-blue-400 font-medium'>Date</p>
                <p className='text-lg text-blue-900 dark:text-blue-100'>
                  {format(new Date(workoutExercise.workout.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-3'>
                {workoutExercise.exercise.name}
              </h1>
              {/* Pattern - Always visible and prominent */}
              <div className='mb-3'>
                <span className='inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-lg font-bold'>
                  {workoutExercise.exercise.pattern}
                </span>
              </div>
              <SectionLoader
                loading={loadingBestSet}
                error={bestSetError}
                skeleton='text'
                skeletonLines={1}
                isEmpty={!bestSet}>
                {bestSet && (
                  <p className='text-lg text-gray-600 dark:text-gray-400'>
                    Best Set:{' '}
                    <span className='font-semibold'>
                      {bestSet.weight}kg × {bestSet.reps}reps
                    </span>
                  </p>
                )}
              </SectionLoader>
            </div>
            {!isInProgress && (
              <KebabMenu
                items={[
                  {
                    label: 'Remove from Workout',
                    onClick: handleDeleteClick,
                    icon: (
                      <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    ),
                    isDangerous: true,
                  },
                ]}
              />
            )}
          </div>
        </div>

        {/* Exercise Details - Collapsible */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <button
            onClick={() => setShowExerciseDetails(!showExerciseDetails)}
            className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 active:opacity-60 active:scale-[0.99] transition-all'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Exercise Details
            </h2>
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                showExerciseDetails ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>

          {showExerciseDetails && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div>
                <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Pattern</p>
                <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {workoutExercise.exercise.pattern}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Primary Body Part
                </p>
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
                <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Movement Type
                </p>
                <p className='text-lg text-gray-900 dark:text-white'>
                  {workoutExercise.exercise.movement_type}
                </p>
              </div>
            </div>
          )}
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
              <Button onClick={handleEnterInProgress} variant='primary'>
                Edit
              </Button>
            ) : (
              <div className='flex gap-2'>
                <Button onClick={handleCancelClick} variant='secondary'>
                  Cancel
                </Button>
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
                            inputMode='numeric'
                            step='0.5'
                            min='0'
                            value={set.weight ?? ''}
                            onChange={(e) => handleUpdateSet(index, 'weight', e.target.value)}
                            className='w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                            placeholder={getPlaceholder(set.set_number, 'weight')}
                          />
                        ) : (
                          <span className='text-gray-900 dark:text-white'>{set.weight ?? '-'}</span>
                        )}
                      </td>
                      <td className='py-2 px-4'>
                        {isInProgress ? (
                          <input
                            type='number'
                            inputMode='numeric'
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
            <div className='mt-4 flex flex-col md:flex-row justify-end gap-2'>
              <Button onClick={handleAddSet} variant='primary'>
                Add Set
              </Button>
              {/* {sets.length > 1 && (
                <Button onClick={handleDeleteLastSet} variant='danger'>
                  Delete Last Set
                </Button>
              )} */}
              <Button onClick={handleSave} variant='success'>
                Save Exercise
              </Button>
            </div>
          )}
        </div>

        {/* Notes Section - Editable */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Notes</h2>
            {!isEditingNotes && (
              <Button onClick={() => setIsEditingNotes(true)} variant='text' size='sm'>
                Edit
              </Button>
            )}
          </div>

          {isEditingNotes ? (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                placeholder='Add notes about equipment settings, technique tips, etc.'
              />
              <div className='flex items-center justify-end space-x-3 mt-4'>
                <Button
                  onClick={handleCancelEditNotes}
                  disabled={isSavingNotes}
                  variant='ghost'
                  size='sm'>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  variant='primary'
                  size='sm'>
                  {isSavingNotes ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-gray-900 dark:text-white whitespace-pre-wrap'>
              {notes || <p className='text-gray-500 dark:text-gray-400 italic'>No notes yet</p>}
            </div>
          )}
        </div>

        {/* Video Section */}
        {workoutExercise.exercise.video_url && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              Exercise Video
            </h2>
            <VideoThumbnail
              videoUrl={workoutExercise.exercise.video_url}
              exerciseName={workoutExercise.exercise.name}
              primaryBodyPart={workoutExercise.exercise.primary_body_part}
              size='large'
            />
          </div>
        )}

        {/* Historical Data Section - Progressive Loading */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6'>
          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 active:opacity-60 active:scale-[0.99] transition-all'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Previous Workouts
              {!loadingHistorical && (
                <span className='text-sm text-gray-500 ml-2'>({historicalData.length})</span>
              )}
            </h2>
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                showHistorical ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>

          {showHistorical && (
            <div className='mt-4'>
              <SectionLoader
                loading={loadingHistorical}
                error={historicalError}
                skeleton='table'
                skeletonLines={3}
                isEmpty={historicalData.length === 0}
                emptyMessage='No previous workout data for this exercise'>
                <div className='space-y-6'>
                  {historicalData.map((workout, workoutIndex) => {
                    // Calculate time gap since previous workout
                    let timeGapText: string | null = null;
                    if (workoutIndex > 0) {
                      const currentDate = new Date(workout.date);
                      const previousDate = new Date(historicalData[workoutIndex - 1].date);
                      const totalDays = Math.round(
                        Math.abs(
                          (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
                        )
                      );

                      if (totalDays < 7) {
                        timeGapText = `${totalDays} day${totalDays !== 1 ? 's' : ''} gap`;
                      } else {
                        const weeks = Math.floor(totalDays / 7);
                        const days = totalDays % 7;
                        if (days === 0) {
                          timeGapText = `${weeks} week${weeks !== 1 ? 's' : ''} gap`;
                        } else {
                          timeGapText = `${weeks} week${weeks !== 1 ? 's' : ''}, ${days} day${
                            days !== 1 ? 's' : ''
                          } gap`;
                        }
                      }
                    }

                    return (
                      <div key={workoutIndex}>
                        {timeGapText && (
                          <div className='text-center py-2 mb-4'>
                            <span className='text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full'>
                              {timeGapText}
                            </span>
                          </div>
                        )}
                        <div className='border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0'>
                          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-3'>
                            {format(new Date(workout.date), 'MMMM d, yyyy')}
                          </h3>
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
                                {workout.sets.map((set, setIndex) => (
                                  <tr
                                    key={setIndex}
                                    className='border-b border-gray-100 dark:border-gray-700'>
                                    <td className='py-2 px-4 text-gray-900 dark:text-white'>
                                      {set.set_number}
                                    </td>
                                    <td className='py-2 px-4 text-gray-900 dark:text-white'>
                                      {set.weight ?? '-'}
                                    </td>
                                    <td className='py-2 px-4 text-gray-900 dark:text-white'>
                                      {set.reps ?? '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionLoader>
            </div>
          )}
        </div>

        {/* Experience Level Section - Editable */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Experience Level
            </h2>
            {!isEditingLearnt && (
              <Button onClick={() => setIsEditingLearnt(true)} variant='text' size='sm'>
                Edit
              </Button>
            )}
          </div>

          {isEditingLearnt ? (
            <div>
              <select
                value={isLearnt ? 'learnt' : 'not-learnt'}
                onChange={(e) => setIsLearnt(e.target.value === 'learnt')}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'>
                <option value='not-learnt'>Not Learnt</option>
                <option value='learnt'>Learnt</option>
              </select>
              <div className='flex items-center justify-end space-x-3 mt-4'>
                <Button
                  onClick={handleCancelEditLearnt}
                  disabled={isSavingLearnt}
                  variant='ghost'
                  size='sm'>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveLearnt}
                  disabled={isSavingLearnt}
                  variant='primary'
                  size='sm'>
                  {isSavingLearnt ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex items-center'>
              {isLearnt ? (
                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                  Learnt
                </span>
              ) : (
                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'>
                  Not Learnt
                </span>
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

      {/* Save Progress Modal */}
      <SaveProgressModal
        isOpen={saveProgressModalOpen}
        isSaving={isSaving}
        onBackToWorkout={handleBackToWorkout}
        onNextExercise={nextExerciseId ? handleNextExercise : undefined}
      />
    </div>
  );
};

export default WorkoutExerciseDetailPage;
