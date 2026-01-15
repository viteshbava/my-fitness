import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';

interface SectionLoaderProps {
  loading: boolean;
  error?: string | null;
  skeleton?: 'text' | 'title' | 'card' | 'table' | 'chart';
  skeletonLines?: number;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable section loader component that handles loading, error, and empty states.
 * Use this to wrap sections that load data progressively.
 */
const SectionLoader: React.FC<SectionLoaderProps> = ({
  loading,
  error,
  skeleton = 'text',
  skeletonLines = 3,
  emptyMessage,
  isEmpty = false,
  children,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={className}>
        <LoadingSkeleton variant={skeleton} lines={skeletonLines} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
      </div>
    );
  }

  if (isEmpty && emptyMessage) {
    return (
      <div className={className}>
        <p className='text-gray-500 dark:text-gray-400 text-sm'>{emptyMessage}</p>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default SectionLoader;
