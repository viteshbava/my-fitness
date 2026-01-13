import React from 'react';
import ModalOverlay from './ModalOverlay';

interface RenameWorkoutModalProps {
  isOpen: boolean;
  workoutName: string;
  onWorkoutNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const RenameWorkoutModal: React.FC<RenameWorkoutModalProps> = ({
  isOpen,
  workoutName,
  onWorkoutNameChange,
  onSave,
  onCancel,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onCancel} preventBackgroundClick={true}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
          Rename Workout
        </h2>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Workout Name
          </label>
          <input
            type='text'
            value={workoutName || ''}
            onChange={(e) => onWorkoutNameChange(e.target.value)}
            placeholder='Enter workout name'
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className='flex flex-col space-y-2'>
          <button
            onClick={onSave}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer'>
            Save
          </button>
          <button
            onClick={onCancel}
            className='w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors cursor-pointer'>
            Cancel
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default RenameWorkoutModal;
