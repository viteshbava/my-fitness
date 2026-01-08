'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWorkouts, createWorkout } from '@/actions/workouts';
import { Workout } from '@/types/database';
import WorkoutCalendar from '@/components/WorkoutCalendar';
import AlertModal from '@/components/AlertModal';
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

        {/* Selected Date Modal */}
        {selectedDate && showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h2>

              {workoutsOnSelectedDate.length > 0 ? (
                <div className="mb-4 space-y-2">
                  {workoutsOnSelectedDate.map((workout, index) => (
                    <div
                      key={workout.id}
                      onClick={() => handleSelectWorkout(workout)}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-transparent hover:border-blue-500 dark:hover:border-blue-400"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Workout {index + 1}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Created at {format(new Date(workout.created_at), 'h:mm a')}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No workouts on this date
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleCreateWorkout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                >
                  Create New Workout
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedDate(null);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                >
                  Close
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
    </div>
  );
};

export default WorkoutsPage;
