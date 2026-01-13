'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWorkoutById, deleteWorkout, updateWorkoutName } from '@/actions/workouts';
import {
  updateWorkoutExercisesOrder,
  fetchBestSetsForExercises,
} from '@/actions/workout-exercises';
import { WorkoutWithExercises, WorkoutExerciseWithExercise, Set } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';
import { formatSetsSummary } from '@/lib/controllers/workout-exercise-controller';
import KebabMenu from '@/components/KebabMenu';

// Exercise Card Component
interface ExerciseCardProps {
  workoutExercise: WorkoutExerciseWithExercise;
  workoutId: string;
  bestSet: Set | null;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  workoutExercise,
  workoutId,
  bestSet,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/workouts/${workoutId}/exercises/${workoutExercise.id}`);
  };

  // Get completion status and formatting
  const sets = workoutExercise.sets || [];
  const setsSummary = formatSetsSummary(sets);

  return (
    <div
      onClick={handleClick}
      className='bg-white dark:bg-gray-800 rounded-lg shadow p-10 hover:shadow-lg hover:border hover:border-blue-500 dark:hover:border-blue-400 transition-all border border-transparent flex items-stretch gap-4 relative cursor-pointer'>
      {/* Up Arrow - Top Left */}
      {!isFirst && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          className='absolute top-2 left-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer z-10'
          aria-label='Move up'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
          </svg>
        </button>
      )}

      {/* Card Content */}
      <div className='grow'>
        <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
          {workoutExercise.exercise.name}
        </h3>
        {/* Pattern - Prominent */}
        <div className='mb-3'>
          <span className='inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-base font-semibold'>
            {workoutExercise.exercise.pattern}
          </span>
        </div>
        <div className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
          {bestSet && (
            <p>
              <span className='font-medium'>Best Set:</span> {bestSet.weight}kg × {bestSet.reps}reps
            </p>
          )}
          <p className='font-medium text-gray-700 dark:text-gray-300'>{setsSummary}</p>
        </div>
      </div>

      {/* Down Arrow - Bottom Left */}
      {!isLast && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          className='absolute bottom-2 left-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer z-10'
          aria-label='Move down'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </button>
      )}
    </div>
  );
};

const WorkoutDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  const { showToast } = useToast();

  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseWithExercise[]>([]);
  const [bestSets, setBestSets] = useState<Record<string, Set | null>>({});
  const [loading, setLoading] = useState(true);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  // Delete workout confirmation modal state
  const [deleteWorkoutModalOpen, setDeleteWorkoutModalOpen] = useState(false);

  // Rename workout modal state
  const [renameWorkoutModalOpen, setRenameWorkoutModalOpen] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');

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

      // Fetch best sets for all exercises in this workout
      const exerciseIds = (data.workout_exercises || []).map((we) => we.exercise_id);
      if (exerciseIds.length > 0) {
        const { data: bestSetsData } = await fetchBestSetsForExercises(exerciseIds);
        if (bestSetsData) {
          setBestSets(bestSetsData);
        }
      }
    }
    setLoading(false);
  };

  const moveExercise = async (fromIndex: number, toIndex: number) => {
    // Store original order for reverting if needed
    const originalExercises = [...workoutExercises];

    // Create new array with swapped items
    const reorderedExercises = [...workoutExercises];
    const [movedItem] = reorderedExercises.splice(fromIndex, 1);
    reorderedExercises.splice(toIndex, 0, movedItem);

    // Update state optimistically
    setWorkoutExercises(reorderedExercises);

    // Update order_index for all exercises
    const updates = reorderedExercises.map((we, index) => ({
      id: we.id,
      order_index: index,
    }));

    // Save to database
    const { success, error } = await updateWorkoutExercisesOrder(updates);

    if (error || !success) {
      // Revert on error
      setWorkoutExercises(originalExercises);
      showAlert('Error Reordering', error || 'Failed to save order', 'error');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveExercise(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < workoutExercises.length - 1) {
      moveExercise(index, index + 1);
    }
  };

  const handleRenameWorkoutClick = () => {
    if (workout) {
      setNewWorkoutName(workout.name);
      setRenameWorkoutModalOpen(true);
    }
  };

  const handleRenameWorkout = async () => {
    if (!workout) return;

    if (!newWorkoutName.trim()) {
      showAlert('Name Required', 'Please enter a workout name', 'warning');
      return;
    }

    const { data, error } = await updateWorkoutName(workout.id, newWorkoutName.trim());

    if (error) {
      showAlert('Error Renaming Workout', error, 'error');
      return;
    }

    if (data) {
      setWorkout({ ...workout, name: data.name });
      setRenameWorkoutModalOpen(false);
      showToast('Workout renamed successfully', 'success');
    }
  };

  const handleDeleteWorkoutClick = () => {
    setDeleteWorkoutModalOpen(true);
  };

  const confirmDeleteWorkout = async () => {
    if (!workout) return;

    const { success, error } = await deleteWorkout(workout.id);

    if (error) {
      setDeleteWorkoutModalOpen(false);
      showAlert('Error Deleting Workout', error, 'error');
      return;
    }

    if (success) {
      showToast('Workout deleted successfully', 'success');
      router.push('/workouts');
    }
  };

  const cancelDeleteWorkout = () => {
    setDeleteWorkoutModalOpen(false);
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
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-1'>
                {workout.name}
              </h1>
              <p className='text-lg text-gray-600 dark:text-gray-400'>
                {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            {/* Kebab Menu */}
            <KebabMenu
              items={[
                {
                  label: 'Rename',
                  onClick: handleRenameWorkoutClick,
                  icon: (
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                      />
                    </svg>
                  ),
                  isDangerous: false,
                },
                {
                  label: 'Delete Workout',
                  onClick: handleDeleteWorkoutClick,
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
          </div>
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
              {workoutExercises.map((we, index) => (
                <ExerciseCard
                  key={we.id}
                  workoutExercise={we}
                  workoutId={workoutId}
                  bestSet={bestSets[we.exercise_id] || null}
                  isFirst={index === 0}
                  isLast={index === workoutExercises.length - 1}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
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

      {/* Delete Workout Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteWorkoutModalOpen}
        title='Delete Workout'
        message={`Are you sure you want to delete this workout from ${
          workout ? format(new Date(workout.date), 'MMMM d, yyyy') : ''
        }? This will also remove all exercises in this workout. This action cannot be undone.`}
        confirmText='Delete Workout'
        cancelText='Cancel'
        onConfirm={confirmDeleteWorkout}
        onCancel={cancelDeleteWorkout}
        isDangerous={true}
      />

      {/* Rename Workout Modal */}
      {renameWorkoutModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
              Rename Workout
            </h2>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Workout Name
              </label>
              <input
                type='text'
                value={newWorkoutName || ''}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                placeholder='Enter workout name'
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameWorkout();
                  }
                }}
                autoFocus
              />
            </div>

            <div className='flex flex-col space-y-2'>
              <button
                onClick={handleRenameWorkout}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer'>
                Save
              </button>
              <button
                onClick={() => {
                  setRenameWorkoutModalOpen(false);
                  setNewWorkoutName('');
                }}
                className='w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors cursor-pointer'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetailPage;
