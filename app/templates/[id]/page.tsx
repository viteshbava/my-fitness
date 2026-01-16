'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchWorkoutTemplateById,
  updateWorkoutTemplateName,
  updateWorkoutTemplateColor,
  deleteWorkoutTemplate,
  removeExerciseFromTemplate,
  updateTemplateExercisesOrder,
  createWorkoutFromTemplate,
} from '@/actions/workout-templates';
import { fetchBestSetsForExercises } from '@/actions/workout-exercises';
import { WorkoutTemplateWithExercises, TemplateExerciseWithExercise, Set } from '@/types/database';
import AlertModal from '@/components/AlertModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import RenameWorkoutModal from '@/components/RenameWorkoutModal';
import KebabMenu from '@/components/KebabMenu';
import ColorSelector from '@/components/ColorSelector';
import { getColorPillClasses } from '@/lib/utils/colors';
import SectionLoader from '@/components/SectionLoader';
import SwapButton from '@/components/SwapButton';
import SwapAnimationStyles from '@/components/SwapAnimationStyles';

// Template Exercise Card Component
interface TemplateExerciseCardProps {
  templateExercise: TemplateExerciseWithExercise;
  bestSet: Set | null;
  loadingBestSet: boolean;
  onDelete: () => void;
  animationDirection?: 'up' | 'down' | null;
}

