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
  fetchHistoricalWorkoutExercises,
} from '@/actions/workout-exercises';
import { updateExerciseNotes, updateExerciseIsLearnt } from '@/actions/exercises';
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
import SectionLoader from '@/components/SectionLoader';
import ProgressChart from '@/components/ProgressChart';
import { format } from 'date-fns';

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
  const [historicalData1, setHistoricalData1] = useState<Array<{ date: string; sets: Set[] }>>([]);
  const [loadingHistorical1, setLoadingHistorical1] = useState(false);
  const [historicalLoaded1, setHistoricalLoaded1] = useState(false);
  const [notes1, setNotes1] = useState('');
  const [isLearnt1, setIsLearnt1] = useState(false);
  const [isEditingNotes1, setIsEditingNotes1] = useState(false);
  const [isSavingNotes1, setIsSavingNotes1] = useState(false);
  const [isEditingLearnt1, setIsEditingLearnt1] = useState(false);
  const [isSavingLearnt1, setIsSavingLearnt1] = useState(false);
  const [showDetails1, setShowDetails1] = useState(false);
  const [showProgressChart1, setShowProgressChart1] = useState(false);
  const [showHistorical1, setShowHistorical1] = useState(false);

  // Exercise 2 state
  const [workoutExercise2, setWorkoutExercise2] = useState<WorkoutExerciseWithExercise | null>(null);
  const [sets2, setSets2] = useState<Set[]>([]);
  const [previousSets2, setPreviousSets2] = useState<Set[]>([]);
  const [bestSet2, setBestSet2] = useState<Set | null>(null);
  const [loadingBestSet2, setLoadingBestSet2] = useState(false);
  const [historicalData2, setHistoricalData2] = useState<Array<{ date: string; sets: Set[] }>>([]);
  const [loadingHistorical2, setLoadingHistorical2] = useState(false);
  const [historicalLoaded2, setHistoricalLoaded2] = useState(false);
  const [notes2, setNotes2] = useState('');
  const [isLearnt2, setIsLearnt2] = useState(false);
  const [isEditingNotes2, setIsEditingNotes2] = useState(false);
  const [isSavingNotes2, setIsSavingNotes2] = useState(false);
  const [isEditingLearnt2, setIsEditingLearnt2] = useState(false);
  const [isSavingLearnt2, setIsSavingLearnt2] = useState(false);
  const [showDetails2, setShowDetails2] = useState(false);
  const [showProgressChart2, setShowProgressChart2] = useState(false);
  const [showHistorical2, setShowHistorical2] = useState(false);

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

  // Progressive load historical data when details section is opened
  useEffect(() => {
    if (showDetails1 && !historicalLoaded1 && workoutExercise1) {
      loadHistoricalData(workoutExercise1.exercise_id, 1);
    }
  }, [showDetails1, historicalLoaded1, workoutExercise1]);

  useEffect(() => {
    if (showDetails2 && !historicalLoaded2 && workoutExercise2) {
      loadHistoricalData(workoutExercise2.exercise_id, 2);
    }
  }, [showDetails2, historicalLoaded2, workoutExercise2]);

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
      setNotes1(result1.data.exercise.notes || '');
      setIsLearnt1(result1.data.exercise.is_mastered || false);

      setWorkoutExercise2(result2.data);
      setSets2(result2.data.sets || []);
      setNotes2(result2.data.exercise.notes || '');
      setIsLearnt2(result2.data.exercise.is_mastered || false);

      if (showLoadingScreen) {
        setLoading(false);
      }

      // Load progressive data for both exercises (only best sets and previous sets initially)
      loadProgressiveData(result1.data.exercise_id, result2.data.exercise_id);
    } else {
      setLoading(false);
    }
  };

  const loadProgressiveData = async (exId1: string, exId2: string) => {
    // Load only essential data initially (best sets and previous sets for placeholders)
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

  const loadHistoricalData = async (exerciseId: string, exerciseNum: 1 | 2) => {
    if (exerciseNum === 1) {
      setLoadingHistorical1(true);
    } else {
      setLoadingHistorical2(true);
    }

    const { data: historicalWorkouts } = await fetchHistoricalWorkoutExercises(exerciseId, workoutId, 3);

    if (exerciseNum === 1) {
      setHistoricalData1(historicalWorkouts || []);
      setLoadingHistorical1(false);
      setHistoricalLoaded1(true);
    } else {
      setHistoricalData2(historicalWorkouts || []);
      setLoadingHistorical2(false);
      setHistoricalLoaded2(true);
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

  // Notes handlers
  const handleSaveNotes = async (exerciseNum: 1 | 2) => {
    const workoutExercise = exerciseNum === 1 ? workoutExercise1 : workoutExercise2;
    const notes = exerciseNum === 1 ? notes1 : notes2;
    const setIsSaving = exerciseNum === 1 ? setIsSavingNotes1 : setIsSavingNotes2;
    const setIsEditing = exerciseNum === 1 ? setIsEditingNotes1 : setIsEditingNotes2;
    const setWorkoutExercise = exerciseNum === 1 ? setWorkoutExercise1 : setWorkoutExercise2;

    if (!workoutExercise) return;

    setIsSaving(true);
    const { error } = await updateExerciseNotes(workoutExercise.exercise_id, notes);

    if (error) {
      showAlert('Error Saving', error, 'error');
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsEditing(false);
    showToast('Notes saved successfully', 'success');

    setWorkoutExercise({
      ...workoutExercise,
      exercise: { ...workoutExercise.exercise, notes },
    });
  };

  const handleCancelEditNotes = (exerciseNum: 1 | 2) => {
    if (exerciseNum === 1) {
      setNotes1(workoutExercise1?.exercise.notes || '');
      setIsEditingNotes1(false);
    } else {
      setNotes2(workoutExercise2?.exercise.notes || '');
      setIsEditingNotes2(false);
    }
  };

  // Experience Level handlers
  const handleSaveLearnt = async (exerciseNum: 1 | 2) => {
    const workoutExercise = exerciseNum === 1 ? workoutExercise1 : workoutExercise2;
    const isLearnt = exerciseNum === 1 ? isLearnt1 : isLearnt2;
    const setIsSaving = exerciseNum === 1 ? setIsSavingLearnt1 : setIsSavingLearnt2;
    const setIsEditing = exerciseNum === 1 ? setIsEditingLearnt1 : setIsEditingLearnt2;
    const setWorkoutExercise = exerciseNum === 1 ? setWorkoutExercise1 : setWorkoutExercise2;

    if (!workoutExercise) return;

    setIsSaving(true);
    const { error } = await updateExerciseIsLearnt(workoutExercise.exercise_id, isLearnt);

    if (error) {
      showAlert('Error Saving', error, 'error');
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsEditing(false);
    showToast('Experience level updated', 'success');

    setWorkoutExercise({
      ...workoutExercise,
      exercise: { ...workoutExercise.exercise, is_mastered: isLearnt },
    });
  };

  const handleCancelEditLearnt = (exerciseNum: 1 | 2) => {
    if (exerciseNum === 1) {
      setIsLearnt1(workoutExercise1?.exercise.is_mastered || false);
      setIsEditingLearnt1(false);
    } else {
      setIsLearnt2(workoutExercise2?.exercise.is_mastered || false);
      setIsEditingLearnt2(false);
    }
  };

  // Render historical workouts section
  const renderHistoricalWorkouts = (historicalData: Array<{ date: string; sets: Set[] }>) => {
    return (
      <div className='space-y-6'>
        {historicalData.map((workout, workoutIndex) => {
          let timeGapText: string | null = null;
          if (workoutIndex > 0) {
            const currentDate = new Date(workout.date);
            const previousDate = new Date(historicalData[workoutIndex - 1].date);
            const totalDays = Math.round(
              Math.abs((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
            );

            if (totalDays < 7) {
              timeGapText = `${totalDays} day${totalDays !== 1 ? 's' : ''} gap`;
            } else {
              const weeks = Math.floor(totalDays / 7);
              const days = totalDays % 7;
              if (days === 0) {
                timeGapText = `${weeks} week${weeks !== 1 ? 's' : ''} gap`;
              } else {
                timeGapText = `${weeks} week${weeks !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''} gap`;
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
                        <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>Set</th>
                        <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>Weight (kg)</th>
                        <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>Reps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workout.sets.map((set, setIndex) => (
                        <tr key={setIndex} className='border-b border-gray-100 dark:border-gray-700'>
                          <td className='py-2 px-4 text-gray-900 dark:text-white'>{set.set_number}</td>
                          <td className='py-2 px-4 text-gray-900 dark:text-white'>{set.weight ?? '-'}</td>
                          <td className='py-2 px-4 text-gray-900 dark:text-white'>{set.reps ?? '-'}</td>
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
    );
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
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Superset</h1>
        </div>

        {/* Condensed Exercise Summary Table */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 dark:border-gray-700'>
                  <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>Exercise</th>
                  <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>Pattern</th>
                  <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>Best Set</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-gray-100 dark:border-gray-700'>
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-gray-900 dark:text-white'>
                        {workoutExercise1.exercise.name}
                      </span>
                      <Link
                        href={`/exercises/${workoutExercise1.exercise_id}`}
                        className='p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer transition-colors'
                        title='View exercise details'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                        </svg>
                      </Link>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <span className='inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-semibold'>
                      {workoutExercise1.exercise.pattern}
                    </span>
                  </td>
                  <td className='py-3 px-4 text-gray-900 dark:text-white'>
                    {loadingBestSet1 ? (
                      <span className='text-gray-400'>Loading...</span>
                    ) : bestSet1 ? (
                      <span className='font-semibold'>{bestSet1.weight}kg × {bestSet1.reps}reps</span>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-gray-900 dark:text-white'>
                        {workoutExercise2.exercise.name}
                      </span>
                      <Link
                        href={`/exercises/${workoutExercise2.exercise_id}`}
                        className='p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer transition-colors'
                        title='View exercise details'>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                        </svg>
                      </Link>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <span className='inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-semibold'>
                      {workoutExercise2.exercise.pattern}
                    </span>
                  </td>
                  <td className='py-3 px-4 text-gray-900 dark:text-white'>
                    {loadingBestSet2 ? (
                      <span className='text-gray-400'>Loading...</span>
                    ) : bestSet2 ? (
                      <span className='font-semibold'>{bestSet2.weight}kg × {bestSet2.reps}reps</span>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
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

        {/* Exercise 1 Details Section - Collapsible */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow mb-6'>
          <button
            onClick={() => setShowDetails1(!showDetails1)}
            className='w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {workoutExercise1.exercise.name}
            </h2>
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showDetails1 ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>

          {showDetails1 && (
            <div className='px-6 pb-6 space-y-6'>
              {/* Exercise Details */}
              <ExerciseDetailsCollapsible exercise={workoutExercise1.exercise} />

              {/* Notes */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Notes</h3>
                  {!isEditingNotes1 && (
                    <Button onClick={() => setIsEditingNotes1(true)} variant='text' size='sm'>
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingNotes1 ? (
                  <div>
                    <textarea
                      value={notes1}
                      onChange={(e) => setNotes1(e.target.value)}
                      rows={4}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                      placeholder='Add notes about equipment settings, technique tips, etc.'
                    />
                    <div className='flex items-center justify-end space-x-3 mt-4'>
                      <Button onClick={() => handleCancelEditNotes(1)} disabled={isSavingNotes1} variant='ghost' size='sm'>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveNotes(1)} disabled={isSavingNotes1} variant='primary' size='sm'>
                        {isSavingNotes1 ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='text-gray-900 dark:text-white whitespace-pre-wrap'>
                    {notes1 || <p className='text-gray-500 dark:text-gray-400 italic'>No notes yet</p>}
                  </div>
                )}
              </div>

              {/* Video */}
              {workoutExercise1.exercise.video_url && (
                <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Video</h3>
                  <VideoThumbnail
                    videoUrl={workoutExercise1.exercise.video_url}
                    exerciseName={workoutExercise1.exercise.name}
                    primaryBodyPart={workoutExercise1.exercise.primary_body_part}
                    size='large'
                  />
                </div>
              )}

              {/* Progress Chart */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <button
                  onClick={() => setShowProgressChart1(!showProgressChart1)}
                  className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 transition-opacity'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Progress Chart</h3>
                  <svg
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showProgressChart1 ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
                {showProgressChart1 && (
                  <div className='mt-4'>
                    <SectionLoader
                      loading={loadingHistorical1}
                      skeleton='chart'
                      isEmpty={historicalData1.length === 0}
                      emptyMessage='No workout history for this exercise yet'>
                      <ProgressChart historicalData={historicalData1} />
                    </SectionLoader>
                  </div>
                )}
              </div>

              {/* Previous Workouts */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <button
                  onClick={() => setShowHistorical1(!showHistorical1)}
                  className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 transition-opacity'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Previous Workouts
                    {!loadingHistorical1 && <span className='text-sm text-gray-500 ml-2'>({historicalData1.length})</span>}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showHistorical1 ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
                {showHistorical1 && (
                  <div className='mt-4'>
                    <SectionLoader
                      loading={loadingHistorical1}
                      skeleton='table'
                      skeletonLines={3}
                      isEmpty={historicalData1.length === 0}
                      emptyMessage='No previous workout data for this exercise'>
                      {renderHistoricalWorkouts(historicalData1)}
                    </SectionLoader>
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Experience Level</h3>
                  {!isEditingLearnt1 && (
                    <Button onClick={() => setIsEditingLearnt1(true)} variant='text' size='sm'>
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingLearnt1 ? (
                  <div>
                    <select
                      value={isLearnt1 ? 'learnt' : 'not-learnt'}
                      onChange={(e) => setIsLearnt1(e.target.value === 'learnt')}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'>
                      <option value='not-learnt'>Not Learnt</option>
                      <option value='learnt'>Learnt</option>
                    </select>
                    <div className='flex items-center justify-end space-x-3 mt-4'>
                      <Button onClick={() => handleCancelEditLearnt(1)} disabled={isSavingLearnt1} variant='ghost' size='sm'>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveLearnt(1)} disabled={isSavingLearnt1} variant='primary' size='sm'>
                        {isSavingLearnt1 ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center'>
                    {isLearnt1 ? (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                        Learnt
                      </span>
                    ) : (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'>
                        Not Learnt
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Exercise 2 Details Section - Collapsible */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow mb-6'>
          <button
            onClick={() => setShowDetails2(!showDetails2)}
            className='w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {workoutExercise2.exercise.name}
            </h2>
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showDetails2 ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>

          {showDetails2 && (
            <div className='px-6 pb-6 space-y-6'>
              {/* Exercise Details */}
              <ExerciseDetailsCollapsible exercise={workoutExercise2.exercise} />

              {/* Notes */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Notes</h3>
                  {!isEditingNotes2 && (
                    <Button onClick={() => setIsEditingNotes2(true)} variant='text' size='sm'>
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingNotes2 ? (
                  <div>
                    <textarea
                      value={notes2}
                      onChange={(e) => setNotes2(e.target.value)}
                      rows={4}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                      placeholder='Add notes about equipment settings, technique tips, etc.'
                    />
                    <div className='flex items-center justify-end space-x-3 mt-4'>
                      <Button onClick={() => handleCancelEditNotes(2)} disabled={isSavingNotes2} variant='ghost' size='sm'>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveNotes(2)} disabled={isSavingNotes2} variant='primary' size='sm'>
                        {isSavingNotes2 ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='text-gray-900 dark:text-white whitespace-pre-wrap'>
                    {notes2 || <p className='text-gray-500 dark:text-gray-400 italic'>No notes yet</p>}
                  </div>
                )}
              </div>

              {/* Video */}
              {workoutExercise2.exercise.video_url && (
                <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Video</h3>
                  <VideoThumbnail
                    videoUrl={workoutExercise2.exercise.video_url}
                    exerciseName={workoutExercise2.exercise.name}
                    primaryBodyPart={workoutExercise2.exercise.primary_body_part}
                    size='large'
                  />
                </div>
              )}

              {/* Progress Chart */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <button
                  onClick={() => setShowProgressChart2(!showProgressChart2)}
                  className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 transition-opacity'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Progress Chart</h3>
                  <svg
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showProgressChart2 ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
                {showProgressChart2 && (
                  <div className='mt-4'>
                    <SectionLoader
                      loading={loadingHistorical2}
                      skeleton='chart'
                      isEmpty={historicalData2.length === 0}
                      emptyMessage='No workout history for this exercise yet'>
                      <ProgressChart historicalData={historicalData2} />
                    </SectionLoader>
                  </div>
                )}
              </div>

              {/* Previous Workouts */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <button
                  onClick={() => setShowHistorical2(!showHistorical2)}
                  className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 transition-opacity'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    Previous Workouts
                    {!loadingHistorical2 && <span className='text-sm text-gray-500 ml-2'>({historicalData2.length})</span>}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showHistorical2 ? 'rotate-180' : ''}`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
                {showHistorical2 && (
                  <div className='mt-4'>
                    <SectionLoader
                      loading={loadingHistorical2}
                      skeleton='table'
                      skeletonLines={3}
                      isEmpty={historicalData2.length === 0}
                      emptyMessage='No previous workout data for this exercise'>
                      {renderHistoricalWorkouts(historicalData2)}
                    </SectionLoader>
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Experience Level</h3>
                  {!isEditingLearnt2 && (
                    <Button onClick={() => setIsEditingLearnt2(true)} variant='text' size='sm'>
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingLearnt2 ? (
                  <div>
                    <select
                      value={isLearnt2 ? 'learnt' : 'not-learnt'}
                      onChange={(e) => setIsLearnt2(e.target.value === 'learnt')}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'>
                      <option value='not-learnt'>Not Learnt</option>
                      <option value='learnt'>Learnt</option>
                    </select>
                    <div className='flex items-center justify-end space-x-3 mt-4'>
                      <Button onClick={() => handleCancelEditLearnt(2)} disabled={isSavingLearnt2} variant='ghost' size='sm'>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveLearnt(2)} disabled={isSavingLearnt2} variant='primary' size='sm'>
                        {isSavingLearnt2 ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex items-center'>
                    {isLearnt2 ? (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                        Learnt
                      </span>
                    ) : (
                      <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'>
                        Not Learnt
                      </span>
                    )}
                  </div>
                )}
              </div>
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
