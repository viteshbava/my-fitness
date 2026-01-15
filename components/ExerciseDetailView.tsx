'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchExerciseById,
  updateExerciseNotes,
  updateExerciseIsLearnt,
  fetchExerciseHistoricalData,
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

interface ExerciseDetailViewProps {
  exerciseId: string;
  breadcrumbItems: BreadcrumbItem[];
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  exerciseId,
  breadcrumbItems,
}) => {
  const { showToast } = useToast();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [historicalData, setHistoricalData] = useState<Array<{ date: string; sets: Set[] }>>([]);
  const [bestSet, setBestSet] = useState<Set | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistorical, setShowHistorical] = useState(false);

  // Notes editing state
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Experience Level editing state
  const [isLearnt, setIsLearnt] = useState(false);
  const [isEditingLearnt, setIsEditingLearnt] = useState(false);
  const [isSavingLearnt, setIsSavingLearnt] = useState(false);

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
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
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

    // Load historical workout data for this exercise
    const { data: historical } = await fetchExerciseHistoricalData(data.id);
    if (historical) {
      setHistoricalData(historical);
    }

    // Load best set
    const { data: bestSetData } = await fetchBestSetForExercise(data.id);
    if (bestSetData) {
      setBestSet(bestSetData);
    }

    setLoading(false);
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
          </div>

          {/* Video */}
          <div className='mb-6'>
            <VideoThumbnail videoUrl={exercise.video_url} exerciseName={exercise.name} />
          </div>

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
              <div className='flex items-center gap-4'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={isLearnt}
                    onChange={(e) => setIsLearnt(e.target.checked)}
                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                  />
                  <span className='text-sm text-gray-900 dark:text-white'>Learnt</span>
                </label>
                <Button onClick={handleSaveLearnt} disabled={isSavingLearnt} size='sm'>
                  {isSavingLearnt ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancelEditLearnt} variant='secondary' size='sm'>
                  Cancel
                </Button>
              </div>
            ) : (
              <p className='text-base text-gray-900 dark:text-white'>
                {exercise.is_mastered ? 'Learnt' : 'Not Learnt'}
              </p>
            )}
          </div>

          {/* Best Set (Max Weight) */}
          {bestSet && (
            <div className='mb-6'>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
                Maximum Weight (≥6 reps)
              </p>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {bestSet.weight}kg × {bestSet.reps} reps
              </p>
            </div>
          )}

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

        {/* Progress Chart */}
        {historicalData.length > 0 && (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              Progress Chart
            </h2>
            <ProgressChart historicalData={historicalData} />
          </div>
        )}

        {/* Historical Data */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Historical Performance
            </h2>
            {historicalData.length > 3 && (
              <button
                onClick={() => setShowHistorical(!showHistorical)}
                className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors'
              >
                {showHistorical ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>

          {historicalData.length === 0 ? (
            <p className='text-gray-500 dark:text-gray-400'>No workout history for this exercise yet</p>
          ) : (
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
    </div>
  );
};

export default ExerciseDetailView;
