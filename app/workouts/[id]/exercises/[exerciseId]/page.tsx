'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWorkoutExercises, removeExerciseFromWorkout } from '@/actions/workout-exercises';
import { WorkoutExerciseWithExercise } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';

const WorkoutExerciseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  const exerciseId = params.exerciseId as string;

  const [workoutExercise, setWorkoutExercise] = useState<WorkoutExerciseWithExercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  // Confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
  }, [workoutId, exerciseId]);

  const loadWorkoutExercise = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkoutExercises(workoutId);

    if (error) {
      showAlert('Error Loading Exercise', error, 'error');
      setLoading(false);
      return;
    }

    if (data) {
      const exercise = data.find((we) => we.id === exerciseId);
      if (exercise) {
        setWorkoutExercise(exercise);
      }
    }
    setLoading(false);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!workoutExercise) return;

    const { success, error } = await removeExerciseFromWorkout(workoutExercise.id);

    if (error) {
      showAlert('Error Removing Exercise', error, 'error');
      setDeleteModalOpen(false);
      return;
    }

    if (success) {
      setDeleteModalOpen(false);
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

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <Link
            href={`/workouts/${workoutId}`}
            className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block cursor-pointer'>
            ← Back to Workout
          </Link>
          <div className='flex items-start justify-between'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              {workoutExercise.exercise.name}
            </h1>
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
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Pattern</p>
              <p className='text-lg text-gray-900 dark:text-white'>
                {workoutExercise.exercise.pattern}
              </p>
            </div>
          </div>
        </div>

        {/* Sets Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>Sets</h2>
          <p className='text-gray-500 dark:text-gray-400'>
            Set tracking will be available in Sprint 4
          </p>
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
    </div>
  );
};

export default WorkoutExerciseDetailPage;
