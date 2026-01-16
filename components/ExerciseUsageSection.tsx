'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ExerciseUsageDetails } from '@/types/database';
import { fetchExerciseUsageDetails } from '@/actions/exercises';
import Button from '@/components/Button';

interface ExerciseUsageSectionProps {
  exerciseId: string;
  exerciseName: string;
}

const ExerciseUsageSection: React.FC<ExerciseUsageSectionProps> = ({
  exerciseId,
  exerciseName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<ExerciseUsageDetails | null>(null);

  const handleToggleExpand = async () => {
    if (!isExpanded && !usageData) {
      // Load data when expanding for the first time
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await fetchExerciseUsageDetails(exerciseId);

      if (fetchError) {
        setError(fetchError);
        setLoading(false);
        return;
      }

      setUsageData(data);
      setLoading(false);
    }

    setIsExpanded(!isExpanded);
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchExerciseUsageDetails(exerciseId);

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    setUsageData(data);
    setLoading(false);
  };

  const totalUsage = usageData
    ? usageData.workouts.length + usageData.templates.length
    : 0;

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6'>
      {/* Header with toggle button */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
          Exercise Usage
        </h2>
        <button
          onClick={handleToggleExpand}
          disabled={loading}
          className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent'></div>
              Loading...
            </>
          ) : (
            <>
              {isExpanded ? 'Hide Usage' : 'View Usage'}
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className='mt-4'>
          {error ? (
            <div className='text-center py-4'>
              <p className='text-red-600 dark:text-red-400 mb-3'>{error}</p>
              <Button onClick={handleRetry} variant='secondary' size='sm'>
                Retry
              </Button>
            </div>
          ) : usageData && totalUsage === 0 ? (
            <p className='text-gray-600 dark:text-gray-400 text-center py-4'>
              This exercise is not used in any workouts or templates.
            </p>
          ) : usageData ? (
            <div className='space-y-6'>
              {/* Workouts Table */}
              {usageData.workouts.length > 0 && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-3'>
                    Workouts ({usageData.workouts.length})
                  </h3>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-gray-200 dark:border-gray-700'>
                          <th className='text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300'>
                            Workout Name
                          </th>
                          <th className='text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300'>
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageData.workouts.map((workout) => (
                          <tr
                            key={workout.id}
                            className='border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          >
                            <td className='py-2 px-3'>
                              <Link
                                href={`/workouts/${workout.id}`}
                                className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors'
                              >
                                {workout.name}
                              </Link>
                            </td>
                            <td className='py-2 px-3 text-gray-600 dark:text-gray-400'>
                              {format(new Date(workout.date), 'MMM d, yyyy')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Templates Table */}
              {usageData.templates.length > 0 && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-3'>
                    Templates ({usageData.templates.length})
                  </h3>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-gray-200 dark:border-gray-700'>
                          <th className='text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300'>
                            Template Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageData.templates.map((template) => (
                          <tr
                            key={template.id}
                            className='border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          >
                            <td className='py-2 px-3'>
                              <Link
                                href={`/templates/${template.id}`}
                                className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer transition-colors'
                              >
                                {template.name}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ExerciseUsageSection;
