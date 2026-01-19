'use client';

import React from 'react';
import Link from 'next/link';
import { Exercise, Set } from '@/types/database';
import SectionLoader from '@/components/SectionLoader';

interface ExerciseHeaderProps {
  exercise: Exercise;
  bestSet: Set | null;
  loadingBestSet: boolean;
  bestSetError?: string | null;
  headingLevel?: 'h1' | 'h2';
}

const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  exercise,
  bestSet,
  loadingBestSet,
  bestSetError,
  headingLevel = 'h1',
}) => {
  const HeadingTag = headingLevel;
  const headingClass = headingLevel === 'h1'
    ? 'text-3xl font-bold text-gray-900 dark:text-white'
    : 'text-2xl font-bold text-gray-900 dark:text-white';

  return (
    <div className='mb-4'>
      <div className='flex items-center gap-3 mb-3'>
        <HeadingTag className={headingClass}>
          {exercise.name}
        </HeadingTag>
        <Link
          href={`/exercises/${exercise.id}`}
          className='p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer transition-colors'
          title='View exercise details'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
            />
          </svg>
        </Link>
      </div>
      <div className='mb-3'>
        <span className='inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-lg font-bold'>
          {exercise.pattern}
        </span>
      </div>
      <SectionLoader
        loading={loadingBestSet}
        error={bestSetError}
        skeleton='text'
        skeletonLines={1}
        isEmpty={!bestSet}>
        {bestSet && (
          <p className='text-lg text-gray-600 dark:text-gray-400'>
            Best Set:{' '}
            <span className='font-semibold'>
              {bestSet.weight}kg × {bestSet.reps}reps
            </span>
          </p>
        )}
      </SectionLoader>
    </div>
  );
};

export default ExerciseHeader;
