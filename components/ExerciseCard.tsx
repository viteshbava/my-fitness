import React from 'react';
import { Exercise } from '@/types/database';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onClick,
  href,
  className = '',
}) => {
  const baseClasses =
    'block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg active:shadow active:scale-[0.98] transition-all p-6 cursor-pointer';

  const content = (
    <>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {exercise.name}
        </h3>
        {exercise.is_mastered && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Learnt
          </span>
        )}
      </div>
      {/* Pattern - Prominent */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-base font-semibold">
          {exercise.pattern}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <span className="font-medium">Primary:</span> {exercise.primary_body_part}
        </p>
        <p>
          <span className="font-medium">Equipment:</span> {exercise.equipment}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className={`${baseClasses} ${className}`}>
        {content}
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`}>{content}</div>;
};

export default ExerciseCard;
