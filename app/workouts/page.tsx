'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWorkouts, createWorkout } from '@/actions/workouts';
import { Workout } from '@/types/database';
import CustomWorkoutCalendar from '@/components/CustomWorkoutCalendar';
import AlertModal from '@/components/AlertModal';
import ModalOverlay from '@/components/ModalOverlay';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';
import ColorSelector from '@/components/ColorSelector';
import { DEFAULT_COLOR_ID } from '@/lib/utils/colors';

const WorkoutsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workoutsOnSelectedDate, setWorkoutsOnSelectedDate] = useState<Workout[]>([]);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutColor, setNewWorkoutColor] = useState(DEFAULT_COLOR_ID);

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
    setNewWorkoutName('');
    setNewWorkoutColor(DEFAULT_COLOR_ID);
  };

  const handleCreateWorkout = async () => {
    if (!selectedDate) return;

    if (!newWorkoutName.trim()) {
      showAlert('Name Required', 'Please enter a workout name', 'warning');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await createWorkout(dateStr, newWorkoutName.trim(), newWorkoutColor);

    if (error) {
      showAlert('Error Creating Workout', error, 'error');
      return;
    }

    if (data) {
      setWorkouts([...workouts, data]);
      showToast('Workout created successfully', 'success');
      setShowCreateModal(false);
      setSelectedDate(null);
      setNewWorkoutName('');
      setNewWorkoutColor(DEFAULT_COLOR_ID);
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
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar */}
        <CustomWorkoutCalendar
          workouts={workouts}
          onSelectWorkout={handleSelectWorkout}
          onSelectDate={handleSelectDate}
        />

        {/* Selected Date Modal */}
        <ModalOverlay
          isOpen={showCreateModal && selectedDate !== null}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
            setNewWorkoutName('');
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </h2>

            {workoutsOnSelectedDate.length > 0 && (
              <div className="mb-4 space-y-2">
                {workoutsOnSelectedDate.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => handleSelectWorkout(workout)}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 active:scale-[0.98] transition-all cursor-pointer border border-transparent hover:border-blue-500 dark:hover:border-blue-400"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {workout.name}
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
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workout Name
              </label>
              <input
                type="text"
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                placeholder="Enter workout name (e.g., Morning Run, Leg Day)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateWorkout();
                  }
                }}
              />
            </div>

            <div className="mb-4">
              <ColorSelector
                selectedColorId={newWorkoutColor}
                onColorChange={setNewWorkoutColor}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Button onClick={handleCreateWorkout} variant="primary" fullWidth>
                Create New Workout
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedDate(null);
                  setNewWorkoutName('');
                  setNewWorkoutColor(DEFAULT_COLOR_ID);
                }}
                variant="secondary"
                fullWidth
              >
                Close
              </Button>
            </div>
          </div>
        </ModalOverlay>
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
