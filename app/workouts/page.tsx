'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWorkouts, createWorkout } from '@/actions/workouts';
import { fetchWorkoutTemplates, createWorkoutFromTemplate } from '@/actions/workout-templates';
import { Workout, WorkoutTemplate } from '@/types/database';
import CustomWorkoutCalendar from '@/components/CustomWorkoutCalendar';
import AlertModal from '@/components/AlertModal';
import ModalOverlay from '@/components/ModalOverlay';
import Button from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import { format } from 'date-fns';
import { DEFAULT_COLOR_ID, getColorPillClasses } from '@/lib/utils/colors';

const WorkoutsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalView, setModalView] = useState<'options' | 'templates'>('options');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [creatingWorkout, setCreatingWorkout] = useState(false);

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
    setModalView('options');
  };

  const handleShowTemplates = async () => {
    setLoadingTemplates(true);
    const { data, error } = await fetchWorkoutTemplates();

    if (error) {
      showAlert('Error Loading Templates', error, 'error');
      setLoadingTemplates(false);
      return;
    }

    setTemplates(data || []);
    setLoadingTemplates(false);
    setModalView('templates');
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    if (!selectedDate) return;

    setCreatingWorkout(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await createWorkoutFromTemplate(templateId, dateStr);

    if (error) {
      showAlert('Error Creating Workout', error, 'error');
      setCreatingWorkout(false);
      return;
    }

    if (data) {
      setWorkouts([...workouts, data]);
      showToast('Workout created from template', 'success');
      setShowCreateModal(false);
      setSelectedDate(null);
      setModalView('options');
      setCreatingWorkout(false);
      router.push(`/workouts/${data.id}`);
    }
  };

  const handleCreateCustomWorkout = async () => {
    if (!selectedDate) return;

    setCreatingWorkout(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await createWorkout(dateStr, 'Custom Workout', DEFAULT_COLOR_ID);

    if (error) {
      showAlert('Error Creating Workout', error, 'error');
      setCreatingWorkout(false);
      return;
    }

    if (data) {
      setWorkouts([...workouts, data]);
      showToast('Custom workout created', 'success');
      setShowCreateModal(false);
      setSelectedDate(null);
      setModalView('options');
      setCreatingWorkout(false);
      router.push(`/workouts/${data.id}`);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedDate(null);
    setModalView('options');
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

        {/* Add Workout Modal */}
        <ModalOverlay isOpen={showCreateModal && selectedDate !== null} onClose={handleCloseModal}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Add Workout
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            {/* Options View */}
            {modalView === 'options' && (
              <div className="space-y-3">
                <button
                  onClick={handleShowTemplates}
                  disabled={loadingTemplates || creatingWorkout}
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 text-white rounded-lg font-semibold cursor-pointer transition-colors text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-lg">Create from Template</div>
                    <div className="text-sm text-blue-100">Choose from your saved templates</div>
                  </div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleCreateCustomWorkout}
                  disabled={creatingWorkout}
                  className="w-full p-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 text-white rounded-lg font-semibold cursor-pointer transition-colors text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-lg">Create Custom Workout</div>
                    <div className="text-sm text-green-100">Start with a blank workout</div>
                  </div>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleCloseModal}
                  className="w-full p-4 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Templates View */}
            {modalView === 'templates' && (
              <>
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-4 text-gray-600 dark:text-gray-400">Loading templates...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">No templates found</p>
                    <div className="flex gap-3">
                      <Button onClick={handleCloseModal} variant="secondary">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCustomWorkout} variant="primary">
                        Create Custom Workout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Templates List - Scrollable */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleCreateFromTemplate(template.id)}
                          disabled={creatingWorkout}
                          className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 rounded-lg cursor-pointer transition-all text-left border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full ${getColorPillClasses(template.color)}`}
                              aria-label={`Template color: ${template.color || 'green'}`}
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {template.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Created {new Date(template.created_at).toLocaleDateString()}
                              </div>
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
                        </button>
                      ))}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={handleCloseModal}
                        variant="secondary"
                        fullWidth
                        disabled={creatingWorkout}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCustomWorkout}
                        variant="primary"
                        fullWidth
                        disabled={creatingWorkout}
                      >
                        Create Custom
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
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
