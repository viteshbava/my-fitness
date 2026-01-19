'use client';

import React from 'react';
import { Set } from '@/types/database';
import Button from '@/components/Button';

interface SetsTableProps {
  sets: Set[];
  isEditing: boolean;
  previousSets?: Set[];
  exerciseName?: string;
  onUpdateSet?: (index: number, field: 'weight' | 'reps', value: string) => void;
  onAddSet?: () => void;
  showAddButton?: boolean;
}

const SetsTable: React.FC<SetsTableProps> = ({
  sets,
  isEditing,
  previousSets = [],
  exerciseName,
  onUpdateSet,
  onAddSet,
  showAddButton = true,
}) => {
  const getPlaceholder = (setNumber: number, field: 'weight' | 'reps'): string => {
    if (!previousSets || previousSets.length === 0) return '0';

    const previousSet = previousSets.find((s: Set) => s.set_number === setNumber);
    if (!previousSet) return '0';

    const value = field === 'weight' ? previousSet.weight : previousSet.reps;
    return value !== null && value !== undefined ? value.toString() : '0';
  };

  return (
    <div className='mb-6 last:mb-0'>
      {exerciseName && (
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
          {exerciseName}
        </h3>
      )}
      {sets.length === 0 ? (
        <p className='text-gray-500 dark:text-gray-400'>No sets recorded yet</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 dark:border-gray-700'>
                <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Set
                </th>
                <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Weight (kg)
                </th>
                <th className='text-left py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Reps
                </th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set, index) => (
                <tr key={index} className='border-b border-gray-100 dark:border-gray-700'>
                  <td className='py-2 px-4 text-gray-900 dark:text-white'>{set.set_number}</td>
                  <td className='py-2 px-4'>
                    {isEditing ? (
                      <input
                        type='number'
                        inputMode='numeric'
                        step='0.5'
                        min='0'
                        value={set.weight ?? ''}
                        onChange={(e) => onUpdateSet?.(index, 'weight', e.target.value)}
                        className='w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                        placeholder={getPlaceholder(set.set_number, 'weight')}
                      />
                    ) : (
                      <span className='text-gray-900 dark:text-white'>{set.weight ?? '-'}</span>
                    )}
                  </td>
                  <td className='py-2 px-4'>
                    {isEditing ? (
                      <input
                        type='number'
                        inputMode='numeric'
                        step='1'
                        min='0'
                        value={set.reps ?? ''}
                        onChange={(e) => onUpdateSet?.(index, 'reps', e.target.value)}
                        className='w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                        placeholder={getPlaceholder(set.set_number, 'reps')}
                      />
                    ) : (
                      <span className='text-gray-900 dark:text-white'>{set.reps ?? '-'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isEditing && showAddButton && onAddSet && (
        <div className='mt-3'>
          <Button onClick={onAddSet} variant='primary' size='sm'>
            Add Set
          </Button>
        </div>
      )}
    </div>
  );
};

export default SetsTable;
