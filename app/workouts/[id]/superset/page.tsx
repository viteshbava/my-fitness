'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  fetchWorkoutExerciseById,
  updateWorkoutExerciseSets,
  saveWorkoutExerciseSets,
  saveDraftSnapshot,
  clearDraftSnapshot,
  restoreFromDraftSnapshot,
  fetchMostRecentWorkoutWithData,
  fetchBestSetForExercise,
  getNextWorkoutExercise,
} from '@/actions/workout-exercises';
import { WorkoutExerciseWithExercise, Set } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import SaveProgressModal from '@/components/SaveProgressModal';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import { addNewSet, removeEmptySets } from '@/lib/controllers/workout-exercise-controller';
import VideoThumbnail from '@/components/VideoThumbnail';
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb';
import SetsTable from '@/components/SetsTable';
import ExerciseDetailsCollapsible from '@/components/ExerciseDetailsCollapsible';
import WorkoutContextBox from '@/components/WorkoutContextBox';
import ExerciseHeader from '@/components/ExerciseHeader';
import ExerciseNotesEditor from '@/components/ExerciseNotesEditor';

const SupersetPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = params.id as string;
  const exerciseId1 = searchParams.get('ex1');
  const exerciseId2 = searchParams.get('ex2');
  const { showToast } = useToast();

  // Exercise 1 state
  const [workoutExercise1, setWorkoutExercise1] = useState<WorkoutExerciseWithExercise | null>(null);
  const [sets1, setSets1] = useState<Set[]>([]);
  const [previousSets1, setPreviousSets1] = useState<Set[]>([]);
  const [bestSet1, setBestSet1] = useState<Set | null>(null);
  const [loadingBestSet1, setLoadingBestSet1] = useState(false);

  // Exercise 2 state
  const [workoutExercise2, setWorkoutExercise2] = useState<WorkoutExerciseWithExercise | null>(null);
  const [sets2, setSets2] = useState<Set[]>([]);
  const [previousSets2, setPreviousSets2] = useState<Set[]>([]);
  const [bestSet2, setBestSet2] = useState<Set | null>(null);
  const [loadingBestSet2, setLoadingBestSet2] = useState(false);

  // Shared state
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
    if (!exerciseId1 || !exerciseId2) {
      showAlert('Error', 'Invalid superset parameters', 'error');
      return;
    }
    loadBothExercises();
  }, [exerciseId1, exerciseId2]);

  // Clear draft snapshots on component mount (browser refresh scenario)
  useEffect(() => {
    const clearDraftsOnMount = async () => {
      if (exerciseId1 && exerciseId2) {
        await Promise.all([
          clearDraftSnapshot(exerciseId1),
          clearDraftSnapshot(exerciseId2),
        ]);
      }
    };
    clearDraftsOnMount();
  }, [exerciseId1, exerciseId2]);

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

  const loadBothExercises = async (showLoadingScreen: boolean = true) => {
    if (!exerciseId1 || !exerciseId2) return;

    if (showLoadingScreen) {
      setLoading(true);
    }

    // Load both exercises in parallel
    const [result1, result2] = await Promise.all([
      fetchWorkoutExerciseById(exerciseId1),
      fetchWorkoutExerciseById(exerciseId2),
    ]);

    if (result1.error || result2.error) {
      showAlert('Error Loading Exercises', result1.error || result2.error || 'Unknown error', 'error');
      setLoading(false);
      return;
    }

    if (result1.data && result2.data) {
      setWorkoutExercise1(result1.data);
      setSets1(result1.data.sets || []);

      setWorkoutExercise2(result2.data);
      setSets2(result2.data.sets || []);

      if (showLoadingScreen) {
        setLoading(false);
      }

      // Load progressive data for both exercises
      loadProgressiveData(result1.data.exercise_id, result2.data.exercise_id);
    } else {
      setLoading(false);
    }
  };

  const loadProgressiveData = async (exId1: string, exId2: string) => {
    // Load all data in parallel
    Promise.all([
      loadPreviousSets(exId1, 1),
      loadPreviousSets(exId2, 2),
      loadBestSet(exId1, 1),
      loadBestSet(exId2, 2),
    ]);
  };

  const loadPreviousSets = async (exerciseId: string, exerciseNum: 1 | 2) => {
    const { data: previousData } = await fetchMostRecentWorkoutWithData(exerciseId, workoutId);

    if (previousData) {
      if (exerciseNum === 1) {
        setPreviousSets1(previousData);
      } else {
        setPreviousSets2(previousData);
      }
    }
  };

  const loadBestSet = async (exerciseId: string, exerciseNum: 1 | 2) => {
    if (exerciseNum === 1) {
      setLoadingBestSet1(true);
    } else {
      setLoadingBestSet2(true);
    }

    const { data: bestSetData } = await fetchBestSetForExercise(exerciseId);

    if (exerciseNum === 1) {
      setBestSet1(bestSetData);
      setLoadingBestSet1(false);
    } else {
      setBestSet2(bestSetData);
      setLoadingBestSet2(false);
    }
  };

  // Helper function to check if a set is complete
  const isSetComplete = (set: Set): boolean => {
    const hasWeight = set.weight !== null && set.weight !== undefined;
    const hasReps = set.reps !== null && set.reps !== undefined;
    return (hasWeight && hasReps) || (!hasWeight && !hasReps);
  };

  // Auto-save function with debouncing
  const autoSave = useCallback(
    async (updatedSets1: Set[], updatedSets2: Set[]) => {
      if (!isInProgress || !exerciseId1 || !exerciseId2) return;

      const completeSets1 = updatedSets1.filter(isSetComplete);
      const completeSets2 = updatedSets2.filter(isSetComplete);

      setAutoSaving(true);
      await Promise.all([
        updateWorkoutExerciseSets(exerciseId1, completeSets1),
        updateWorkoutExerciseSets(exerciseId2, completeSets2),
      ]);
      setAutoSaving(false);
    },
    [isInProgress, exerciseId1, exerciseId2]
  );

  // Debounced auto-save
  useEffect(() => {
    if (!isInProgress) return;

    const timeoutId = setTimeout(() => {
      autoSave(sets1, sets2);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [sets1, sets2, isInProgress, autoSave]);

  const handleEnterInProgress = async () => {
    if (!exerciseId1 || !exerciseId2) return;

    // Save draft snapshots for both exercises
    const [result1, result2] = await Promise.all([
      saveDraftSnapshot(exerciseId1, sets1),
      saveDraftSnapshot(exerciseId2, sets2),
    ]);

    if (result1.error || result2.error) {
      showAlert('Error', 'Failed to enter edit mode', 'error');
      return;
    }

    setIsInProgress(true);
  };

  const handleSave = async () => {
    if (!exerciseId1 || !exerciseId2 || !workoutExercise1 || !workoutExercise2) return;

    // Check for incomplete sets in both exercises
    const incompleteSets1 = sets1.filter((set) => !isSetComplete(set));
    const incompleteSets2 = sets2.filter((set) => !isSetComplete(set));

    if (incompleteSets1.length > 0 || incompleteSets2.length > 0) {
      const exerciseName = incompleteSets1.length > 0
        ? workoutExercise1.exercise.name
        : workoutExercise2.exercise.name;
      showAlert(
        'Incomplete Sets',
        `Some sets in "${exerciseName}" have only weight or reps filled in. Please complete both fields or leave both empty.`,
        'error'
      );
      return;
    }

    // Show modal and start saving
    setSaveProgressModalOpen(true);
    setIsSaving(true);

    // Remove empty sets before final save
    const cleanedSets1 = removeEmptySets(sets1);
    const cleanedSets2 = removeEmptySets(sets2);

    // Save both exercises
    const [saveResult1, saveResult2] = await Promise.all([
      saveWorkoutExerciseSets(exerciseId1, cleanedSets1),
      saveWorkoutExerciseSets(exerciseId2, cleanedSets2),
    ]);

    if (saveResult1.error || saveResult2.error) {
      setSaveProgressModalOpen(false);
      setIsSaving(false);
      showAlert('Error Saving', saveResult1.error || saveResult2.error || 'Unknown error', 'error');
      return;
    }

    // Clear draft snapshots for both
    await Promise.all([
      clearDraftSnapshot(exerciseId1),
      clearDraftSnapshot(exerciseId2),
    ]);

    // Check if there's a next exercise (after the second exercise in superset)
    const { data: nextExercise } = await getNextWorkoutExercise(workoutId, exerciseId2);
    setNextExerciseId(nextExercise?.id || null);

    // Update state
    setSets1(cleanedSets1);
    setSets2(cleanedSets2);
    setIsInProgress(false);

    // Reload to get fresh data
    await loadBothExercises(false);

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

  const confirmCancel = async () => {
    if (!exerciseId1 || !exerciseId2) return;

    // Restore from draft snapshots for both
    const [result1, result2] = await Promise.all([
      restoreFromDraftSnapshot(exerciseId1),
      restoreFromDraftSnapshot(exerciseId2),
    ]);

    if (result1.error || result2.error) {
      showAlert('Error', 'Failed to restore previous state', 'error');
      setCancelModalOpen(false);
      return;
    }

    setCancelModalOpen(false);
    setIsInProgress(false);
    showToast('Changes cancelled', 'info');

    // Reload to get restored data
    await loadBothExercises();
  };

  const handleUpdateSet = (exerciseNum: 1 | 2, index: number, field: 'weight' | 'reps', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);

    if (exerciseNum === 1) {
      const updatedSets = [...sets1];
      if (field === 'weight') {
        updatedSets[index].weight = numValue;
      } else {
        updatedSets[index].reps = numValue !== null ? Math.floor(numValue) : null;
      }
      setSets1(updatedSets);
    } else {
      const updatedSets = [...sets2];
      if (field === 'weight') {
        updatedSets[index].weight = numValue;
      } else {
        updatedSets[index].reps = numValue !== null ? Math.floor(numValue) : null;
      }
      setSets2(updatedSets);
    }
  };

  const handleAddSet = (exerciseNum: 1 | 2) => {
    if (exerciseNum === 1) {
      setSets1(addNewSet(sets1));
    } else {
      setSets2(addNewSet(sets2));
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading superset...</p>
        </div>
      </div>
    );
  }

  if (!workoutExercise1 || !workoutExercise2) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 dark:text-gray-400'>Exercises not found</p>
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
    { label: 'Superset' },
  ];

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Breadcrumb */}
        {!isInProgress && <Breadcrumb items={breadcrumbItems} />}

        {/* Workout Context */}
        {workoutExercise1.workout && (
          <WorkoutContextBox
            workoutName={workoutExercise1.workout.name}
            workoutDate={workoutExercise1.workout.date}
          />
        )}

        {/* Page Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Superset</h1>
        </div>

        {/* Exercise 1 Section */}
        <div className='mb-8'>
          <ExerciseHeader
            exercise={workoutExercise1.exercise}
            bestSet={bestSet1}
            loadingBestSet={loadingBestSet1}
            headingLevel='h2'
          />
          <div className='mt-4'>
            <ExerciseDetailsCollapsible exercise={workoutExercise1.exercise} />
          </div>
        </div>

        {/* Exercise 2 Section */}
        <div className='mb-8'>
          <ExerciseHeader
            exercise={workoutExercise2.exercise}
            bestSet={bestSet2}
            loadingBestSet={loadingBestSet2}
            headingLevel='h2'
          />
          <div className='mt-4'>
            <ExerciseDetailsCollapsible exercise={workoutExercise2.exercise} />
          </div>
        </div>

        {/* Combined Sets Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <div className='flex items-center justify-between mb-6'>
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
              <Button onClick={handleCancelClick} variant='secondary'>
                Cancel
              </Button>
            )}
          </div>

          {/* Exercise 1 Sets Table */}
          <SetsTable
            sets={sets1}
            isEditing={isInProgress}
            previousSets={previousSets1}
            exerciseName={workoutExercise1.exercise.name}
            onUpdateSet={(index, field, value) => handleUpdateSet(1, index, field, value)}
            onAddSet={() => handleAddSet(1)}
          />

          {/* Divider */}
          <div className='border-t border-gray-200 dark:border-gray-700 my-6'></div>

          {/* Exercise 2 Sets Table */}
          <SetsTable
            sets={sets2}
            isEditing={isInProgress}
            previousSets={previousSets2}
            exerciseName={workoutExercise2.exercise.name}
            onUpdateSet={(index, field, value) => handleUpdateSet(2, index, field, value)}
            onAddSet={() => handleAddSet(2)}
          />

          {/* Save Button */}
          {isInProgress && (
            <div className='mt-6 flex justify-end'>
              <Button onClick={handleSave} variant='success'>
                Save Exercise
              </Button>
            </div>
          )}
        </div>

        {/* Notes Section for Exercise 1 */}
        <div className='mb-6'>
          <ExerciseNotesEditor
            exerciseId={workoutExercise1.exercise_id}
            exerciseName={workoutExercise1.exercise.name}
            initialNotes={workoutExercise1.exercise.notes || ''}
            onNotesUpdated={(notes) => {
              setWorkoutExercise1({
                ...workoutExercise1,
                exercise: { ...workoutExercise1.exercise, notes },
              });
            }}
            showAlert={showAlert}
          />
        </div>

        {/* Notes Section for Exercise 2 */}
        <div className='mb-6'>
          <ExerciseNotesEditor
            exerciseId={workoutExercise2.exercise_id}
            exerciseName={workoutExercise2.exercise.name}
            initialNotes={workoutExercise2.exercise.notes || ''}
            onNotesUpdated={(notes) => {
              setWorkoutExercise2({
                ...workoutExercise2,
                exercise: { ...workoutExercise2.exercise, notes },
              });
            }}
            showAlert={showAlert}
          />
        </div>

        {/* Video Section for Exercise 1 */}
        {workoutExercise1.exercise.video_url && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              Video - {workoutExercise1.exercise.name}
            </h2>
            <VideoThumbnail
              videoUrl={workoutExercise1.exercise.video_url}
              exerciseName={workoutExercise1.exercise.name}
              primaryBodyPart={workoutExercise1.exercise.primary_body_part}
              size='large'
            />
          </div>
        )}

        {/* Video Section for Exercise 2 */}
        {workoutExercise2.exercise.video_url && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              Video - {workoutExercise2.exercise.name}
            </h2>
            <VideoThumbnail
              videoUrl={workoutExercise2.exercise.video_url}
              exerciseName={workoutExercise2.exercise.name}
              primaryBodyPart={workoutExercise2.exercise.primary_body_part}
              size='large'
            />
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

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title='Cancel Changes'
        message='Are you sure you want to cancel? All unsaved changes for both exercises will be lost.'
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

export default SupersetPage;
