import React from 'react';
import { useRouter } from 'next/navigation';

interface SupersetButtonProps {
  workoutId: string;
  exerciseId1: string;
  exerciseId2: string;
}

const SupersetButton: React.FC<SupersetButtonProps> = ({
  workoutId,
  exerciseId1,
  exerciseId2,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/workouts/${workoutId}/superset?ex1=${exerciseId1}&ex2=${exerciseId2}`);
  };

  return (
    <button
      onClick={handleClick}
      className='p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full active:scale-90 transition-all cursor-pointer'
      aria-label='Create superset with adjacent exercises'
      title='Superset'>
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 4v16m8-8H4'
        />
      </svg>
    </button>
  );
};

export default SupersetButton;
