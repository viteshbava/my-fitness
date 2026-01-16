'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchExerciseById,
  fetchExercises,
  updateExerciseNotes,
  updateExerciseIsLearnt,
  fetchExerciseHistoricalData,
  hasExerciseBeenDone,
  checkExerciseUsage,
  deleteExercise,
} from '@/actions/exercises';
import { fetchBestSetForExercise } from '@/actions/workout-exercises';
import { Exercise, Set } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';
import ProgressChart from '@/components/ProgressChart';
import VideoThumbnail from '@/components/VideoThumbnail';
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb';
import SectionLoader from '@/components/SectionLoader';
import AddToTemplateModal from '@/components/AddToTemplateModal';
import ExerciseFormModal from '@/components/ExerciseFormModal';
import ExerciseUsageSection from '@/components/ExerciseUsageSection';
import ConfirmationModal from '@/components/ConfirmationModal';

interface ExerciseDetailViewProps {
  exerciseId: string;
  breadcrumbItems: BreadcrumbItem[];
  showAddToTemplate?: boolean;
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  exerciseId,
  breadcrumbItems,
  showAddToTemplate = false,
}) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [historicalData, setHistoricalData] = useState<Array<{ date: string; sets: Set[] }>>([]);
  const [bestSet, setBestSet] = useState<Set | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingBestSet, setLoadingBestSet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalError, setHistoricalError] = useState<string | null>(null);
  const [bestSetError, setBestSetError] = useState<string | null>(null);
  const [showHistorical, setShowHistorical] = useState(false);

  // Track if exercise has been done (has valid workout sets)
  const [exerciseHasBeenDone, setExerciseHasBeenDone] = useState<boolean | null>(null);
  const [loadingHasBeenDone, setLoadingHasBeenDone] = useState(false);

  // Notes editing state
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Experience Level editing state
  const [isLearnt, setIsLearnt] = useState(false);
  const [isEditingLearnt, setIsEditingLearnt] = useState(false);
  const [isSavingLearnt, setIsSavingLearnt] = useState(false);

  // Add to Template modal state
  const [addToTemplateModalOpen, setAddToTemplateModalOpen] = useState(false);

  // Edit exercise modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    loadExerciseBasicInfo();
  }, [exerciseId]);

  /**
   * Phase 1: Load only basic exercise info to show the page quickly
   */
  const loadExerciseBasicInfo = async () => {
    setLoading(true);
    const { data, error } = await fetchExerciseById(exerciseId);

    if (error) {
      setError(error);
      showAlert('Error Loading Exercise', error, 'error');
      setLoading(false);
      return;
    }

    if (!data) {
      setError('Exercise not found');
      showAlert('Not Found', 'Exercise not found', 'error');
      setLoading(false);
      return;
    }

    setExercise(data);
    setNotes(data.notes || '');
    setIsLearnt(data.is_mastered || false);
    setLoading(false);

    // Phase 2: Load non-critical data in background (parallel)
    loadProgressiveData(data.id);
  };

  /**
   * Phase 2: Load historical and best set data progressively in parallel
   */
  const loadProgressiveData = async (exerciseId: string) => {
    // Load all in parallel for better performance
    Promise.all([
      loadHistoricalData(exerciseId),
      loadBestSet(exerciseId),
      loadHasBeenDone(exerciseId)
    ]);
  };

  const loadHasBeenDone = async (exerciseId: string) => {
    setLoadingHasBeenDone(true);

    const { data: hasBeenDone, error } = await hasExerciseBeenDone(exerciseId);

    if (!error) {
      setExerciseHasBeenDone(hasBeenDone);
    }

    setLoadingHasBeenDone(false);
  };

  const loadHistoricalData = async (exerciseId: string) => {
    setLoadingHistorical(true);
    setHistoricalError(null);

    const { data: historical, error } = await fetchExerciseHistoricalData(exerciseId);

    if (error) {
      setHistoricalError(error);
    } else if (historical) {
      setHistoricalData(historical);
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

  const handleSaveNotes = async () => {
    if (!exercise) return;

    setIsSavingNotes(true);
    const { data, error } = await updateExerciseNotes(exercise.id, notes);

    if (error) {
      showAlert('Error Saving Notes', error, 'error');
      setIsSavingNotes(false);
      return;
    }

    if (data) {
      setExercise(data);
      showToast('Notes saved successfully', 'success');
    }

    setIsEditingNotes(false);
    setIsSavingNotes(false);
  };

  const handleCancelEditNotes = () => {
    setNotes(exercise?.notes || '');
    setIsEditingNotes(false);
  };

  const handleSaveLearnt = async () => {
    if (!exercise) return;

    setIsSavingLearnt(true);
    const { data, error } = await updateExerciseIsLearnt(exercise.id, isLearnt);

    if (error) {
      showAlert('Error Saving Experience Level', error, 'error');
      setIsSavingLearnt(false);
      return;
    }

    if (data) {
      setExercise(data);
      showToast('Experience level updated successfully', 'success');
    }

    setIsEditingLearnt(false);
    setIsSavingLearnt(false);
  };

  const handleCancelEditLearnt = () => {
    setIsLearnt(exercise?.is_mastered || false);
    setIsEditingLearnt(false);
  };

  const handleEditSuccess = (updatedExercise: Exercise) => {
    setExercise(updatedExercise);
    setNotes(updatedExercise.notes || '');
    setIsLearnt(updatedExercise.is_mastered || false);
  };

  const handleDeleteClick = async () => {
    if (!exercise) return;

    // Check if exercise is used before showing delete confirmation
    const { data: usage, error } = await checkExerciseUsage(exercise.id);

    if (error) {
      showAlert('Error', `Failed to check exercise usage: ${error}`, 'error');
      return;
    }

    if (usage?.isUsed) {
      const parts = [];
      if (usage.workoutCount > 0) {
        parts.push(`${usage.workoutCount} workout${usage.workoutCount > 1 ? 's' : ''}`);
      }
      if (usage.templateCount > 0) {
        parts.push(`${usage.templateCount} template${usage.templateCount > 1 ? 's' : ''}`);
      }
      showAlert(
        'Cannot Delete Exercise',
        `This exercise is used in ${parts.join(' and ')}. Remove it from all workouts and templates first, or use "View Usage" below to see where it's used.`,
        'warning'
      );
      return;
    }

    // Exercise is not used, show delete confirmation
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!exercise) return;

    setIsDeleting(true);
    const { success, error } = await deleteExercise(exercise.id);

    if (error) {
      showAlert('Error Deleting Exercise', error, 'error');
      setIsDeleting(false);
      setDeleteModalOpen(false);
      return;
    }

    if (success) {
      showToast('Exercise deleted successfully', 'success');
      setDeleteModalOpen(false);
      router.push('/exercises');
    }

    setIsDeleting(false);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
  };

  // Load all exercises for the edit modal dropdowns
  const loadAllExercises = async () => {
    const { data } = await fetchExercises();
    if (data) {
      setAllExercises(data);
    }
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

  if (error || !exercise) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 dark:text-red-400'>{error || 'Exercise not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>{exercise.name}</h1>
            </div>
            <div className='flex items-center gap-2 ml-4'>
              <button
                onClick={() => {
                  loadAllExercises();
                  setEditModalOpen(true);
                }}
                className='p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer transition-colors'
                title='Edit exercise'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className='p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer transition-colors'
                title='Delete exercise'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
              </button>
              {exercise.is_mastered && (
                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2'>
                  Learnt
                </span>
              )}
            </div>
          </div>

          {/* Pattern - Prominent */}
          <div className='mb-6'>
            <span className='inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-lg font-bold'>
              {exercise.pattern}
            </span>
            {exerciseHasBeenDone === false && (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ml-3'>
                Never Done
              </span>
            )}
          </div>

          {/* Video */}
          <div className='mb-4'>
            <VideoThumbnail videoUrl={exercise.video_url} exerciseName={exercise.name} />
          </div>

          {/* Add to Template Button */}
          {showAddToTemplate && (
            <div className='mb-6'>
              <Button
                onClick={() => setAddToTemplateModalOpen(true)}
                variant='secondary'
                size='lg'
                fullWidth
              >
                <svg
                  className='w-6 h-6 mr-2 inline'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                Add to Template
              </Button>
            </div>
          )}

          {/* Exercise Details Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Movement Type</p>
              <p className='text-base text-gray-900 dark:text-white'>{exercise.movement_type}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Primary Body Part</p>
              <p className='text-base text-gray-900 dark:text-white'>{exercise.primary_body_part}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Secondary Body Part
              </p>
              <p className='text-base text-gray-900 dark:text-white'>{exercise.secondary_body_part}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Equipment</p>
              <p className='text-base text-gray-900 dark:text-white'>{exercise.equipment}</p>
            </div>
          </div>

          {/* Experience Level */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Experience Level</p>
              {!isEditingLearnt && (
                <button
                  onClick={() => setIsEditingLearnt(true)}
                  className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors'
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingLearnt ? (
              <div>
                <select
                  value={isLearnt ? 'learnt' : 'not-learnt'}
                  onChange={(e) => setIsLearnt(e.target.value === 'learnt')}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                >
                  <option value='not-learnt'>Not Learnt</option>
                  <option value='learnt'>Learnt</option>
                </select>
                <div className='flex items-center justify-end space-x-3 mt-4'>
                  <Button onClick={handleCancelEditLearnt} disabled={isSavingLearnt} variant='ghost' size='sm'>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveLearnt} disabled={isSavingLearnt} variant='primary' size='sm'>
                    {isSavingLearnt ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className='text-base text-gray-900 dark:text-white'>
                {exercise.is_mastered ? 'Learnt' : 'Not Learnt'}
              </p>
            )}
          </div>

          {/* Best Set (Max Weight) - Progressive Loading */}
          <div className='mb-6'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
              Maximum Weight (≥6 reps)
            </p>
            <SectionLoader
              loading={loadingBestSet}
              error={bestSetError}
              skeleton='text'
              skeletonLines={1}
              isEmpty={!bestSet}
              emptyMessage='No max weight recorded yet'>
              {bestSet && (
                <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {bestSet.weight}kg × {bestSet.reps} reps
                </p>
              )}
            </SectionLoader>
          </div>

          {/* Notes */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Notes</p>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors'
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-3'
                  placeholder='Add notes about equipment settings, form cues, etc.'
                />
                <div className='flex gap-2'>
                  <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
                    {isSavingNotes ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancelEditNotes} variant='secondary'>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className='text-base text-gray-900 dark:text-white whitespace-pre-wrap'>
                {exercise.notes || 'No notes yet'}
              </p>
            )}
          </div>
        </div>

        {/* Progress Chart - Progressive Loading */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Progress Chart
          </h2>
          <SectionLoader
            loading={loadingHistorical}
            error={historicalError}
            skeleton='chart'
            isEmpty={historicalData.length === 0}
            emptyMessage='No workout history for this exercise yet'>
            <ProgressChart historicalData={historicalData} />
          </SectionLoader>
        </div>

        {/* Historical Data - Progressive Loading */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Historical Performance
            </h2>
            {!loadingHistorical && historicalData.length > 3 && (
              <button
                onClick={() => setShowHistorical(!showHistorical)}
                className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors'
              >
                {showHistorical ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>

          <SectionLoader
            loading={loadingHistorical}
            error={historicalError}
            skeleton='table'
            skeletonLines={3}
            isEmpty={historicalData.length === 0}
            emptyMessage='No workout history for this exercise yet'>
            <div className='space-y-6'>
              {(showHistorical ? historicalData : historicalData.slice(0, 3)).map((session, index) => (
                <div key={index} className='border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0'>
                  <p className='text-sm font-medium text-gray-900 dark:text-white mb-3'>
                    {format(new Date(session.date), 'MMMM d, yyyy')}
                  </p>
                  <div className='space-y-2'>
                    {session.sets.map((set, setIndex) => (
                      <div key={setIndex} className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
                        <span className='w-16'>Set {set.set_number}</span>
                        <span className='font-medium'>{set.weight}kg</span>
                        <span>×</span>
                        <span className='font-medium'>{set.reps} reps</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionLoader>
        </div>

        {/* Exercise Usage Section - Lazy Loaded */}
        <ExerciseUsageSection
          exerciseId={exercise.id}
          exerciseName={exercise.name}
        />
      </div>

      {/* Add to Template Modal */}
      {exercise && (
        <AddToTemplateModal
          isOpen={addToTemplateModalOpen}
          onClose={() => setAddToTemplateModalOpen(false)}
          exerciseId={exercise.id}
          exerciseName={exercise.name}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModalOpen}
        title={alertModalContent.title}
        message={alertModalContent.message}
        type={alertModalContent.type}
        onClose={() => setAlertModalOpen(false)}
      />

      {/* Edit Exercise Modal */}
      {exercise && (
        <ExerciseFormModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          mode='edit'
          exercise={exercise}
          existingExercises={allExercises}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title='Delete Exercise'
        message={`Are you sure you want to delete "${exercise?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText='Cancel'
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />
    </div>
  );
};

export default ExerciseDetailView;
