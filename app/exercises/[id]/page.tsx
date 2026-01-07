'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchExerciseById, updateExerciseNotes, updateExerciseIsLearnt } from '@/actions/exercises';
import { Exercise } from '@/types/database';
import AlertModal from '@/components/AlertModal';

const ExerciseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      showAlert('Success', 'Notes saved successfully', 'success');
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
      showAlert('Success', 'Experience level updated successfully', 'success');
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Exercise not found'}</p>
          <Link
            href="/exercises"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
          >
            Back to Exercise Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/exercises"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 cursor-pointer"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Exercise Library
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {exercise.name}
            </h1>
            {exercise.is_mastered && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Learnt
              </span>
            )}
          </div>

          {/* Exercise Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Movement Type
              </label>
              <p className="text-gray-900 dark:text-white">{exercise.movement_type}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pattern
              </label>
              <p className="text-gray-900 dark:text-white">{exercise.pattern}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Body Part
              </label>
              <p className="text-gray-900 dark:text-white">{exercise.primary_body_part}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Secondary Body Part
              </label>
              <p className="text-gray-900 dark:text-white">{exercise.secondary_body_part}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Equipment
              </label>
              <p className="text-gray-900 dark:text-white">{exercise.equipment}</p>
            </div>

            {exercise.last_used_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Used
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(exercise.last_used_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Experience Level Section - Editable */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Experience Level</h2>
            {!isEditingLearnt && (
              <button
                onClick={() => setIsEditingLearnt(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingLearnt ? (
            <div>
              <select
                value={isLearnt ? 'learnt' : 'not-learnt'}
                onChange={(e) => setIsLearnt(e.target.value === 'learnt')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="not-learnt">Not Learnt</option>
                <option value="learnt">Learnt</option>
              </select>
              <div className="flex items-center justify-end space-x-3 mt-4">
                <button
                  onClick={handleCancelEditLearnt}
                  disabled={isSavingLearnt}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLearnt}
                  disabled={isSavingLearnt}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isSavingLearnt ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              {isLearnt ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Learnt
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  Not Learnt
                </span>
              )}
            </div>
          )}
        </div>

        {/* Video Section - Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Exercise Video
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center">
            {exercise.video_url ? (
              <div>
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  Video playback will be available in Sprint 6
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Video URL: {exercise.video_url}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No video available</p>
            )}
          </div>
        </div>

        {/* Notes Section - Editable */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notes</h2>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Add notes about equipment settings, technique tips, etc."
              />
              <div className="flex items-center justify-end space-x-3 mt-4">
                <button
                  onClick={handleCancelEditNotes}
                  disabled={isSavingNotes}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isSavingNotes ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {notes || (
                <p className="text-gray-500 dark:text-gray-400 italic">No notes yet</p>
              )}
            </div>
          )}
        </div>

        {/* Historical Performance - Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Historical Performance
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Historical data and progress charts will be available in Sprint 5
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Track your max weight, performance over time, and view detailed workout history
            </p>
          </div>
        </div>

        {/* Max Weight Score - Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Maximum Weight Score
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Max weight tracking will be available in Sprint 5
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              See your heaviest weight with at least 6 reps
            </p>
          </div>
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
