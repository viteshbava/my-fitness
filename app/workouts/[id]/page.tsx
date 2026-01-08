'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWorkoutById } from '@/actions/workouts';
import { fetchWorkoutExercises, removeExerciseFromWorkout } from '@/actions/workout-exercises';
import { WorkoutWithExercises, WorkoutExerciseWithExercise } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { format } from 'date-fns';

const WorkoutDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseWithExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  // Confirmation modal state
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [exerciseToRemove, setExerciseToRemove] = useState<WorkoutExerciseWithExercise | null>(
    null
  );

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error'
  ) => {
    setAlertModalContent({ title, message, type });
    setAlertModalOpen(true);
  };

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkoutById(workoutId);

    if (error) {
      showAlert('Error Loading Workout', error, 'error');
      setLoading(false);
      return;
    }

    if (data) {
      setWorkout(data);
      setWorkoutExercises(data.workout_exercises || []);
    }
    setLoading(false);
  };

  const handleRemoveExerciseClick = (workoutExercise: WorkoutExerciseWithExercise) => {
    setExerciseToRemove(workoutExercise);
    setConfirmationModalOpen(true);
  };

  const confirmRemoveExercise = async () => {
    if (!exerciseToRemove) return;

    const { success, error } = await removeExerciseFromWorkout(exerciseToRemove.id);

    if (error) {
      showAlert('Error Removing Exercise', error, 'error');
      setConfirmationModalOpen(false);
      return;
    }

    if (success) {
      setWorkoutExercises(workoutExercises.filter((we) => we.id !== exerciseToRemove.id));
      setConfirmationModalOpen(false);
      setExerciseToRemove(null);
      showAlert('Exercise Removed', 'Exercise removed from workout successfully!', 'success');
    }
  };

  const cancelRemoveExercise = () => {
    setConfirmationModalOpen(false);
    setExerciseToRemove(null);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 dark:text-gray-400'>Workout not found</p>
          <Link
            href='/workouts'
            className='mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer'>
            Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            href='/workouts'
            className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block cursor-pointer'>
            ← Back to Calendar
          </Link>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Workout - {format(new Date(workout.date), 'MMMM d, yyyy')}
          </h1>
        </div>

        {/* Exercise List */}
        {workoutExercises.length === 0 ? (
          <Link
            href={`/workouts/${workoutId}/add-exercise`}
            className='block bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center hover:shadow-lg transition-shadow cursor-pointer'>
            <svg
              className='w-16 h-16 mx-auto text-gray-400 mb-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              />
            </svg>
            <p className='text-gray-500 dark:text-gray-400 text-lg mb-4'>
              No exercises in this workout yet
            </p>
            <span className='inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'>
              Add your first exercise
            </span>
          </Link>
        ) : (
          <>
            <div className='space-y-4'>
              {workoutExercises.map((we) => (
                <div
                  key={we.id}
                  className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                        {we.exercise.name}
                      </h3>
                      <div className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                        <p>
                          <span className='font-medium'>Primary:</span>{' '}
                          {we.exercise.primary_body_part}
                        </p>
                        <p>
                          <span className='font-medium'>Equipment:</span> {we.exercise.equipment}
                        </p>
                      </div>
                      <p className='mt-3 text-sm text-gray-500 dark:text-gray-500'>
                        No sets recorded yet (Sprint 4 feature)
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveExerciseClick(we)}
                      className='ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer'>
                      <svg
                        className='w-6 h-6'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Exercise Button - shown at the bottom when exercises exist */}
            <div className='mt-6'>
              <Link
                href={`/workouts/${workoutId}/add-exercise`}
                className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                Add Exercise
              </Link>
            </div>
          </>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        title='Remove Exercise'
        message={`Are you sure you want to remove "${
          exerciseToRemove?.exercise.name || ''
        }" from this workout?`}
        confirmText='Remove'
        cancelText='Cancel'
        onConfirm={confirmRemoveExercise}
        onCancel={cancelRemoveExercise}
        isDangerous={true}
      />
    </div>
  );
};

export default WorkoutDetailPage;