const TemplateExerciseCard: React.FC<TemplateExerciseCardProps> = ({
  templateExercise,
  bestSet,
  loadingBestSet,
  onDelete,
  animationDirection,
}) => {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const handleClick = () => {
    router.push(`/templates/${templateId}/exercises/${templateExercise.exercise.id}`);
  };

  // Animation classes based on direction
  const getAnimationClass = () => {
    if (animationDirection === 'up') {
      return 'animate-slide-up';
    }
    if (animationDirection === 'down') {
      return 'animate-slide-down';
    }
    return '';
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:border hover:border-blue-500 dark:hover:border-blue-400 active:shadow-md active:scale-[0.98] active:border-blue-600 dark:active:border-blue-500 transition-all border border-transparent relative cursor-pointer ${getAnimationClass()}`}
    >
      {/* Card Content */}
      <div className="pr-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {templateExercise.exercise.name}
        </h3>
        {/* Pattern - Prominent */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-base font-semibold">
            {templateExercise.exercise.pattern}
          </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <SectionLoader
            loading={loadingBestSet}
            skeleton='text'
            skeletonLines={1}
            isEmpty={!bestSet}>
            {bestSet && (
              <p>
                <span className="font-medium">Best Set:</span> {bestSet.weight}kg × {bestSet.reps} reps
              </p>
            )}
          </SectionLoader>
        </div>
      </div>

      {/* Delete Button - Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 active:text-red-700 dark:active:text-red-200 active:scale-90 transition-all cursor-pointer z-10"
        aria-label="Remove exercise"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const TemplateDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<WorkoutTemplateWithExercises | null>(null);
  const [templateExercises, setTemplateExercises] = useState<TemplateExerciseWithExercise[]>([]);
  const [bestSets, setBestSets] = useState<Record<string, Set | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadingBestSets, setLoadingBestSets] = useState(false);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);

  // Animation state: tracks which cards are animating and their direction
  const [animatingCards, setAnimatingCards] = useState<Record<string, 'up' | 'down'>>({});

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success',
  });

  // Delete template confirmation modal state
  const [deleteTemplateModalOpen, setDeleteTemplateModalOpen] = useState(false);

  // Delete exercise confirmation modal state
  const [deleteExerciseModalOpen, setDeleteExerciseModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<TemplateExerciseWithExercise | null>(null);

  // Rename template modal state
  const [renameTemplateModalOpen, setRenameTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Color change state
  const [isChangingColor, setIsChangingColor] = useState(false);

  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'warning' | 'info' | 'success' = 'error'
  ) => {
    setAlertModalContent({ title, message, type });
    setAlertModalOpen(true);
  };

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  /**
   * Phase 1: Load only template data to show page quickly
   */
  const loadTemplate = async () => {
    setLoading(true);
    const { data, error } = await fetchWorkoutTemplateById(templateId);

    if (error) {
      showAlert('Error Loading Template', error, 'error');
      setLoading(false);
      return;
    }

    if (!data) {
      showAlert('Template Not Found', 'The template could not be found', 'error');
      setLoading(false);
      return;
    }

    setTemplate(data);
    setTemplateExercises(data.template_exercises || []);
    setNewTemplateName(data.name);
    setLoading(false);

    // Phase 2: Load best sets progressively in background
    if (data.template_exercises && data.template_exercises.length > 0) {
      loadBestSets(data.template_exercises.map(te => te.exercise.id));
    }
  };

  /**
   * Phase 2: Load best sets for all exercises progressively
   */
  const loadBestSets = async (exerciseIds: string[]) => {
    setLoadingBestSets(true);
    const { data: bestSetsData } = await fetchBestSetsForExercises(exerciseIds);
    if (bestSetsData) {
      setBestSets(bestSetsData);
    }
    setLoadingBestSets(false);
  };

  const handleRenameTemplate = async () => {
    if (!newTemplateName.trim()) {
      showAlert('Name Required', 'Please enter a template name', 'warning');
      return;
    }

    const { data, error } = await updateWorkoutTemplateName(templateId, newTemplateName.trim());

    if (error) {
      showAlert('Error Renaming Template', error, 'error');
      return;
    }

    if (data) {
      setTemplate({ ...template!, name: data.name });
      setNewTemplateName(data.name);
      setRenameTemplateModalOpen(false);
      showAlert('Template Renamed', 'The template has been renamed successfully', 'success');
    }
  };

  const handleDeleteTemplate = async () => {
    const { success, error } = await deleteWorkoutTemplate(templateId);

    if (error) {
      showAlert('Error Deleting Template', error, 'error');
      setDeleteTemplateModalOpen(false);
      return;
    }

    // Navigate back to templates list
    router.push('/templates');
  };

  const handleDeleteExerciseClick = (exercise: TemplateExerciseWithExercise) => {
    setExerciseToDelete(exercise);
    setDeleteExerciseModalOpen(true);
  };

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;

    const { success, error } = await removeExerciseFromTemplate(exerciseToDelete.id);

    if (error) {
      showAlert('Error Removing Exercise', error, 'error');
      setDeleteExerciseModalOpen(false);
      setExerciseToDelete(null);
      return;
    }

    // Refresh the template
    await loadTemplate();
    setDeleteExerciseModalOpen(false);
    setExerciseToDelete(null);
  };

  const cancelDeleteExercise = () => {
    setDeleteExerciseModalOpen(false);
    setExerciseToDelete(null);
  };

  const handleSwap = async (index: number) => {
    // Swap exercise at index with the one below it (index + 1)
    if (index >= templateExercises.length - 1) return;

    const topCardId = templateExercises[index].id;
    const bottomCardId = templateExercises[index + 1].id;

    // Set animation directions: top card moves down, bottom card moves up
    setAnimatingCards({
      [topCardId]: 'down',
      [bottomCardId]: 'up',
    });

    const newExercises = [...templateExercises];

    // Swap the exercises
    [newExercises[index], newExercises[index + 1]] = [
      newExercises[index + 1],
      newExercises[index],
    ];

    // Update local state optimistically
    setTemplateExercises(newExercises);

    // Update order_index for all exercises
    const updates = newExercises.map((exercise, idx) => ({
      id: exercise.id,
      order_index: idx,
    }));

    const { error } = await updateTemplateExercisesOrder(updates);

    if (error) {
      // Revert on error
      setTemplateExercises(templateExercises);
      showAlert('Error Reordering Exercises', error, 'error');
    }

    // Clear animations after they complete
    setTimeout(() => {
      setAnimatingCards({});
    }, 300);
  };

  const handleColorChange = async (colorId: string) => {
    if (!template) return;

    setIsChangingColor(true);
    const { data, error } = await updateWorkoutTemplateColor(templateId, colorId);

    if (error) {
      showAlert('Error Changing Color', error, 'error');
      setIsChangingColor(false);
      return;
    }

    if (data) {
      setTemplate({ ...template, color: data.color });
      setIsChangingColor(false);
    }
  };

  const handleLogWorkout = async () => {
    if (!template) return;

    if (templateExercises.length === 0) {
      showAlert(
        'No Exercises',
        'Please add exercises to this template before logging a workout',
        'warning'
      );
      return;
    }

    setIsCreatingWorkout(true);

    // Create workout with current date
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await createWorkoutFromTemplate(templateId, today);

    if (error) {
      showAlert('Error Creating Workout', error, 'error');
      setIsCreatingWorkout(false);
      return;
    }

    if (data) {
      // Navigate to the new workout detail page
      router.push(`/workouts/${data.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Template not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <SwapAnimationStyles />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/templates"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-6 h-6 rounded-full ${getColorPillClasses(template.color)}`}
                aria-label={`Template color: ${template.color || 'green'}`}
              />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {template.name}
              </h1>
            </div>
            <KebabMenu
              items={[
                {
                  label: 'Rename Template',
                  onClick: () => setRenameTemplateModalOpen(true),
                },
                {
                  label: 'Delete Template',
                  onClick: () => setDeleteTemplateModalOpen(true),
                  isDangerous: true,
                },
              ]}
            />
          </div>

          {/* Color Selector */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
            <ColorSelector
              selectedColorId={template.color || 'green'}
              onColorChange={handleColorChange}
            />
            {isChangingColor && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Updating color...</p>
            )}
          </div>
        </div>

        {/* Log Workout Button */}
        <button
          onClick={handleLogWorkout}
          disabled={isCreatingWorkout || templateExercises.length === 0}
          className="w-full mb-6 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold text-lg cursor-pointer transition-colors shadow-md hover:shadow-lg"
        >
          {isCreatingWorkout ? 'Creating Workout...' : 'Log Workout'}
        </button>

        {/* Add Exercise Button */}
        <Link
          href={`/templates/${templateId}/add-exercise`}
          className="block w-full mb-6 px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer transition-colors text-center"
        >
          + Add Exercise
        </Link>

        {/* Exercises List */}
        {templateExercises.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">No exercises in this template yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Add exercises to create your workout template
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {templateExercises.map((templateExercise, index) => (
              <React.Fragment key={templateExercise.id}>
                <TemplateExerciseCard
                  templateExercise={templateExercise}
                  bestSet={bestSets[templateExercise.exercise.id] || null}
                  loadingBestSet={loadingBestSets}
                  onDelete={() => handleDeleteExerciseClick(templateExercise)}
                  animationDirection={animatingCards[templateExercise.id] || null}
                />
                {/* Swap button between cards (not after the last one) */}
                {index < templateExercises.length - 1 && (
                  <SwapButton onSwap={() => handleSwap(index)} />
                )}
              </React.Fragment>
            ))}
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

      {/* Delete Template Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTemplateModalOpen}
        title="Delete Template"
        message={`Are you sure you want to delete this template? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteTemplateModalOpen(false)}
        isDangerous={true}
      />

      {/* Delete Exercise Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteExerciseModalOpen}
        title="Remove Exercise"
        message={`Are you sure you want to remove "${exerciseToDelete?.exercise.name}" from this template?`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmDeleteExercise}
        onCancel={cancelDeleteExercise}
        isDangerous={true}
      />

      {/* Rename Template Modal */}
      <RenameWorkoutModal
        isOpen={renameTemplateModalOpen}
        workoutName={newTemplateName}
        onWorkoutNameChange={setNewTemplateName}
        onSave={handleRenameTemplate}
        onCancel={() => setRenameTemplateModalOpen(false)}
      />
    </div>
  );
};

export default TemplateDetailPage;
