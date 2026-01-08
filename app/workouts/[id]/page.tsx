'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWorkoutById, deleteWorkout } from '@/actions/workouts';
import { updateWorkoutExercisesOrder } from '@/actions/workout-exercises';
import { WorkoutWithExercises, WorkoutExerciseWithExercise } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';
import {
  formatSetsSummary,
  calculateMaxWeight,
} from '@/lib/controllers/workout-exercise-controller';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Exercise Card Component
interface SortableExerciseCardProps {
  workoutExercise: WorkoutExerciseWithExercise;
  workoutId: string;
  isReorderMode: boolean;
}

const SortableExerciseCard: React.FC<SortableExerciseCardProps> = ({
  workoutExercise,
  workoutId,
  isReorderMode,
}) => {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workoutExercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = () => {
    if (!isReorderMode) {
      router.push(`/workouts/${workoutId}/exercises/${workoutExercise.id}`);
    }
  };

  // Get completion status and formatting
  const sets = workoutExercise.sets || [];
  const setsSummary = formatSetsSummary(sets);
  const maxWeight = calculateMaxWeight(sets);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isReorderMode ? listeners : {})}
      onClick={handleClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all border ${
        isReorderMode
          ? 'border-blue-500 dark:border-blue-400 cursor-grab active:cursor-grabbing'
          : 'border-transparent hover:shadow-lg hover:border hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
      }`}>
      <div>
        <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
          {workoutExercise.exercise.name}
        </h3>
        <div className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
          <p>
            <span className='font-medium'>Primary:</span>{' '}
            {workoutExercise.exercise.primary_body_part}
          </p>
          <p>
            <span className='font-medium'>Equipment:</span> {workoutExercise.exercise.equipment}
          </p>
          {maxWeight > 0 && (
            <p>
              <span className='font-medium'>Max Weight:</span> {maxWeight} kg
            </p>
          )}
        </div>
        <p className='mt-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
          {setsSummary}
        </p>
      </div>
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
  const [loading, setLoading] = useState(true);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  // Delete workout confirmation modal state
  const [deleteWorkoutModalOpen, setDeleteWorkoutModalOpen] = useState(false);

  // Drag-and-drop sensors (supports mouse, touch, and keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch to distinguish from scrolling
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

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

  const startLongPress = () => {
    // Start long-press timer (600ms)
    const timer = setTimeout(() => {
      setIsReorderMode(true);
      // Vibrate on mobile if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      showToast('Reorder mode activated', 'info');
    }, 600);
    setLongPressTimer(timer);
  };

  const cancelLongPress = () => {
    // Cancel long-press if interaction ends or moves
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Touch event handlers (mobile)
  const handleTouchStart = () => {
    startLongPress();
  };

  const handleTouchEnd = () => {
    cancelLongPress();
  };

  const handleTouchMove = () => {
    cancelLongPress();
  };

  // Mouse event handlers (desktop)
  const handleMouseDown = () => {
    startLongPress();
  };

  const handleMouseUp = () => {
    cancelLongPress();
  };

  const handleMouseLeave = () => {
    cancelLongPress();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = workoutExercises.findIndex((we) => we.id === active.id);
    const newIndex = workoutExercises.findIndex((we) => we.id === over.id);

    // Store original order for reverting if needed
    const originalExercises = [...workoutExercises];

    // Reorder the array optimistically
    const reorderedExercises = arrayMove(workoutExercises, oldIndex, newIndex);
    setWorkoutExercises(reorderedExercises);

    // Update order_index for all affected exercises
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
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              Workout - {format(new Date(workout.date), 'MMMM d, yyyy')}
            </h1>
            <button
              onClick={handleDeleteWorkoutClick}
              className='flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              Delete Workout
            </button>
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
            {/* Reorder Mode Banner */}
            {isReorderMode && (
              <div className='mb-4 bg-blue-100 dark:bg-blue-900 border border-blue-500 dark:border-blue-400 rounded-lg p-4 flex items-center justify-between'>
                <div className='flex items-center'>
                  <svg
                    className='w-5 h-5 text-blue-600 dark:text-blue-400 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                    />
                  </svg>
                  <span className='text-blue-900 dark:text-blue-100 font-medium'>
                    Reorder Mode Active - Drag exercises to reorder
                  </span>
                </div>
                <button
                  onClick={() => setIsReorderMode(false)}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors cursor-pointer'>
                  Done
                </button>
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={workoutExercises.map((we) => we.id)}
                strategy={verticalListSortingStrategy}>
                <div
                  className='space-y-4'
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}>
                  {workoutExercises.map((we) => (
                    <SortableExerciseCard
                      key={we.id}
                      workoutExercise={we}
                      workoutId={workoutId}
                      isReorderMode={isReorderMode}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Exercise Button - shown at the bottom when exercises exist */}
            {!isReorderMode && (
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
            )}
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
    </div>
  );
};

export default WorkoutDetailPage;
