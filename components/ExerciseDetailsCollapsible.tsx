'use client';

import React, { useState } from 'react';
import { Exercise } from '@/types/database';

interface ExerciseDetailsCollapsibleProps {
  exercise: Exercise;
  defaultOpen?: boolean;
}

const ExerciseDetailsCollapsible: React.FC<ExerciseDetailsCollapsibleProps> = ({
  exercise,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center justify-between text-left cursor-pointer hover:opacity-80 active:opacity-60 active:scale-[0.99] transition-all'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Exercise Details
        </h3>
        <svg
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
          <div>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Pattern</p>
            <p className='text-lg font-semibold text-gray-900 dark:text-white'>
              {exercise.pattern}
            </p>
          </div>
          <div>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Primary Body Part
            </p>
            <p className='text-lg text-gray-900 dark:text-white'>
              {exercise.primary_body_part}
            </p>
          </div>
          <div>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Secondary Body Part
            </p>
            <p className='text-lg text-gray-900 dark:text-white'>
              {exercise.secondary_body_part}
            </p>
          </div>
          <div>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Equipment</p>
            <p className='text-lg text-gray-900 dark:text-white'>
              {exercise.equipment}
            </p>
          </div>
          <div>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Movement Type
            </p>
            <p className='text-lg text-gray-900 dark:text-white'>
              {exercise.movement_type}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetailsCollapsible;
