'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchExerciseById,
  updateExerciseNotes,
  updateExerciseIsLearnt,
  fetchExerciseHistoricalData,
} from '@/actions/exercises';
import { fetchBestSetForExercise } from '@/actions/workout-exercises';
import { Exercise, Set } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';
import ProgressChart from '@/components/ProgressChart';
import VideoThumbnail from '@/components/VideoThumbnail';
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb';

const ExerciseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
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
          <p className='text-red-600 dark:text-red-400 mb-4'>{error || 'Exercise not found'}</p>
          <Link
            href='/exercises'
            className='text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer'>
            Back to Exercise Library
          </Link>
        </div>
      </div>
    );
  }

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Exercises', href: '/exercises' },
    { label: 'Exercise' },
  ];

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

          {/* Exercise Attributes */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Movement Type
              </label>
              <p className='text-gray-900 dark:text-white'>{exercise.movement_type}</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Primary Body Part
              </label>
              <p className='text-gray-900 dark:text-white'>{exercise.primary_body_part}</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Secondary Body Part
              </label>
              <p className='text-gray-900 dark:text-white'>{exercise.secondary_body_part}</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Equipment
              </label>
              <p className='text-gray-900 dark:text-white'>{exercise.equipment}</p>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Exercise Video
          </h2>
          <VideoThumbnail
            videoUrl={exercise.video_url}
            exerciseName={exercise.name}
            primaryBodyPart={exercise.primary_body_part}
            size='large'
          />
        </div>

        {/* Experience Level Section - Editable */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Experience Level
            </h2>
            {!isEditingLearnt && (
              <button
                onClick={() => setIsEditingLearnt(true)}
                className='px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400'>
                Edit
              </button>
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
                <button
                  onClick={handleCancelEditLearnt}
                  disabled={isSavingLearnt}
                  className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 disabled:opacity-50'>
                  Cancel
                </button>
                <button
                  onClick={handleSaveLearnt}
                  disabled={isSavingLearnt}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50'>
                  {isSavingLearnt ? 'Saving...' : 'Save'}
                </button>
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

        {/* Notes Section - Editable */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Notes</h2>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className='px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400'>
                Edit
              </button>
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
                <button
                  onClick={handleCancelEditNotes}
                  disabled={isSavingNotes}
                  className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 disabled:opacity-50'>
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50'>
                  {isSavingNotes ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className='text-gray-900 dark:text-white whitespace-pre-wrap'>
              {notes || <p className='text-gray-500 dark:text-gray-400 italic'>No notes yet</p>}
            </div>
          )}
        </div>

        {/* Best Set */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>Best Set</h2>
          {bestSet ? (
            <div className='text-center py-8'>
              <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 mb-4'>
                <svg
                  className='w-12 h-12 text-green-600 dark:text-green-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                  />
                </svg>
              </div>
              <p className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>
                {bestSet.weight} kg × {bestSet.reps} reps
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Heaviest weight with at least 6 reps
              </p>
            </div>
          ) : (
            <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center'>
              <p className='text-gray-600 dark:text-gray-400'>No best set recorded yet</p>
              <p className='text-sm text-gray-500 dark:text-gray-500 mt-2'>
                Complete a set with at least 6 reps to see your best set
              </p>
            </div>
          )}
        </div>

        {/* Progress Chart */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            Progress Chart
          </h2>
          <div className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
            Showing max weight and max reps per workout for the last 12 months
          </div>
          <ProgressChart historicalData={historicalData} />
        </div>

        {/* Latest Workouts Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
          <button
            onClick={() => setShowHistorical(!showHistorical)}
            className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 transition-opacity'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Latest Workouts
              <span className='text-sm text-gray-500 ml-2'>
                ({Math.min(historicalData.length, 3)})
              </span>
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
              {historicalData.length === 0 ? (
                <div className='text-center py-8'>
                  <svg
                    className='w-16 h-16 mx-auto text-gray-400 mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                  <p className='text-gray-500 dark:text-gray-400 text-lg mb-2'>
                    No workout history yet
                  </p>
                  <p className='text-sm text-gray-400 dark:text-gray-500'>
                    Add this exercise to a workout and complete some sets to see your history here
                  </p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {historicalData.slice(0, 3).map((workout, workoutIndex) => {
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
                          <div className='flex justify-between items-center mb-3'>
                            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                              {format(new Date(workout.date), 'MMMM d, yyyy')}
                            </h3>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              {workout.sets.length} sets
                            </span>
                          </div>
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
    </div>
  );
};

export default ExerciseDetailPage;
