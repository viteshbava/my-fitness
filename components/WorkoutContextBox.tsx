'use client';

import React from 'react';
import { format } from 'date-fns';

interface WorkoutContextBoxProps {
  workoutName: string;
  workoutDate: string;
}

const WorkoutContextBox: React.FC<WorkoutContextBoxProps> = ({
  workoutName,
  workoutDate,
}) => {
  return (
    <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-blue-600 dark:text-blue-400 font-medium'>Workout</p>
          <h2 className='text-xl font-semibold text-blue-900 dark:text-blue-100'>
            {workoutName}
          </h2>
        </div>
        <div className='text-right'>
          <p className='text-sm text-blue-600 dark:text-blue-400 font-medium'>Date</p>
          <p className='text-lg text-blue-900 dark:text-blue-100'>
            {format(new Date(workoutDate), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutContextBox;
