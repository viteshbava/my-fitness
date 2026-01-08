'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWorkouts, createWorkout, deleteWorkout } from '@/actions/workouts';
import { Workout } from '@/types/database';
import WorkoutCalendar from '@/components/WorkoutCalendar';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';

const WorkoutsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workoutsOnSelectedDate, setWorkoutsOnSelectedDate] = useState<Workout[]>([]);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  // Confirmation modal state
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error'
  ) => {
    setAlertModalContent({ title, message, type });
    setAlertModalOpen(true);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const workoutsForDate = workouts.filter((w) => w.date === dateStr);
      setWorkoutsOnSelectedDate(workoutsForDate);
    } else {
      setWorkoutsOnSelectedDate([]);
    }
  }, [selectedDate, workouts]);

  const loadWorkouts = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkouts();

    if (error) {
      showAlert('Error Loading Workouts', error, 'error');
      setLoading(false);
      return;
    }

    setWorkouts(data || []);
    setLoading(false);
  };

  const handleSelectWorkout = (workout: Workout) => {
    router.push(`/workouts/${workout.id}`);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  const handleCreateWorkout = async () => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await createWorkout(dateStr);

    if (error) {
      showAlert('Error Creating Workout', error, 'error');
      return;
    }

    if (data) {
      setWorkouts([...workouts, data]);
      showToast('Workout created successfully', 'success');
      router.push(`/workouts/${data.id}`);
    }
  };

  const handleDeleteClick = (workout: Workout) => {
    setWorkoutToDelete(workout);
    setConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!workoutToDelete) return;

    const { success, error } = await deleteWorkout(workoutToDelete.id);

    if (error) {
      setConfirmationModalOpen(false);
      showAlert('Error Deleting Workout', error, 'error');
      return;
    }

    if (success) {
      setWorkouts(workouts.filter((w) => w.id !== workoutToDelete.id));
      setConfirmationModalOpen(false);
      setWorkoutToDelete(null);
      showToast('Workout deleted successfully', 'success');
    }
  };

  const cancelDelete = () => {
    setConfirmationModalOpen(false);
    setWorkoutToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Workout Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your workouts. Click a date to create a new workout.
          </p>
        </div>

        {/* Calendar */}
        <WorkoutCalendar
          workouts={workouts}
          onSelectWorkout={handleSelectWorkout}
          onSelectDate={handleSelectDate}
        />

        {/* Selected Date Workouts */}
        {selectedDate && showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h2>

              {workoutsOnSelectedDate.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Existing Workouts:
                  </h3>
                  <div className="space-y-2">
                    {workoutsOnSelectedDate.map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                      >
                        <button
                          onClick={() => handleSelectWorkout(workout)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        >
                          Workout {format(new Date(workout.created_at), 'HH:mm')}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(workout)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateWorkout}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                >
                  Create New Workout
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedDate(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        title="Delete Workout"
        message={`Are you sure you want to delete this workout from ${
          workoutToDelete ? format(new Date(workoutToDelete.date), 'MMMM d, yyyy') : ''
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />
    </div>
  );
};

export default WorkoutsPage;
