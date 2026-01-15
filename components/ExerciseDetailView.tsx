'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchExerciseById,
  updateExerciseNotes,
  updateExerciseIsLearnt,
  fetchExerciseHistoricalData,
  hasExerciseBeenDone,
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
  const { showToast } = useToast();

  const [exercise, setExercise] = useState<Exercise | null>(null);
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
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>{exercise.name}</h1>
            {exercise.is_mastered && (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                Learnt
              </span>
            )}
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
    </div>
  );
};

export default ExerciseDetailView;
