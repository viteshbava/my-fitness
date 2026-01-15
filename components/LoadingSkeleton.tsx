import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'table' | 'chart';
  lines?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  lines = 3,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  switch (variant) {
    case 'title':
      return <div className={`${baseClasses} h-8 w-3/4 ${className}`}></div>;

    case 'text':
      return (
        <div className={`space-y-3 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`${baseClasses} h-4 ${
                i === lines - 1 ? 'w-2/3' : 'w-full'
              }`}></div>
          ))}
        </div>
      );

    case 'card':
      return (
        <div className={`${baseClasses} h-32 w-full ${className}`}>
          <div className='p-4 space-y-3'>
            <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4'></div>
            <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2'></div>
          </div>
        </div>
      );

    case 'table':
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className='flex gap-4'>
              <div className={`${baseClasses} h-10 w-16`}></div>
              <div className={`${baseClasses} h-10 flex-1`}></div>
              <div className={`${baseClasses} h-10 w-24`}></div>
            </div>
          ))}
        </div>
      );

    case 'chart':
      return (
        <div className={`${baseClasses} h-64 w-full ${className}`}>
          <div className='flex items-end justify-around h-full p-4 gap-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='bg-gray-300 dark:bg-gray-600 rounded-t w-full'
                style={{ height: `${Math.random() * 60 + 40}%` }}></div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className={`${baseClasses} h-4 w-full ${className}`}></div>;
  }
};

export default LoadingSkeleton;
